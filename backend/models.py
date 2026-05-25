import uuid
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    wb_api_token = Column(String, nullable=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    
    # Subscription & Referral Fields
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    tariff_type = Column(String, default="trial", nullable=True)
    trial_activated = Column(Boolean, default=False, nullable=True)
    referred_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String, unique=True, index=True, nullable=True)

    rules = relationship("Rule", back_populates="owner")
    reviews = relationship("Review", back_populates="owner")
    nm_ids = relationship("NmIDs", back_populates="owner")
    notification_methods = relationship("NotificationMethod", back_populates="owner")

    @property
    def has_active_subscription(self) -> bool:
        if not self.subscription_expires_at:
            return False
        import datetime
        now = datetime.datetime.now(self.subscription_expires_at.tzinfo) if self.subscription_expires_at.tzinfo else datetime.datetime.now()
        return self.subscription_expires_at > now

    @property
    def rules_count(self) -> int:
        return len(self.rules)

    @property
    def notification_methods_count(self) -> int:
        return len(self.notification_methods)


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
    status = Column(
        String, default="pending"
    )  # 'pending', 'auto-answered', 'manual-review'
    auto_answer_text = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Premium Review Metadata fields
    user_name = Column(String, nullable=True)
    pros = Column(String, nullable=True)
    cons = Column(String, nullable=True)
    photos_count = Column(Integer, default=0, nullable=True)
    has_video = Column(Boolean, default=False, nullable=True)

    owner = relationship("User", back_populates="reviews")


class NmIDs(Base):
    __tablename__ = "nm_ids"

    id = Column(Integer, primary_key=True, index=True)
    nm_id = Column(String, unique=True, index=True)
    product_name = Column(String)
    user_d_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="nm_ids")


class NotificationMethod(Base):
    __tablename__ = "notification_methods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # 'email', 'telegram', 'max'
    value = Column(String)  # email address, or telegram/max chat ID or code
    is_active = Column(Boolean, default=True)

    owner = relationship("User", back_populates="notification_methods")
