import uuid
from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    func,
    BigInteger,
)
from sqlalchemy.orm import relationship
from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    wb_api_token = Column(String, nullable=True)
    sid = Column(String, nullable=True, index=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    wb_chat_api_token = Column(String, nullable=True)
    notify_answers_in_chats = Column(Boolean, default=True, nullable=False)
    notify_all_messages = Column(Boolean, default=False, nullable=False)

    # Subscription & Referral Fields
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    tariff_type = Column(String, default=None, nullable=True)
    trial_activated = Column(Boolean, default=False, nullable=True)
    registration_bonus_days = Column(Integer, default=0, nullable=False)

    # reSpam Subscription & Referral Fields
    respam_subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    respam_tariff_type = Column(String, default=None, nullable=True)
    respam_trial_activated = Column(Boolean, default=False, nullable=True)
    respam_registration_bonus_days = Column(Integer, default=0, nullable=False)

    # Referral Metadata
    referral_source = Column(String, default="reanswer", nullable=True)
    referred_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String, unique=True, index=True, nullable=True)
    question_answer_mode = Column(String, default="manual", nullable=False)
    question_answer_prompt = Column(
        Text,
        nullable=False,
        default="""Вы являетесь помощником службы поддержки для продавца Wildberries.
Сгенерируйте короткий, вежливый и полезный ответ на этот вопрос клиента.
Возвращайте только текст ответа без кавычек, разметки, меток или объяснений.
Не используй переносы строк и не пиши слишком длинные ответы.
Используйте тот же язык, что и в вопросе.""",
    )

    rules = relationship("Rule", back_populates="owner")
    reviews = relationship("Review", back_populates="owner")
    questions = relationship("Question", back_populates="owner")
    nm_ids = relationship("NmIDs", back_populates="owner")
    notification_methods = relationship("NotificationMethod", back_populates="owner")

    @property
    def has_active_subscription(self) -> bool:
        if not self.subscription_expires_at:
            return False
        import datetime

        now = (
            datetime.datetime.now(self.subscription_expires_at.tzinfo)
            if self.subscription_expires_at.tzinfo
            else datetime.datetime.now()
        )
        return self.subscription_expires_at > now

    @property
    def has_active_spam_subscription(self) -> bool:
        if not self.respam_subscription_expires_at:
            return False
        import datetime

        now = (
            datetime.datetime.now(self.respam_subscription_expires_at.tzinfo)
            if self.respam_subscription_expires_at.tzinfo
            else datetime.datetime.now()
        )
        return self.respam_subscription_expires_at > now

    @property
    def rules_count(self) -> int:
        return len(self.rules)

    @property
    def notification_methods_count(self) -> int:
        return len(self.notification_methods)

    @property
    def has_wb_api_token(self) -> bool:
        return bool((self.wb_api_token or "").strip())

    @property
    def has_wb_chat_api_token(self) -> bool:
        return bool((self.wb_chat_api_token or "").strip())


class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    target = Column(String)  # 'general' or 'specific_nm'
    nm_id = Column(String, nullable=True)
    condition_rating_operator = Column(String)  # 'exact', 'less_than', 'more_than'
    condition_rating = Column(Integer, nullable=True)
    condition_keyword = Column(String, nullable=True)
    action_text = Column(String)
    action_type = Column(String, default="template")
    with_video = Column(Boolean, default=False, nullable=True)
    with_photo = Column(Boolean, default=False, nullable=True)
    with_name = Column(Boolean, default=False, nullable=True)
    priority = Column(Integer, default=0, nullable=True)
    send_notification = Column(Boolean, default=False, nullable=True)
    is_edited_feedback = Column(Boolean, default=False, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="rules")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    wb_review_id = Column(String, index=True)
    nm_id = Column(String)
    product_name = Column(String)
    rating = Column(Integer)
    text = Column(String)
    date = Column(String)
    status = Column(String, default="none")  # 'none', 'auto', 'manually', 'fetched'
    auto_answer_text = Column(String, nullable=True)
    editable = Column(Boolean, default=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Premium Review Metadata fields
    user_name = Column(String, nullable=True)
    pros = Column(String, nullable=True)
    cons = Column(String, nullable=True)
    photos_count = Column(Integer, default=0, nullable=True)
    has_video = Column(Boolean, default=False, nullable=True)
    is_edited_feedback = Column(Boolean, default=False, nullable=True)

    owner = relationship("User", back_populates="reviews")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    wb_question_id = Column(String, index=True)
    nm_id = Column(String)
    product_name = Column(String)
    text = Column(String)
    date = Column(String)
    answer_text = Column(String, nullable=True)
    proposed_answer_text = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_name = Column(String, nullable=True)
    editable = Column(Boolean, default=True, nullable=True)
    state = Column(String, default="none")

    owner = relationship("User", back_populates="questions")


class NmIDs(Base):
    __tablename__ = "nm_ids"

    id = Column(Integer, primary_key=True, index=True)
    nm_id = Column(String, unique=True, index=True)
    product_name = Column(String)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    characteristics = Column(Text, nullable=True)
    user_d_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="nm_ids")


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    days_on_registration = Column(Integer, default=0)  # Days added on registration
    topup_days = Column(Integer, default=0)  # Days added on subscription top-up
    expires_at = Column(
        DateTime(timezone=True), nullable=True
    )  # Null means no expiration
    max_uses = Column(Integer, nullable=True)  # Null means unlimited
    used_count = Column(Integer, default=0)


class NotificationMethod(Base):
    __tablename__ = "notification_methods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # 'email', 'telegram', 'max'
    value = Column(String)  # email address, or telegram/max chat ID or code
    is_active = Column(Boolean, default=True)

    owner = relationship("User", back_populates="notification_methods")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    yookassa_payment_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(String)
    status = Column(String)  # 'pending', 'succeeded', 'failed'
    service_type = Column(String, nullable=True)  # 'reanswer', 'respam', 'both'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User")


class SpamRule(Base):
    __tablename__ = "spam_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    chat_id = Column(String, index=True)
    client_name = Column(String, nullable=True)
    reply_sign = Column(String, nullable=True)
    frequency_type = Column(String, default="hours")  # 'hours' or 'days'
    interval_days = Column(Integer, default=1, nullable=True)
    send_hours = Column(String, default="9,13,17,21")
    random_offset_minutes = Column(Integer, default=0)
    spam_endlessly = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_sent_at = Column(DateTime(timezone=True), nullable=True)
    last_sent_message_timestamp = Column(BigInteger, default=0)  # WB addTime response

    owner = relationship("User")
    templates = relationship("SpamMessageTemplate", secondary="spam_rule_templates")
    chats = relationship(
        "SpamRuleChat", back_populates="rule", cascade="all, delete-orphan"
    )


class SpamRuleChat(Base):
    __tablename__ = "spam_rule_chats"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("spam_rules.id", ondelete="CASCADE"))
    chat_id = Column(String, index=True)
    client_name = Column(String, nullable=True)
    reply_sign = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    last_sent_at = Column(DateTime(timezone=True), nullable=True)
    last_sent_message_timestamp = Column(BigInteger, default=0)

    rule = relationship("SpamRule", back_populates="chats")


class SpamMessageTemplate(Base):
    __tablename__ = "spam_message_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rule_id = Column(Integer, ForeignKey("spam_rules.id"), nullable=True)
    text = Column(Text)
    start_hour = Column(Integer, nullable=True)
    end_hour = Column(Integer, nullable=True)
    is_global = Column(Boolean, default=True)

    owner = relationship("User")
    rule = relationship("SpamRule")


class SpamRuleTemplate(Base):
    __tablename__ = "spam_rule_templates"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("spam_rules.id"))
    template_id = Column(Integer, ForeignKey("spam_message_templates.id"))


class SpamSentMessage(Base):
    __tablename__ = "spam_sent_messages"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("spam_rules.id"))
    text = Column(Text)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    chat_id = Column(String, index=True)
    add_time = Column(BigInteger, nullable=True)

    rule = relationship("SpamRule")


class SpamLastFetchedEventTime(Base):
    __tablename__ = "spam_last_fetched_event_time"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    last_event_time_ms = Column(BigInteger, nullable=False)

    owner = relationship("User")
