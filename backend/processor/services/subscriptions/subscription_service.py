from datetime import datetime, timedelta, timezone
from models import User
from processor.utils.datetime import normalize_dt


class SubscriptionService:
    @staticmethod
    def has_active_subscription(user: User, now_utc: datetime) -> bool:
        expires_at = normalize_dt(user.subscription_expires_at)
        return bool(expires_at and expires_at > now_utc)

    @staticmethod
    def has_active_spam_subscription(user: User, now_utc: datetime) -> bool:
        expires_at = normalize_dt(user.respam_subscription_expires_at)
        return bool(expires_at and expires_at > now_utc)

    @staticmethod
    def expires_tomorrow(user: User, now_utc: datetime) -> bool:
        expires_at = normalize_dt(user.subscription_expires_at)
        if not expires_at or expires_at <= now_utc:
            return False
        tomorrow_date = (now_utc + timedelta(days=1)).date()
        return expires_at.date() == tomorrow_date
