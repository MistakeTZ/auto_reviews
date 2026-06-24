import time
import logging
from sqlalchemy.orm import Session
import models
from models import User, SpamRule
from processor.services.wb.chat_client import WBChatClient
from processor.services.spam.notifications import SpamNotificationService

logger = logging.getLogger("event_service")


class ChatEventService:
    def __init__(self, wb_client: WBChatClient):
        self.wb = wb_client

    async def check_user_chat_events(self, db: Session, user: User):
        if not user.notify_answers_in_chats:
            return

        token = user.wb_chat_api_token.strip()
        cursor = (
            db.query(models.SpamLastFetchedEventTime)
            .filter(models.SpamLastFetchedEventTime.user_id == user.id)
            .first()
        )
        if not cursor:
            cursor = models.SpamLastFetchedEventTime(
                user_id=user.id, last_event_time_ms=int(time.time() * 1000)
            )
            db.add(cursor)
            db.commit()

        try:
            result = await self.wb.get_events(token, cursor.last_event_time_ms)
            next_cursor = result.get("next")
            events = result.get("events") or []

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
                    client_name = event.get("clientName") or "Покупатель"
                    message = event.get("message") or {}

                    rule = (
                        db.query(SpamRule)
                        .filter(
                            SpamRule.user_id == user.id, SpamRule.chat_id == chat_id
                        )
                        .first()
                    )
                    if rule and rule.is_active:
                        rule.is_active = False
                        db.commit()
                        logger.info(
                            "EventPoller: Pausing active rule %s because buyer messaged",
                            rule.id,
                        )

                        await SpamNotificationService.send_chat_message_notification(
                            db, user.id, client_name, message, stopped=True
                        )
                        continue

                    if user.notify_all_messages:
                        await SpamNotificationService.send_chat_message_notification(
                            db, user.id, client_name, message
                        )
        except Exception as e:
            logger.error("Error checking events for user %s: %s", user.id, e)
