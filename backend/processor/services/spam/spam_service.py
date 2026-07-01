import random
import logging
from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

import database.crud as crud
from database.models import User, SpamRule, SpamRuleChat
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

        # Auto-migration for legacy rules
        migrated = False
        for rule in rules:
            if not rule.chats and rule.chat_id:
                legacy_chat = SpamRuleChat(
                    rule_id=rule.id,
                    chat_id=rule.chat_id,
                    client_name=rule.client_name,
                    reply_sign=rule.reply_sign,
                    is_active=rule.is_active,
                    last_sent_at=rule.last_sent_at,
                    last_sent_message_timestamp=rule.last_sent_message_timestamp,
                )
                db.add(legacy_chat)
                migrated = True
        if migrated:
            db.commit()
            # Refetch rules to ensure relationship is loaded
            rules = (
                db.query(SpamRule)
                .filter(SpamRule.user_id == user.id, SpamRule.is_active == True)
                .all()
            )

        current_hour = (now_utc + timedelta(hours=3)).hour

        if not rules:
            return

        try:
            fetched_chats = await self.wb.get_chats(token)
        except Exception as e:
            logger.error("Error fetching chats for user %s: %s", user.id, e)
            return

        chats_by_id = {c.get("chatID"): c for c in fetched_chats}

        for rule in rules:
            active_chats = [c for c in rule.chats if c.is_active]

            for rule_chat in active_chats:
                if not SpamScheduler.can_send(rule, rule_chat.last_sent_at, now_utc):
                    continue

                chat = chats_by_id.get(rule_chat.chat_id)
                if not chat:
                    continue

                last_msg = chat.get("lastMessage") or {}
                last_msg_ts = last_msg.get("addTimestamp")

                if (
                    rule_chat.last_sent_message_timestamp > 0
                    and last_msg_ts
                    and last_msg_ts > rule_chat.last_sent_message_timestamp
                    and not rule.spam_endlessly
                ):
                    logger.info(
                        "Reconciliation: Pausing spam rule %s chat %s due to unexpected buyer message",
                        rule.id,
                        rule_chat.chat_id,
                    )
                    rule_chat.is_active = False
                    db.commit()

                    client_name = (
                        rule_chat.client_name or chat.get("clientName") or "Покупатель"
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
                            if (
                                current_hour >= t.start_hour
                                or current_hour <= t.end_hour
                            ):
                                candidate_templates.append(t)
                    else:
                        candidate_templates.append(t)

                if not candidate_templates:
                    continue

                selected_template = random.choice(candidate_templates)
                rendered_text = selected_template.text.replace(
                    "[name]", rule_chat.client_name or "Покупатель"
                )

                reply_sign = chat.get("replySign") or rule_chat.reply_sign
                if reply_sign and reply_sign != rule_chat.reply_sign:
                    rule_chat.reply_sign = reply_sign
                    db.commit()

                if not reply_sign:
                    logger.error(
                        "Cannot send message for rule %s chat %s: reply_sign is missing",
                        rule.id,
                        rule_chat.chat_id,
                    )
                    continue

                try:
                    result = await self.wb.send_message(
                        token, reply_sign, rendered_text
                    )
                    add_time = result.get("addTime")

                    crud.log_spam_sent_message(
                        db, rule.id, rendered_text, rule_chat.chat_id, add_time
                    )
                    rule_chat.last_sent_at = datetime.now(timezone.utc)
                    rule_chat.last_sent_message_timestamp = add_time

                    # Also update the legacy rule fields for dashboard listing / sort back-compat
                    rule.last_sent_at = rule_chat.last_sent_at
                    rule.last_sent_message_timestamp = add_time
                    db.commit()

                    logger.info(
                        "Successfully sent spam message to chat %s (rule %s)",
                        rule_chat.chat_id,
                        rule.id,
                    )
                except Exception as e:
                    rule_chat.last_sent_message_timestamp = -1
                    db.commit()
                    logger.error(
                        "Error sending message for rule %s chat %s: %s",
                        rule.id,
                        rule_chat.chat_id,
                        e,
                    )
