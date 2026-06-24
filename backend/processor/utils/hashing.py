import hashlib


def get_hour_offset(rule_id: int, date_str: str, hour: int) -> int:
    """Гарантирует детерминированный сдвиг (0-20 мин) для конкретного правила внутри часа."""
    key = f"spam_offset_{rule_id}_{date_str}_{hour}"
    h = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(h, 16) % 21
