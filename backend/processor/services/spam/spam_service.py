import random
import logging
from datetime import datetime, timezone
from time import time

from sqlalchemy.orm import Session

import database.crud as crud
from database.models import User, SpamRule
from processor.services.wb.chat_client import WBChatClient
from processor.services.spam.scheduler import SpamScheduler
from processor.services.spam.notifications import SpamNotificationService

logger = logging.getLogger("spam_service")


class SpamService:
    def __init__(self, wb_client: WBChatClient):
        self.wb = wb_client

    async def process_user_spam(self, db: Session, user: User, now_utc: datetime):
        token = user.wb_chat_api_token.strip()
        rules = (
            db.query(SpamRule)
            .filter(SpamRule.user_id == user.id, SpamRule.is_active == True)
            .all()
        )

        # Выполнение отправки сообщений по расписанию
        current_hour = (now_utc + datetime.resolution.__class__(hours=3)).hour
        rules = [r for r in rules if SpamScheduler.can_send(r, now_utc)]

        if not rules:
            return
        
        try:
            fetched_chats = await self.wb.get_chats(token)
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
                if (
                    last_msg_ts != rule.last_sent_message_timestamp
                    and not rule.spam_endlessly
                    and abs(last_msg_ts - rule.last_sent_message_timestamp) > 1000 * 15
                ):
                    logger.info(
                        "Reconciliation: Pausing spam rule %s due to unexpected buyer message",
                        rule.id,
                    )
                    rule.is_active = False
                    db.commit()

                    client_name = (
                        rule.client_name or chat.get("clientName") or "Покупатель"
                    )
                    await SpamNotificationService.send_chat_message_notification(
                        db, user.id, client_name, last_msg, stopped=True
                    )
                    continue

            candidate_templates = []
            for t in rule.templates:
                if t.start_hour is not None and t.end_hour is not None:
                    if t.start_hour <= t.end_hour:
                        if t.start_hour <= current_hour <= t.end_hour:
                            candidate_templates.append(t)
                    else:
                        if current_hour >= t.start_hour or current_hour <= t.end_hour:
                            candidate_templates.append(t)
                else:
                    candidate_templates.append(t)

            if not candidate_templates:
                continue

            selected_template = random.choice(candidate_templates)
            rendered_text = selected_template.text.replace(
                "[name]", rule.client_name or "Покупатель"
            )

            reply_sign = rule.reply_sign or chat.get("replySign")
            if reply_sign and not rule.reply_sign:
                rule.reply_sign = reply_sign
                db.commit()

            if not reply_sign:
                logger.error(
                    "Cannot send message for rule %s: reply_sign is missing", rule.id
                )
                continue

            try:
                result = await self.wb.send_message(token, reply_sign, rendered_text)
                add_time = result.get("addTime")

                crud.log_spam_sent_message(
                    db, rule.id, rendered_text, rule.chat_id, add_time
                )
                rule.last_sent_at = datetime.now(timezone.utc)
                rule.last_sent_message_timestamp = add_time
                db.commit()
                logger.info(
                    "Successfully sent spam message to chat %s (rule %s)",
                    rule.chat_id,
                    rule.id,
                )
            except Exception as e:
                crud.log_spam_sent_message(
                    db, rule.id, rendered_text, rule.chat_id, time() * 1000,
                )
                rule.last_sent_at = datetime.now(timezone.utc)
                rule.last_sent_message_timestamp = time() * 1000
                db.commit()
                logger.error("Error sending message for rule %s: %s", rule.id, e)
