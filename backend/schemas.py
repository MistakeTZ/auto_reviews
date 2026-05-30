from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str
    referral_code: Optional[str] = None
    promo_code: Optional[str] = None


class User(UserBase):
    id: int
    wb_api_token: Optional[str] = None
    sid: Optional[str] = None
    uuid: str
    subscription_expires_at: Optional[datetime] = None
    tariff_type: Optional[str] = None
    trial_activated: Optional[bool] = None
    referral_code: Optional[str] = None
    referred_by_id: Optional[int] = None
    has_active_subscription: bool = False
    rules_count: int = 0
    notification_methods_count: int = 0

    class Config:
        from_attributes = True


class UserPublic(UserBase):
    id: int
    sid: Optional[str] = None
    uuid: str
    subscription_expires_at: Optional[datetime] = None
    tariff_type: Optional[str] = None
    trial_activated: Optional[bool] = None
    referral_code: Optional[str] = None
    referred_by_id: Optional[int] = None
    has_active_subscription: bool = False
    rules_count: int = 0
    notification_methods_count: int = 0
    has_wb_api_token: bool = False

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class RuleBase(BaseModel):
    name: str
    target: str
    nm_id: Optional[str] = None
    condition_rating_operator: str
    condition_rating: Optional[int] = None
    condition_keyword: Optional[str] = None
    action_text: str
    action_type: str = "template"
    with_video: Optional[bool] = False
    with_photo: Optional[bool] = False
    with_name: Optional[bool] = False
    priority: Optional[int] = 0
    send_notification: Optional[bool] = False
    is_edited_feedback: Optional[bool] = False


class RuleCreate(RuleBase):
    pass


class RuleUpdate(BaseModel):
    name: Optional[str] = None
    target: Optional[str] = None
    nm_id: Optional[str] = None
    condition_rating_operator: Optional[str] = None
    condition_rating: Optional[int] = None
    condition_keyword: Optional[str] = None
    action_text: Optional[str] = None
    action_type: Optional[str] = None
    with_video: Optional[bool] = None
    with_photo: Optional[bool] = None
    with_name: Optional[bool] = None
    priority: Optional[int] = None
    send_notification: Optional[bool] = None
    is_edited_feedback: Optional[bool] = None


class Rule(RuleBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class ReviewBase(BaseModel):
    wb_review_id: str
    nm_id: str
    product_name: str
    rating: int
    text: str
    date: str
    status: str
    auto_answer_text: Optional[str] = None
    editable: Optional[bool] = True
    user_name: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    photos_count: Optional[int] = 0
    has_video: Optional[bool] = False
    is_edited_feedback: Optional[bool] = False


class ReviewCreate(ReviewBase):
    pass


class Review(ReviewBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    wb_question_id: str
    nm_id: str
    product_name: str
    text: str
    date: str
    editable: bool = True
    state: Optional[str] = None
    answer_text: Optional[str] = None
    user_name: Optional[str] = None


class QuestionCreate(QuestionBase):
    pass


class Question(QuestionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class NotificationMethodBase(BaseModel):
    type: str  # 'email', 'telegram', 'max'
    value: str
    is_active: Optional[bool] = True


class NotificationMethodCreate(NotificationMethodBase):
    pass


class NotificationMethod(NotificationMethodBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
