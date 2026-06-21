import json
from typing import Optional

from sqlalchemy.orm import Session
import models
import schemas
from auth import get_password_hash
from prompts import DEFAULT_GPT_RULE_PROMPT
import uuid
from datetime import datetime, timezone, timedelta


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_sid(db: Session, sid: str):
    return db.query(models.User).filter(models.User.sid == sid).first()


def get_user_by_referral_code(db: Session, referral_code: str):
    return (
        db.query(models.User).filter(models.User.referral_code == referral_code).first()
    )


def get_promo_code_by_code(db: Session, code: str):
    normalized = (code or "").strip()
    if not normalized:
        return None
    return (
        db.query(models.PromoCode)
        .filter(func.lower(models.PromoCode.code) == normalized.lower())
        .first()
    )


def validate_registration_promocode(db: Session, code: str):
    normalized = (code or "").strip()
    if not normalized:
        return None, "Promo code is empty"

    promo = get_promo_code_by_code(db, normalized)
    if not promo:
        return None, "Promo code is invalid"

    if promo.expires_at:
        now = datetime.now(timezone.utc)
        expires_at = promo.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            return None, "Promo code has expired"

    if promo.max_uses is not None and (promo.used_count or 0) >= promo.max_uses:
        return None, "Promo code usage limit reached"

    return promo, None


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    referred_by_id = None
    registration_bonus_days = 0

    if user.referral_code:
        referrer = get_user_by_referral_code(db, user.referral_code.strip())
        if not referrer:
            raise ValueError("Invalid referral code")
        referred_by_id = referrer.id

    if user.promo_code:
        promo, promo_error = validate_registration_promocode(db, user.promo_code)
        if promo_error:
            raise ValueError(promo_error)
        registration_bonus_days = int(promo.days_on_registration or 0)
        promo.used_count = int(promo.used_count or 0) + 1
        db.add(promo)

    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        referral_code=str(uuid.uuid4())[:8],
        registration_bonus_days=registration_bonus_days,
        referred_by_id=referred_by_id,
    )
    db.add(db_user)
    db.flush()

    # Create default GPT rule that applies to all reviews for new users.
    db_default_rule = models.Rule(
        name="GPT для всех отзывов",
        target="general",
        nm_id=None,
        condition_rating_operator="more_than",
        condition_rating=None,
        condition_keyword=None,
        action_text=DEFAULT_GPT_RULE_PROMPT,
        action_type="gpt",
        with_video=False,
        with_photo=False,
        with_name=False,
        priority=1,
        send_notification=False,
        is_edited_feedback=False,
        is_active=False,
        user_id=db_user.id,
    )
    db.add(db_default_rule)

    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_token(db: Session, user_id: int, token: str, sid: Optional[str] = None):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.wb_api_token = token
        db_user.sid = sid

        # Trial starts after token input
        if not db_user.trial_activated:
            db_user.trial_activated = True
            now = datetime.now(timezone.utc)
            # september_first = datetime(2026, 9, 1, 9, tzinfo=timezone.utc)

            trial_days = max(int(db_user.registration_bonus_days or 0), 0) + 30
            db_user.subscription_expires_at = now + timedelta(days=trial_days)
            db_user.registration_bonus_days = 0
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


def update_user_question_answer_settings(
    db: Session,
    user_id: int,
    question_answer_mode: Optional[str] = None,
    question_answer_prompt: Optional[str] = None,
):
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    if question_answer_mode is not None:
        normalized_mode = str(question_answer_mode).strip().lower()
        allowed_modes = {"none", "manual", "confirm", "auto"}
        if normalized_mode not in allowed_modes:
            raise ValueError("Invalid question answer mode")
        db_user.question_answer_mode = normalized_mode

    if question_answer_prompt is not None:
        db_user.question_answer_prompt = str(question_answer_prompt).strip() or None

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
    def normalize_review_status(value: str | None):
        if value == "auto-answered":
            return "auto"
        if value == "manual-review":
            return "manually"
        if value == "pending":
            return "none"
        return value

    query = db.query(models.Review).filter(models.Review.user_id == user_id)
    if status and status != "all":
        query = query.filter(models.Review.status == normalize_review_status(status))
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
    def normalize_review_status(value: str | None):
        if value == "auto-answered":
            return "auto"
        if value == "manual-review":
            return "manually"
        if value == "pending":
            return "none"
        return value

    query = db.query(models.Review).filter(models.Review.user_id == user_id)
    if status and status != "all":
        query = query.filter(models.Review.status == normalize_review_status(status))

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
    payload = review.model_dump()
    if payload.get("status") == "auto-answered":
        payload["status"] = "auto"
    elif payload.get("status") == "manual-review":
        payload["status"] = "manually"
    elif payload.get("status") == "pending":
        payload["status"] = "none"

    db_review = models.Review(**payload, user_id=user_id)
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
        if review_data.status == "auto-answered":
            db_review.status = "auto"
        elif review_data.status == "manual-review":
            db_review.status = "manually"
        elif review_data.status == "pending":
            db_review.status = "none"
        else:
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
        payload = review_data.model_dump()
        if payload.get("status") == "auto-answered":
            payload["status"] = "auto"
        elif payload.get("status") == "manual-review":
            payload["status"] = "manually"
        elif payload.get("status") == "pending":
            payload["status"] = "none"

        db_review = models.Review(**payload, user_id=user_id)
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
        if status == "auto-answered":
            db_review.status = "auto"
        elif status == "manual-review":
            db_review.status = "manually"
        elif status == "pending":
            db_review.status = "none"
        else:
            db_review.status = status
        db_review.auto_answer_text = auto_answer_text
        db_review.editable = editable
        db.commit()
        db.refresh(db_review)
    return db_review


def get_questions(db: Session, user_id: int, include_answered: bool = True):
    query = db.query(models.Question).filter(models.Question.user_id == user_id)
    if not include_answered:
        query = query.filter(
            (models.Question.answer_text.is_(None))
            | (models.Question.answer_text == "")
        )
    return query.order_by(models.Question.id.desc()).all()


def upsert_question(db: Session, question_data: schemas.QuestionCreate, user_id: int):
    db_question = (
        db.query(models.Question)
        .filter(
            models.Question.wb_question_id == question_data.wb_question_id,
            models.Question.user_id == user_id,
        )
        .first()
    )
    question_exists = bool(db_question)

    if db_question:
        db_question.nm_id = question_data.nm_id
        db_question.product_name = question_data.product_name
        db_question.text = question_data.text
        db_question.date = question_data.date
        if question_data.state is not None and str(question_data.state).strip() != "":
            db_question.state = question_data.state
        db_question.editable = question_data.editable
        db_question.answer_text = question_data.answer_text
        db_question.proposed_answer_text = question_data.proposed_answer_text
        db_question.user_name = question_data.user_name
    else:
        payload = question_data.model_dump()
        if not payload.get("state"):
            payload["state"] = "none"
        db_question = models.Question(**payload, user_id=user_id)
        db.add(db_question)

    db.commit()
    db.refresh(db_question)
    return question_exists, db_question


def get_nm_ids(db: Session, user_id: int):
    return db.query(models.NmIDs).filter(models.NmIDs.user_d_id == user_id).all()


def clear_nm_ids(db: Session, user_id: int):
    db.query(models.NmIDs).filter(models.NmIDs.user_d_id == user_id).delete()
    db.commit()


def upsert_nm_ids_bulk(db: Session, user_id: int, products: list[dict]):
    def apply_product_payload(row: models.NmIDs, product: dict):
        row.product_name = str(product.get("name") or "").strip()
        row.title = str(product.get("title") or row.product_name or "").strip() or None

        description = product.get("description")
        row.description = str(description).strip() if description is not None else None

        if "photo_url" in product and product.get("photo_url"):
            row.photo_url = str(product.get("photo_url")).strip()

        characteristics = product.get("characteristics")
        if isinstance(characteristics, list):
            row.characteristics = json.dumps(characteristics, ensure_ascii=False)

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

        if nm_id in existing_for_user:
            apply_product_payload(existing_for_user[nm_id], product)
        elif nm_id in existing_global:
            existing_global[nm_id].user_d_id = user_id
            apply_product_payload(existing_global[nm_id], product)
        else:
            name = str(product.get("name") or "").strip()
            characteristics = product.get("characteristics")
            db.add(
                models.NmIDs(
                    nm_id=nm_id,
                    product_name=name,
                    title=str(product.get("title") or name or "").strip() or None,
                    description=(
                        str(product.get("description")).strip()
                        if product.get("description") is not None
                        else None
                    ),
                    photo_url=(
                        str(product.get("photo_url")).strip()
                        if product.get("photo_url")
                        else None
                    ),
                    characteristics=(
                        json.dumps(characteristics, ensure_ascii=False)
                        if isinstance(characteristics, list)
                        else None
                    ),
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


def get_spam_rules(db: Session, user_id: int):
    return db.query(models.SpamRule).filter(models.SpamRule.user_id == user_id).all()


def get_spam_rule(db: Session, rule_id: int, user_id: int):
    return (
        db.query(models.SpamRule)
        .filter(models.SpamRule.id == rule_id, models.SpamRule.user_id == user_id)
        .first()
    )


def create_spam_rule(db: Session, user_id: int, rule: schemas.SpamRuleCreate):
    db_rule = models.SpamRule(
        user_id=user_id,
        chat_id=rule.chat_id,
        client_name=rule.client_name,
        reply_sign=rule.reply_sign,
        frequency_type=rule.frequency_type,
        interval_days=rule.interval_days,
        send_hours=rule.send_hours,
        spam_endlessly=rule.spam_endlessly,
        is_active=rule.is_active,
    )
    db.add(db_rule)
    db.flush()

    for tid in rule.template_ids:
        t = (
            db.query(models.SpamMessageTemplate)
            .filter(
                models.SpamMessageTemplate.id == tid,
                models.SpamMessageTemplate.user_id == user_id,
            )
            .first()
        )
        if t:
            jt = models.SpamRuleTemplate(rule_id=db_rule.id, template_id=t.id)
            db.add(jt)

    for text in rule.specific_templates:
        st = models.SpamMessageTemplate(
            user_id=user_id, rule_id=db_rule.id, text=text, is_global=False
        )
        db.add(st)
        db.flush()
        jt = models.SpamRuleTemplate(rule_id=db_rule.id, template_id=st.id)
        db.add(jt)

    db.commit()
    db.refresh(db_rule)
    return db_rule


def update_spam_rule(
    db: Session, rule_id: int, user_id: int, rule_in: schemas.SpamRuleUpdate
):
    db_rule = get_spam_rule(db, rule_id, user_id)
    if not db_rule:
        return None

    for field, val in rule_in.model_dump(exclude_unset=True).items():
        if field not in ("template_ids", "specific_templates"):
            setattr(db_rule, field, val)

    if rule_in.template_ids is not None:
        db.query(models.SpamRuleTemplate).filter(
            models.SpamRuleTemplate.rule_id == rule_id
        ).delete()
        for tid in rule_in.template_ids:
            t = (
                db.query(models.SpamMessageTemplate)
                .filter(
                    models.SpamMessageTemplate.id == tid,
                    models.SpamMessageTemplate.user_id == user_id,
                )
                .first()
            )
            if t:
                jt = models.SpamRuleTemplate(rule_id=db_rule.id, template_id=t.id)
                db.add(jt)

    if rule_in.specific_templates is not None:
        db.query(models.SpamMessageTemplate).filter(
            models.SpamMessageTemplate.rule_id == rule_id,
            models.SpamMessageTemplate.is_global == False,
        ).delete()
        for text in rule_in.specific_templates:
            st = models.SpamMessageTemplate(
                user_id=user_id, rule_id=db_rule.id, text=text, is_global=False
            )
            db.add(st)
            db.flush()
            jt = models.SpamRuleTemplate(rule_id=db_rule.id, template_id=st.id)
            db.add(jt)

    db.commit()
    db.refresh(db_rule)
    return db_rule


def delete_spam_rule(db: Session, rule_id: int, user_id: int):
    db_rule = get_spam_rule(db, rule_id, user_id)
    if db_rule:
        db.query(models.SpamRuleTemplate).filter(
            models.SpamRuleTemplate.rule_id == rule_id
        ).delete()
        db.query(models.SpamMessageTemplate).filter(
            models.SpamMessageTemplate.rule_id == rule_id,
            models.SpamMessageTemplate.is_global == False,
        ).delete()
        db.query(models.SpamSentMessage).filter(
            models.SpamSentMessage.rule_id == rule_id
        ).delete()
        db.delete(db_rule)
        db.commit()
        return True
    return False


def get_spam_templates(db: Session, user_id: int):
    return (
        db.query(models.SpamMessageTemplate)
        .filter(
            models.SpamMessageTemplate.user_id == user_id,
            models.SpamMessageTemplate.is_global == True,
        )
        .all()
    )


def create_spam_template(
    db: Session, user_id: int, template: schemas.SpamMessageTemplateCreate
):
    db_template = models.SpamMessageTemplate(
        user_id=user_id,
        text=template.text,
        start_hour=template.start_hour,
        end_hour=template.end_hour,
        is_global=True,
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def update_spam_template(
    db: Session,
    template_id: int,
    user_id: int,
    template_in: schemas.SpamMessageTemplateUpdate,
):
    db_template = (
        db.query(models.SpamMessageTemplate)
        .filter(
            models.SpamMessageTemplate.id == template_id,
            models.SpamMessageTemplate.user_id == user_id,
        )
        .first()
    )
    if not db_template:
        return None
    for field, val in template_in.model_dump(exclude_unset=True).items():
        setattr(db_template, field, val)
    db.commit()
    db.refresh(db_template)
    return db_template


def delete_spam_template(db: Session, template_id: int, user_id: int):
    db_template = (
        db.query(models.SpamMessageTemplate)
        .filter(
            models.SpamMessageTemplate.id == template_id,
            models.SpamMessageTemplate.user_id == user_id,
        )
        .first()
    )
    if db_template:
        db.query(models.SpamRuleTemplate).filter(
            models.SpamRuleTemplate.template_id == template_id
        ).delete()
        db.delete(db_template)
        db.commit()
        return True
    return False


def get_spam_sent_messages(db: Session, user_id: int, limit: int = 50):
    return (
        db.query(models.SpamSentMessage)
        .join(models.SpamRule)
        .filter(models.SpamRule.user_id == user_id)
        .order_by(models.SpamSentMessage.sent_at.desc())
        .limit(limit)
        .all()
    )


def log_spam_sent_message(
    db: Session, rule_id: int, text: str, chat_id: str, add_time: int
):
    msg = models.SpamSentMessage(
        rule_id=rule_id,
        text=text,
        chat_id=chat_id,
        add_time=add_time,
    )
    db.add(msg)
    db.commit()
    return msg


def get_spam_stats(db: Session, user_id: int):
    total_rules = (
        db.query(models.SpamRule).filter(models.SpamRule.user_id == user_id).count()
    )
    active_rules = (
        db.query(models.SpamRule)
        .filter(models.SpamRule.user_id == user_id, models.SpamRule.is_active == True)
        .count()
    )

    total_sent = (
        db.query(models.SpamSentMessage)
        .join(models.SpamRule)
        .filter(models.SpamRule.user_id == user_id)
        .count()
    )

    day_ago = datetime.now(timezone.utc) - timedelta(days=1)
    sent_last_24h = (
        db.query(models.SpamSentMessage)
        .join(models.SpamRule)
        .filter(
            models.SpamRule.user_id == user_id,
            models.SpamSentMessage.sent_at >= day_ago,
        )
        .count()
    )

    return {
        "total_rules": total_rules,
        "active_rules": active_rules,
        "total_sent": total_sent,
        "sent_last_24h": sent_last_24h,
    }
