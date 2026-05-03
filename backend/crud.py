from sqlalchemy.orm import Session
from . import models, schemas
from .auth import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_token(db: Session, user_id: int, token: str):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.wb_api_token = token
        db.commit()
        db.refresh(db_user)
    return db_user

def get_rules(db: Session, user_id: int):
    return db.query(models.Rule).filter(models.Rule.user_id == user_id).all()

def create_rule(db: Session, rule: schemas.RuleCreate, user_id: int):
    db_rule = models.Rule(**rule.model_dump(), user_id=user_id)
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def delete_rule(db: Session, rule_id: int, user_id: int):
    db_rule = db.query(models.Rule).filter(models.Rule.id == rule_id, models.Rule.user_id == user_id).first()
    if db_rule:
        db.delete(db_rule)
        db.commit()
        return True
    return False

def get_reviews(db: Session, user_id: int):
    return db.query(models.Review).filter(models.Review.user_id == user_id).all()

def create_review(db: Session, review: schemas.ReviewCreate, user_id: int):
    db_review = models.Review(**review.model_dump(), user_id=user_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def update_review_status(db: Session, review_id: int, user_id: int, status: str, auto_answer_text: str = None):
    db_review = db.query(models.Review).filter(models.Review.id == review_id, models.Review.user_id == user_id).first()
    if db_review:
        db_review.status = status
        if auto_answer_text:
            db_review.auto_answer_text = auto_answer_text
        db.commit()
        db.refresh(db_review)
    return db_review
