import logging
import os
from typing import Optional

import httpx
from sqlalchemy.orm import Session

import models

logger = logging.getLogger(__name__)


MAX_TEXT_LENGTH = 3500


def _escape_markdown_v2(text: str) -> str:
    special = r"_[]()~`>#+-=|{}.!*"
    escaped = []
    for char in text:
        if char in special:
            escaped.append(f"\\{char}")
        else:
            escaped.append(char)
    return "".join(escaped)


def _build_stars(rating: int) -> str:
    safe_rating = max(0, min(5, int(rating or 0)))
    return "⭐️" * safe_rating


def _build_media_line(has_video: bool, photos_count: int) -> str:
    icons = []
    if has_video:
        icons.append("🎥")
    if photos_count > 0:
        icons.extend(["🖼️"] * photos_count)
    return " ".join(icons) if icons else "-"


def _trim_text(value: Optional[str]) -> str:
    normalized = (value or "").strip()
    if not normalized:
        return "-"
    if len(normalized) <= MAX_TEXT_LENGTH:
        return normalized
    return normalized[:MAX_TEXT_LENGTH] + "..."


def _trim_optional_text(value: Optional[str]) -> Optional[str]:
    normalized = (value or "").strip()
    if not normalized:
        return None
    if len(normalized) <= MAX_TEXT_LENGTH:
        return normalized
    return normalized[:MAX_TEXT_LENGTH] + "..."


def build_feedback_notification_text(review: models.Review) -> str:
    stars = _build_stars(review.rating)
    user_name = _trim_text(review.user_name)
    product_name = _trim_text(review.product_name)
    comment_text = _trim_optional_text(review.text)
    cons_text = _trim_optional_text(review.cons)
    pros_text = _trim_optional_text(review.pros)
    auto_answer = _trim_text(review.auto_answer_text)
    media_line = _build_media_line(
        bool(review.has_video), int(review.photos_count or 0)
    )

    body = [
        f"Отзыв {stars}".rstrip(),
        f"Предмет: {product_name}",
        f"Пользователь: {user_name}",
        "",
        media_line,
    ]

    if comment_text or cons_text or pros_text:
        if comment_text:
            body.append(f"Комментарий: {comment_text}")
        if cons_text:
            body.append(f"Минусы: {cons_text}")
        if pros_text:
            body.append(f"Плюсы: {pros_text}")
    else:
        body.append("Комментарий: Без комментария")

    body.extend([
        "",
        f"Автоответ: *{auto_answer}*",
    ])

    # MarkdownV2 is strict; escape dynamic fields while keeping template symbols.
    escaped_lines = []
    for line in body:
        if not line:
            escaped_lines.append("")
            continue
        if line.startswith("Автоответ: *"):
            prefix = "Автоответ: "
            answer_raw = line[len(prefix) + 1 : -1]  # keep star wrappers
            escaped_lines.append(prefix + "*" + _escape_markdown_v2(answer_raw) + "*")
            continue

        if ": " in line:
            prefix, value = line.split(": ", 1)
            escaped_lines.append(f"{prefix}: {_escape_markdown_v2(value)}")
        elif line == "-":
            escaped_lines.append(line)
        else:
            escaped_lines.append(_escape_markdown_v2(line))

    return "\n".join(escaped_lines)


async def _send_telegram_message(chat_id: str, text: str) -> None:
    token = (os.getenv("TG_BOT_TOKEN") or "").strip()
    if not token:
        logger.warning("[notify] TG_BOT_TOKEN is empty, telegram notification skipped")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "MarkdownV2",
        "disable_web_page_preview": True,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        if not data.get("ok"):
            raise RuntimeError(f"Telegram API error: {data}")


async def notify_review_processed(
    db: Session, user_id: int, review: models.Review
) -> None:
    methods = (
        db.query(models.NotificationMethod)
        .filter(
            models.NotificationMethod.user_id == user_id,
            models.NotificationMethod.is_active == True,
        )
        .all()
    )
    if not methods:
        return

    message_text = build_feedback_notification_text(review)

    for method in methods:
        method_type = (method.type or "").strip().lower()
        destination = (method.value or "").strip()
        if not destination:
            continue

        if method_type == "telegram":
            try:
                await _send_telegram_message(destination, message_text)
            except Exception as exc:
                logger.exception(
                    "[notify] telegram send failed user_id=%s chat_id=%s: %s",
                    user_id,
                    destination,
                    exc,
                )
        elif method_type == "email":
            logger.info(
                "[notify-mock][email] user_id=%s email=%s payload=%s",
                user_id,
                destination,
                message_text,
            )
        elif method_type == "max":
            logger.info(
                "[notify-mock][max] user_id=%s max_id=%s payload=%s",
                user_id,
                destination,
                message_text,
            )
        else:
            logger.warning(
                "[notify] unsupported notification type user_id=%s type=%s",
                user_id,
                method.type,
            )
