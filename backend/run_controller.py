import asyncio
from datetime import datetime, timezone, timedelta
import logging
import os
import random
import hashlib
import httpx
from sqlalchemy.orm import Session

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("controller_runner")

from database import SessionLocal, Base, engine
from models import NmIDs, User
import models
import crud
import schemas
from processor.chat_processor import ChatProcessor
from processor.gpt import AsyncOpenAIClient
from processor.controller import build_controller
from services.notifications import (
    notify_subscription_expiring_tomorrow,
    send_custom_notification,
)


def _normalize_dt(dt: datetime | None) -> datetime | None:
    if not dt:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _has_active_subscription(user: User, now_utc: datetime) -> bool:
    expires_at = _normalize_dt(user.subscription_expires_at)
    if not expires_at:
        return False
    return expires_at > now_utc


def _expires_tomorrow(user: User, now_utc: datetime) -> bool:
    expires_at = _normalize_dt(user.subscription_expires_at)
    if not expires_at:
        return False

    if expires_at <= now_utc:
        return False

    tomorrow_date = (now_utc + timedelta(days=1)).date()
    return expires_at.date() == tomorrow_date


def _user_has_saved_products(user_id: int) -> bool:
    db = SessionLocal()
    try:
        return (
            db.query(NmIDs.id).filter(NmIDs.user_d_id == user_id).limit(1).first()
            is not None
        )
    finally:
        db.close()


def get_hour_offset(rule_id: int, date_str: str, hour: int) -> int:
    key = f"spam_offset_{rule_id}_{date_str}_{hour}"
    h = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(h, 16) % 21  # 0 to 20 minutes


async def process_user_spam_rules(db: Session, user: User, now_utc: datetime):
    token = user.wb_chat_api_token.strip()
    rules = (
        db.query(models.SpamRule)
        .filter(models.SpamRule.user_id == user.id, models.SpamRule.is_active == True)
        .all()
    )
    if not rules:
        return

    chats_url = "https://buyer-chat-api.wildberries.ru/api/v1/seller/chats"
    headers = {"Authorization": token}
    fetched_chats = []

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            res = await client.get(chats_url, headers=headers)
            if res.status_code == 200:
                fetched_chats = res.json().get("result") or []
            else:
                logger.error("Failed to fetch chats for user %s: %s", user.id, res.text)
        except Exception as e:
            logger.error("Error fetching chats for user %s: %s", user.id, e)
            return

    chats_by_id = {c.get("chatID"): c for c in fetched_chats}

    for rule in rules:
        chat = chats_by_id.get(rule.chat_id)
        if not chat:
            continue

        last_msg = chat.get("lastMessage") or {}
        last_msg_ts = last_msg.get("addTimestamp")

        if rule.last_sent_message_timestamp > 0 and last_msg_ts:
            if last_msg_ts != rule.last_sent_message_timestamp:
                if not rule.spam_endlessly:
                    logger.info(
                        "Reconciliation: Pausing spam rule %s because last message timestamp changed",
                        rule.id,
                    )
                    rule.is_active = False
                    db.add(rule)
                    db.commit()

                    client_name = rule.client_name or chat.get("clientName") or "Buyer"
                    msg_text = last_msg.get("text") or "без текста"
                    notif_text = (
                        f"💬 <b>НОВОЕ СООБЩЕНИЕ В ЧАТЕ</b>\n"
                        f"👤 Покупатель: {client_name}\n\n"
                        f"<i>{msg_text}</i>\n\n"
                        f"❗️ Рассылка остановлена."
                    )
                    await send_custom_notification(
                        db, user.id, notif_text, subject="Рассылка остановлена"
                    )
                    continue

    rules = [r for r in rules if r.is_active]
    if not rules:
        return

    moscow_now = now_utc + timedelta(hours=3)
    current_hour = moscow_now.hour
    current_minute = moscow_now.minute
    date_str = moscow_now.strftime("%Y-%m-%d")

    for rule in rules:
        allowed_hours = [
            int(h.strip()) for h in rule.send_hours.split(",") if h.strip().isdigit()
        ]
        if current_hour not in allowed_hours:
            continue

        offset = get_hour_offset(rule.id, date_str, current_hour)
        if current_minute < offset:
            continue

        if rule.last_sent_at:
            last_sent_moscow = rule.last_sent_at.astimezone(
                timezone(timedelta(hours=3))
            )
            if (
                last_sent_moscow.date() == moscow_now.date()
                and last_sent_moscow.hour == current_hour
            ):
                continue

        if rule.frequency_type == "days" and rule.last_sent_at:
            time_diff = now_utc - rule.last_sent_at
            if time_diff < timedelta(days=rule.interval_days or 1):
                continue

        templates = rule.templates
        if not templates:
            continue

        candidate_templates = []
        for t in templates:
            if t.start_hour is not None and t.end_hour is not None:
                sh = t.start_hour
                eh = t.end_hour
                if sh <= eh:
                    if sh <= current_hour <= eh:
                        candidate_templates.append(t)
                else:
                    if current_hour >= sh or current_hour <= eh:
                        candidate_templates.append(t)
            else:
                candidate_templates.append(t)

        if not candidate_templates:
            continue

        selected_template = random.choice(candidate_templates)
        client_name = rule.client_name or "Buyer"
        rendered_text = selected_template.text.replace("[name]", client_name)

        reply_sign = rule.reply_sign
        if not reply_sign:
            reply_sign = chat.get("replySign")
            if reply_sign:
                rule.reply_sign = reply_sign
                db.add(rule)
                db.commit()

        if not reply_sign:
            logger.error(
                "Cannot send message for rule %s: reply_sign is missing", rule.id
            )
            continue

        send_url = "https://buyer-chat-api.wildberries.ru/api/v1/seller/message"
        payload = {"replySign": reply_sign, "message": rendered_text}

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                res = await client.post(send_url, headers=headers, json=payload)
                if res.status_code == 200:
                    res_data = res.json()
                    result = res_data.get("result") or {}
                    add_time = result.get("addTime")

                    if add_time:
                        crud.log_spam_sent_message(
                            db, rule.id, rendered_text, rule.chat_id, add_time
                        )
                        rule.last_sent_at = datetime.now(timezone.utc)
                        rule.last_sent_message_timestamp = add_time
                        db.add(rule)
                        db.commit()
                        logger.info(
                            "Successfully sent spam message to chat %s (rule %s)",
                            rule.chat_id,
                            rule.id,
                        )
                else:
                    logger.error(
                        "Failed to send message for rule %s: %s", rule.id, res.text
                    )
            except Exception as e:
                logger.error("Error sending message for rule %s: %s", rule.id, e)


async def check_user_chat_events(db: Session, user: User):
    if not user.notify_answers_in_chats:
        return

    token = user.wb_chat_api_token.strip()
    cursor = (
        db.query(models.SpamLastFetchedEventTime)
        .filter(models.SpamLastFetchedEventTime.user_id == user.id)
        .first()
    )
    if not cursor:
        import time

        init_ts = int(time.time() * 1000)
        cursor = models.SpamLastFetchedEventTime(
            user_id=user.id, last_event_time_ms=init_ts
        )
        db.add(cursor)
        db.commit()

    events_url = f"https://buyer-chat-api.wildberries.ru/api/v1/seller/events?next={cursor.last_event_time_ms}"
    headers = {"Authorization": token}

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            res = await client.get(events_url, headers=headers)
            if res.status_code == 200:
                data = res.json().get("result") or {}
                next_cursor = data.get("next")
                events = data.get("events") or []

                if next_cursor:
                    cursor.last_event_time_ms = next_cursor
                    db.add(cursor)
                    db.commit()

                for event in events:
                    if (
                        event.get("eventType") == "message"
                        and event.get("sender") == "client"
                    ):
                        chat_id = event.get("chatID")
                        client_name = event.get("clientName") or "Buyer"
                        msg_text = event.get("message", {}).get("text") or "без текста"

                        attachments = event.get("message", {}).get("attachments") or {}
                        video_icons = []
                        photo_icons = []

                        images = attachments.get("images") or []
                        if images:
                            photo_icons.extend(["🖼️"] * len(images))

                        files = attachments.get("files") or []
                        for f in files:
                            ctype = str(f.get("contentType") or "").lower()
                            if "video" in ctype:
                                video_icons.append("🎥")
                            elif "image" in ctype:
                                photo_icons.append("🖼️")

                        media_line = ""
                        if video_icons or photo_icons:
                            media_line = " ".join(video_icons + photo_icons)

                        rule = (
                            db.query(models.SpamRule)
                            .filter(
                                models.SpamRule.user_id == user.id,
                                models.SpamRule.chat_id == chat_id,
                            )
                            .first()
                        )

                        if rule:
                            if rule.is_active:
                                rule.is_active = False
                                db.add(rule)
                                db.commit()
                                logger.info(
                                    "EventPoller: Pausing active rule %s because buyer messaged",
                                    rule.id,
                                )

                            notif_body = [
                                "💬 <b>НОВОЕ СООБЩЕНИЕ В ЧАТЕ</b>",
                                f"👤 Покупатель: {client_name}",
                            ]
                            if media_line:
                                notif_body.append(media_line)
                            notif_body.extend(
                                [f"<i>{msg_text}</i>", "", "❗️ Рассылка остановлена."]
                            )

                            notif_text = "\n".join(notif_body)
                            await send_custom_notification(
                                db,
                                user.id,
                                notif_text,
                                subject="Сообщение в чате | Рассылка остановлена",
                            )

                        else:
                            if user.notify_all_messages:
                                notif_body = [
                                    "💬 <b>НОВОЕ СООБЩЕНИЕ В ЧАТЕ</b>",
                                    f"👤 Покупатель: {client_name}",
                                ]
                                if media_line:
                                    notif_body.append(media_line)
                                notif_body.append(f"<i>{msg_text}</i>")

                                notif_text = "\n".join(notif_body)
                                await send_custom_notification(
                                    db,
                                    user.id,
                                    notif_text,
                                    subject="Новое сообщение в чате",
                                )

            else:
                logger.error(
                    "Failed to fetch events for user %s: %s", user.id, res.text
                )
        except Exception as e:
            logger.error("Error checking events for user %s: %s", user.id, e)


async def run_controllers():
    # Controller runs as a separate service, so ensure schema exists on startup.
    Base.metadata.create_all(bind=engine)

    # Ensure spam_rules has reply_sign column
    from sqlalchemy import inspect
    try:
        inspector = inspect(engine)
        with engine.connect() as conn:
            spam_rule_columns = {col.get("name") for col in inspector.get_columns("spam_rules")}
            if "reply_sign" not in spam_rule_columns:
                conn.exec_driver_sql(
                    "ALTER TABLE spam_rules ADD COLUMN reply_sign VARCHAR"
                )
                conn.commit()
    except Exception as e:
        logger.warning("Failed to run spam_rules reply_sign migration in controller: %s", e)

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        logger.warning(
            "OPENAI_API_KEY is not set. Controller will fail on GPT tasks if called."
        )

    gpt_client = AsyncOpenAIClient(api_key=openai_api_key)

    controllers = {}
    cycle_count = 0
    controll_hour = int(os.getenv("CONTROLLER_DAILY_HOUR", "1"))
    once_in_a_day = datetime.now().hour < controll_hour

    while True:
        try:
            now = datetime.now()
            now_utc = datetime.now(timezone.utc)
            run_this_cycle = False
            full_check = cycle_count % 60 == 0

            if now.hour == 0 and once_in_a_day:
                once_in_a_day = False
                logger.info("Resetting daily controller tasks...")

            elif now.hour >= controll_hour and not once_in_a_day:
                once_in_a_day = True
                run_this_cycle = True
                logger.info("Running daily controller tasks...")

            db = SessionLocal()
            db.expire_on_commit = False
            users = (
                db.query(User)
                .filter(
                    (User.wb_api_token.isnot(None))
                    | (User.wb_chat_api_token.isnot(None))
                )
                .all()
            )

            # Run spam and event checks for users
            for user in users:
                if not user.wb_chat_api_token:
                    continue
                try:
                    await process_user_spam_rules(db, user, now_utc)
                    await check_user_chat_events(db, user)
                except Exception as e:
                    logger.exception(
                        f"Error processing spam/events for user {user.id}: {e}"
                    )

            db.close()

            current_user_ids = set()

            for user in users:
                token = str(user.wb_api_token or "").strip()
                if not token:
                    continue

                current_user_ids.add(user.id)

                # On every iteration, skip expired subscriptions.
                if full_check and not _has_active_subscription(user, now_utc):
                    logger.info(
                        "Skipping user %s: subscription is expired or inactive",
                        user.id,
                    )
                    if user.id in controllers:
                        logger.info(
                            "Removing controller for user %s due to expired subscription",
                            user.id,
                        )
                        del controllers[user.id]
                    continue

                if user.id not in controllers:
                    logger.info(f"Initializing controller for user {user.id}")
                    processor = ChatProcessor(api_key=token)
                    controllers[user.id] = build_controller(
                        processor=processor,
                        gpt_client=gpt_client,
                        use_gpt_for_feedbacks=True,
                        user_id=user.id,
                        db_factory=SessionLocal,
                    )

                    # Sync once when user appears with no persisted products (new registration flow).
                    if not _user_has_saved_products(user.id):
                        logger.info(
                            "Initial product sync for user %s (no saved products found)",
                            user.id,
                        )
                        await controllers[user.id].fetch_all_products()

                logger.info(f"Polling for user {user.id}...")
                controller = controllers[user.id]
                try:
                    if run_this_cycle:
                        await controller.fetch_all_products()
                        if _expires_tomorrow(user, now_utc):
                            db_notify = SessionLocal()
                            try:
                                await notify_subscription_expiring_tomorrow(
                                    db_notify, user
                                )
                            finally:
                                db_notify.close()

                    await controller.poll_once(full_check)
                except Exception as e:
                    logger.exception(f"Error polling for user {user.id}: {e}")

            for user_id in list(controllers.keys()):
                if user_id not in current_user_ids:
                    logger.info(f"Removing controller for user {user_id}")
                    del controllers[user_id]

        except Exception as e:
            logger.exception(f"Main loop error: {e}")

        cycle_count += 1
        logger.info(
            f"Sleeping for 60 seconds before next poll... (Cycle {cycle_count})"
        )
        await asyncio.sleep(60)


if __name__ == "__main__":
    try:
        asyncio.run(run_controllers())
    except KeyboardInterrupt:
        logger.info("Controller stopped.")
