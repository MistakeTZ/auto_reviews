import logging
import os
from typing import Optional
from email.mime.text import MIMEText

import aiosmtplib
import httpx
from sqlalchemy.orm import Session

import models

logger = logging.getLogger(__name__)


MAX_TEXT_LENGTH = 3500


def _env_flag(name: str, default: bool) -> bool:
    raw = (os.getenv(name) or "").strip().lower()
    if not raw:
        return default
    return raw in {"1", "true", "yes", "on"}


def _smtp_host_candidates(primary_host: str) -> list[str]:
    host = (primary_host or "localhost").strip()
    candidates = [host]

    # In Docker, 127.0.0.1/localhost points to the container itself.
    if os.path.exists("/.dockerenv") and host in {"127.0.0.1", "localhost", "::1"}:
        candidates.append("host.docker.internal")

    seen = set()
    unique_candidates = []
    for candidate in candidates:
        if candidate not in seen:
            unique_candidates.append(candidate)
            seen.add(candidate)
    return unique_candidates


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
    return " ".join(icons) if icons else ""


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
    nm_id = review.nm_id

    body = [
        "<b>НОВЫЙ ОТЗЫВ</b>",
        stars,
        f"<b>Предмет:</b> <a href='https://www.wildberries.ru/catalog/{nm_id}/detail.aspx'>{product_name}</a>",
        f"🆔 <code>{nm_id}</code>",
        f"👤 <b>Пользователь:</b> {user_name}",
        "",
    ]

    if media_line:
        body.append(media_line)

    if comment_text or cons_text or pros_text:
        if comment_text:
            body.append(f"💬 {comment_text}")
        if cons_text:
            body.append(f"👎 {cons_text}")
        if pros_text:
            body.append(f"👍 {pros_text}")
    else:
        body.append("💬 Без комментария")

    body.extend(
        [
            "",
            f"🤖 <b>Автоответ:</b> <i>{auto_answer}</i>" if auto_answer else "",
        ]
    )

    return "\n".join(body).strip("\n")


async def _send_email(email: str, text: str) -> None:
    smtp_host = os.getenv("SMTP_HOST", "localhost")
    smtp_port = int(os.getenv("SMTP_PORT", "25"))
    smtp_user = (os.getenv("SMTP_USER") or "").strip()
    smtp_password = (os.getenv("SMTP_PASSWORD") or "").strip()
    smtp_from = (os.getenv("SMTP_FROM") or smtp_user).strip()
    smtp_starttls = _env_flag("SMTP_STARTTLS", True)
    smtp_use_tls = _env_flag("SMTP_USE_TLS", False)

    if not smtp_from:
        logger.warning("[notify] SMTP_FROM/SMTP_USER is empty, email notification skipped")
        return

    # Keep existing HTML tags from notification text and preserve line breaks.
    email_html = f"<html><body style='white-space: pre-line;'>{text}</body></html>"
    message = MIMEText(email_html, "html", "utf-8")
    message["From"] = smtp_from
    message["To"] = email
    message["Subject"] = "Новый отзыв на Wildberries"

    smtp_kwargs: dict = {
        "port": smtp_port,
        "start_tls": smtp_starttls,
        "use_tls": smtp_use_tls,
    }
    if smtp_user and smtp_password:
        smtp_kwargs["username"] = smtp_user
        smtp_kwargs["password"] = smtp_password
    elif smtp_user and not smtp_password:
        logger.warning(
            "[notify] SMTP_USER is set but SMTP_PASSWORD is empty, sending without SMTP auth"
        )

    last_exc = None
    for host in _smtp_host_candidates(smtp_host):
        try:
            await aiosmtplib.send(
                message,
                hostname=host,
                **smtp_kwargs,
            )
            return
        except Exception as exc:
            last_exc = exc
            logger.error(
                "[notify] Failed to send email to %s via %s:%s: %s",
                email,
                host,
                smtp_port,
                exc,
            )

    raise RuntimeError(f"Failed to send email: {last_exc}") from last_exc


async def _send_telegram_message(chat_id: str, text: str) -> None:
    token = (os.getenv("TG_BOT_TOKEN") or "").strip()
    if not token:
        logger.warning("[notify] TG_BOT_TOKEN is empty, telegram notification skipped")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": int(chat_id),
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(url, json=payload)
        data = response.json()
        if not data.get("ok"):
            logger.error("[notify] Telegram API error: %s", data)
            raise RuntimeError(f"Telegram API error: {data}")


async def _send_max_message(destination: str, text: str) -> None:
    token = (os.getenv("MAX_BOT_TOKEN") or "").strip()
    if not token:
        logger.warning("[notify] MAX_BOT_TOKEN is empty, max notification skipped")
        return

    url = f"https://platform-api.max.ru/messages"
    payload = {
        "text": text,
        "format": "html",
    }
    headers = {
        "Authorization": token,
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            url,
            json=payload,
            params={
                "disable_link_preview": "true",
                "chat_id": destination,
            },
            headers=headers,
        )
        if response.status_code != 200:
            data = response.json()
            logger.error("[notify] Max API error: %s", data)
            raise RuntimeError(f"Max API error: {data}")


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
            try:
                await _send_email(destination, message_text)
            except Exception as exc:
                logger.exception(
                    "[notify] email send failed user_id=%s email=%s: %s",
                    user_id,
                    destination,
                    exc,
                )
        elif method_type == "max":
            try:
                await _send_max_message(destination, message_text)
            except Exception as exc:
                logger.exception(
                    "[notify] max send failed user_id=%s destination=%s: %s",
                    user_id,
                    destination,
                    exc,
                )
        else:
            logger.warning(
                "[notify] unsupported notification type user_id=%s type=%s",
                user_id,
                method.type,
            )
