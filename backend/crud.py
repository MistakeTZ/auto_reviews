from sqlalchemy.orm import Session
import models
import schemas
from auth import get_password_hash
import uuid
from datetime import datetime, timezone, timedelta


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_referral_code(db: Session, referral_code: str):
    return (
        db.query(models.User).filter(models.User.referral_code == referral_code).first()
    )


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    referred_by_id = None

    if user.referral_code:
        referrer = get_user_by_referral_code(db, user.referral_code.strip())
        if not referrer:
            raise ValueError("Invalid referral code")
        referred_by_id = referrer.id

    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        referral_code=str(uuid.uuid4())[:8],
        referred_by_id=referred_by_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_token(db: Session, user_id: int, token: str):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.wb_api_token = token

        # Trial starts after token input
        if not db_user.trial_activated:
            db_user.trial_activated = True
            now = datetime.now(timezone.utc)
            db_user.subscription_expires_at = now + timedelta(days=14)
            db_user.tariff_type = "trial"

            # If referred by someone, extend referrer's subscription by 7 days on full tariff
            if db_user.referred_by_id:
                referrer = get_user(db, db_user.referred_by_id)
                if referrer:
                    ref_now = datetime.now(timezone.utc)
                    current_expiry = referrer.subscription_expires_at
                    if current_expiry and current_expiry.tzinfo is None:
                        current_expiry = current_expiry.replace(tzinfo=timezone.utc)

                    if current_expiry and current_expiry > ref_now:
                        referrer.subscription_expires_at = current_expiry + timedelta(
                            days=7
                        )
                    else:
                        referrer.subscription_expires_at = ref_now + timedelta(days=7)
                    referrer.tariff_type = "full"
                    db.add(referrer)

        db.commit()
        db.refresh(db_user)
    return db_user


def apply_referral_code(db: Session, user_id: int, code: str):
    db_user = get_user(db, user_id)
    if not db_user:
        raise ValueError("User not found")
    if db_user.referred_by_id:
        raise ValueError("You have already applied a referral code")
    if db_user.trial_activated:
        raise ValueError("Cannot apply referral code after trial has started")

    referrer = get_user_by_referral_code(db, code)
    if not referrer:
        raise ValueError("Invalid referral code")
    if referrer.id == db_user.id:
        raise ValueError("You cannot refer yourself")

    db_user.referred_by_id = referrer.id
    db.commit()
    db.refresh(db_user)
    return db_user


def buy_full_subscription(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if not db_user:
        raise ValueError("User not found")

    now = datetime.now(timezone.utc)
    current_expiry = db_user.subscription_expires_at
    if current_expiry and current_expiry.tzinfo is None:
        current_expiry = current_expiry.replace(tzinfo=timezone.utc)

    if current_expiry and current_expiry > now:
        db_user.subscription_expires_at = current_expiry + timedelta(days=30)
    else:
        db_user.subscription_expires_at = now + timedelta(days=30)

    db_user.tariff_type = "full"
    db.commit()
    db.refresh(db_user)
    return db_user


from sqlalchemy import func


def get_rules(db: Session, user_id: int):
    return (
        db.query(models.Rule)
        .filter(models.Rule.user_id == user_id)
        .order_by(models.Rule.priority.desc())
        .all()
    )


def create_rule(db: Session, rule: schemas.RuleCreate, user_id: int):
    max_order = (
        db.query(func.max(models.Rule.priority))
        .filter(models.Rule.user_id == user_id)
        .scalar()
    )
    new_order = (max_order or 0) + 1
    rule_data = rule.model_dump()
    rule_data["priority"] = new_order

    db_rule = models.Rule(**rule_data, user_id=user_id)
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


def update_rule(
    db: Session, rule_id: int, rule_update: schemas.RuleUpdate, user_id: int
):
    db_rule = (
        db.query(models.Rule)
        .filter(models.Rule.id == rule_id, models.Rule.user_id == user_id)
        .first()
    )
    if not db_rule:
        return None
    for key, value in rule_update.model_dump(exclude_unset=True).items():
        setattr(db_rule, key, value)
    db.commit()
    db.refresh(db_rule)
    return db_rule


def delete_rule(db: Session, rule_id: int, user_id: int):
    db_rule = (
        db.query(models.Rule)
        .filter(models.Rule.id == rule_id, models.Rule.user_id == user_id)
        .first()
    )
    if db_rule:
        db.delete(db_rule)
        db.commit()
        return True
    return False


def get_reviews(db: Session, user_id: int, status: str = None):
    query = db.query(models.Review).filter(models.Review.user_id == user_id)
    if status and status != "all":
        query = query.filter(models.Review.status == status)
    return query.order_by(models.Review.id.desc()).all()


def get_review_by_wb_review_id(db: Session, user_id: int, wb_review_id: str):
    return (
        db.query(models.Review)
        .filter(
            models.Review.user_id == user_id,
            models.Review.wb_review_id == wb_review_id,
        )
        .first()
    )


def get_reviews_paginated(
    db: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 10,
    status: str = None,
):
    query = db.query(models.Review).filter(models.Review.user_id == user_id)
    if status and status != "all":
        query = query.filter(models.Review.status == status)

    total = query.count()
    pages = (total + page_size - 1) // page_size if total > 0 else 1

    items = (
        query.order_by(models.Review.date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


def create_review(db: Session, review: schemas.ReviewCreate, user_id: int):
    db_review = models.Review(**review.model_dump(), user_id=user_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def upsert_review(db: Session, review_data: schemas.ReviewCreate, user_id: int):
    db_review = (
        db.query(models.Review)
        .filter(
            models.Review.wb_review_id == review_data.wb_review_id,
            models.Review.user_id == user_id,
        )
        .first()
    )

    if db_review:
        db_review.text = review_data.text
        db_review.rating = review_data.rating
        db_review.status = review_data.status
        db_review.auto_answer_text = review_data.auto_answer_text
        db_review.editable = review_data.editable
        db_review.user_name = review_data.user_name
        db_review.pros = review_data.pros
        db_review.cons = review_data.cons
        db_review.photos_count = review_data.photos_count
        db_review.has_video = review_data.has_video
        db_review.is_edited_feedback = review_data.is_edited_feedback
    else:
        db_review = models.Review(**review_data.model_dump(), user_id=user_id)
        db.add(db_review)

    db.commit()
    db.refresh(db_review)
    return db_review


def update_review_status(
    db: Session,
    review_id: int,
    user_id: int,
    status: str,
    auto_answer_text: str = None,
    editable: bool = True,
):
    db_review = (
        db.query(models.Review)
        .filter(models.Review.id == review_id, models.Review.user_id == user_id)
        .first()
    )
    if db_review:
        db_review.status = status
        db_review.auto_answer_text = auto_answer_text
        db_review.editable = editable
        db.commit()
        db.refresh(db_review)
    return db_review


def get_nm_ids(db: Session, user_id: int):
    return db.query(models.NmIDs).filter(models.NmIDs.user_d_id == user_id).all()


def clear_nm_ids(db: Session, user_id: int):
    db.query(models.NmIDs).filter(models.NmIDs.user_d_id == user_id).delete()
    db.commit()


def upsert_nm_ids_bulk(db: Session, user_id: int, products: list[dict]):
    existing_for_user = {
        row.nm_id: row
        for row in db.query(models.NmIDs)
        .filter(models.NmIDs.user_d_id == user_id)
        .all()
    }
    existing_global = {row.nm_id: row for row in db.query(models.NmIDs).all()}

    for product in products:
        nm_id = str(product.get("nmId") or "").strip()
        if not nm_id:
            continue
        name = str(product.get("name") or "").strip()

        if nm_id in existing_for_user:
            existing_for_user[nm_id].product_name = name
        elif nm_id in existing_global:
            # Table currently has a global unique constraint on nm_id.
            # Keep existing owner and update visible name only.
            existing_global[nm_id].product_name = name
        else:
            db.add(
                models.NmIDs(
                    nm_id=nm_id,
                    product_name=name,
                    user_d_id=user_id,
                )
            )

    db.commit()


def get_notification_methods(db: Session, user_id: int):
    return (
        db.query(models.NotificationMethod)
        .filter(models.NotificationMethod.user_id == user_id)
        .all()
    )


def create_notification_method(
    db: Session, method: schemas.NotificationMethodCreate, user_id: int
):
    db_method = models.NotificationMethod(**method.model_dump(), user_id=user_id)
    db.add(db_method)
    db.commit()
    db.refresh(db_method)
    return db_method


def delete_notification_method(db: Session, method_id: int, user_id: int):
    db_method = (
        db.query(models.NotificationMethod)
        .filter(
            models.NotificationMethod.id == method_id,
            models.NotificationMethod.user_id == user_id,
        )
        .first()
    )
    if db_method:
        db.delete(db_method)
        db.commit()
        return True
    return False
