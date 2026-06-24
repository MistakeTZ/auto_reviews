from datetime import datetime, timezone, timedelta
from models import SpamRule
from processor.utils.hashing import get_hour_offset


class SpamScheduler:
    MOSCOW_TZ = timezone(timedelta(hours=3))

    @classmethod
    def can_send(cls, rule: SpamRule, now_utc: datetime) -> bool:
        moscow_now = now_utc.astimezone(cls.MOSCOW_TZ)
        current_hour = moscow_now.hour

        allowed_hours = {
            int(h) for h in rule.send_hours.split(",") if h.strip().isdigit()
        }
        if current_hour not in allowed_hours:
            return False

        # Рассчитываем фиксированный минутный сдвиг
        date_str = moscow_now.strftime("%Y-%m-%d")
        offset = get_hour_offset(rule.id, date_str, current_hour)
        if moscow_now.minute < offset:
            return False

        # Проверка лимитов отправки (раз в час)
        if rule.last_sent_at:
            last_sent_moscow = rule.last_sent_at.astimezone(cls.MOSCOW_TZ)
            if (
                last_sent_moscow.date() == moscow_now.date()
                and last_sent_moscow.hour == current_hour
            ):
                return False

        # Проверка интервалов (в днях)
        if rule.frequency_type == "days" and rule.last_sent_at:
            if now_utc - rule.last_sent_at < timedelta(days=rule.interval_days or 1):
                return False

        return True
