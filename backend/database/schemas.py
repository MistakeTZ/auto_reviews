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
    referral_source: Optional[str] = "reanswer"


class User(UserBase):
    id: int
    wb_api_token: Optional[str] = None
    sid: Optional[str] = None
    uuid: str
    subscription_expires_at: Optional[datetime] = None
    tariff_type: Optional[str] = None
    trial_activated: Optional[bool] = None
    registration_bonus_days: int = 0
    respam_subscription_expires_at: Optional[datetime] = None
    respam_tariff_type: Optional[str] = None
    respam_trial_activated: Optional[bool] = None
    respam_registration_bonus_days: int = 0
    referral_source: Optional[str] = "reanswer"
    referral_code: Optional[str] = None
    referred_by_id: Optional[int] = None
    question_answer_mode: str = "manual"
    question_answer_prompt: Optional[str] = None
    has_active_subscription: bool = False
    has_active_spam_subscription: bool = False
    rules_count: int = 0
    notification_methods_count: int = 0
    wb_chat_api_token: Optional[str] = None
    notify_answers_in_chats: bool = True
    notify_all_messages: bool = False

    class Config:
        from_attributes = True


class UserPublic(UserBase):
    id: int
    sid: Optional[str] = None
    uuid: str
    subscription_expires_at: Optional[datetime] = None
    tariff_type: Optional[str] = None
    trial_activated: Optional[bool] = None
    registration_bonus_days: int = 0
    respam_subscription_expires_at: Optional[datetime] = None
    respam_tariff_type: Optional[str] = None
    respam_trial_activated: Optional[bool] = None
    respam_registration_bonus_days: int = 0
    referral_source: Optional[str] = "reanswer"
    referral_code: Optional[str] = None
    referred_by_id: Optional[int] = None
    question_answer_mode: str = "manual"
    question_answer_prompt: Optional[str] = None
    has_active_subscription: bool = False
    has_active_spam_subscription: bool = False
    rules_count: int = 0
    notification_methods_count: int = 0
    has_wb_api_token: bool = False
    wb_chat_api_token: Optional[str] = None
    notify_answers_in_chats: bool = True
    notify_all_messages: bool = False
    has_wb_chat_api_token: bool = False

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
    is_active: Optional[bool] = True


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
    is_active: Optional[bool] = None


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
    proposed_answer_text: Optional[str] = None
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


class QuestionAnswerSettingsUpdate(BaseModel):
    question_answer_mode: Optional[str] = None
    question_answer_prompt: Optional[str] = None


class QuestionAnswerSettings(BaseModel):
    question_answer_mode: str = "manual"
    question_answer_prompt: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class SpamMessageTemplateBase(BaseModel):
    text: str
    start_hour: Optional[int] = None
    end_hour: Optional[int] = None
    is_global: bool = True
    rule_id: Optional[int] = None


class SpamMessageTemplateCreate(SpamMessageTemplateBase):
    pass


class SpamMessageTemplateUpdate(BaseModel):
    text: Optional[str] = None
    start_hour: Optional[int] = None
    end_hour: Optional[int] = None
    is_global: Optional[bool] = None
    rule_id: Optional[int] = None


class SpamMessageTemplate(SpamMessageTemplateBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class SpamRuleBase(BaseModel):
    chat_id: str
    client_name: Optional[str] = None
    reply_sign: Optional[str] = None
    frequency_type: str = "hours"  # 'hours' or 'days'
    interval_days: Optional[int] = 1
    send_hours: str = "9,13,17,21"
    spam_endlessly: bool = False
    is_active: bool = True
    last_sent_message_timestamp: int = 0


class SpamRuleCreate(SpamRuleBase):
    template_ids: List[int] = []  # List of global template IDs to link
    specific_templates: List[str] = []  # List of new specific template texts to create


class SpamRuleUpdate(BaseModel):
    chat_id: Optional[str] = None
    client_name: Optional[str] = None
    reply_sign: Optional[str] = None
    frequency_type: Optional[str] = None
    interval_days: Optional[int] = None
    send_hours: Optional[str] = None
    spam_endlessly: Optional[bool] = None
    is_active: Optional[bool] = None
    template_ids: Optional[List[int]] = None
    specific_templates: Optional[List[str]] = None
    last_sent_message_timestamp: Optional[int] = None


class ChatIdWithName(BaseModel):
    chat_id: str
    client_name: Optional[str] = None
    reply_sign: Optional[str] = None


class SpamRulesBulkCreate(BaseModel):
    chats: List[ChatIdWithName]
    frequency_type: str = "hours"
    interval_days: Optional[int] = 1
    send_hours: str = "9,13,17,21"
    spam_endlessly: bool = False
    is_active: bool = True
    template_ids: List[int] = []
    specific_templates: List[str] = []


class SpamRule(SpamRuleBase):
    id: int
    user_id: int
    last_sent_at: Optional[datetime] = None
    last_sent_message_timestamp: int = 0
    templates: List[SpamMessageTemplate] = []

    class Config:
        from_attributes = True


class SpamSentMessage(BaseModel):
    id: int
    rule_id: int
    text: str
    sent_at: datetime
    chat_id: str
    add_time: Optional[int] = None

    class Config:
        from_attributes = True


class SpamSettingsUpdate(BaseModel):
    wb_chat_api_token: Optional[str] = None
    notify_answers_in_chats: Optional[bool] = None
    notify_all_messages: Optional[bool] = None


class MessagesCheckRequest(BaseModel):
    messages: List[str]
