import asyncio
import logging
import os
import time
from datetime import datetime, timezone
from sqlalchemy import inspect

from database import SessionLocal, Base, engine
from models import User
from processor.gpt import AsyncOpenAIClient
from services.notifications import notify_subscription_expiring_tomorrow
from processor.services.wb.chat_client import WBChatClient
from processor.services.spam.spam_service import SpamService
from processor.services.spam.event_service import ChatEventService
from processor.services.subscriptions.subscription_service import SubscriptionService
from processor.services.products.sync_service import ProductSyncService
from processor.controllers.registry import ControllerRegistry

logger = logging.getLogger("controller_runner")


class ControllerRunner:
    def __init__(self):
        self.registry = ControllerRegistry()
        self.gpt_client = AsyncOpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
        self.wb_chat_client = WBChatClient()
        self.spam_service = SpamService(self.wb_chat_client)
        self.event_service = ChatEventService(self.wb_chat_client)

    def _run_migrations(self):
        Base.metadata.create_all(bind=engine)
        try:
            inspector = inspect(engine)
            with engine.connect() as conn:
                columns = {
                    col.get("name") for col in inspector.get_columns("spam_rules")
                }
                if "reply_sign" not in columns:
                    conn.exec_driver_sql(
                        "ALTER TABLE spam_rules ADD COLUMN reply_sign VARCHAR"
                    )
                    conn.commit()
        except Exception as e:
            logger.warning("Migration warning: %s", e)

    async def run_sync_and_polls(self, user, now_utc, run_this_cycle, full_check):
        token = str(user.wb_api_token or "").strip()
        if not token:
            return

        container = await self.registry.get_or_create(
            user.id, token, self.gpt_client, SessionLocal
        )

        if not ProductSyncService.user_has_saved_products(user.id):
            logger.info(
                "Initial dynamic product sync tracking triggered user_id=%s", user.id
            )
            await container.review.processor.get_feedbacks(
                is_answered=True, take=1
            )  # Эмуляция системного пинга

        if run_this_cycle:
            if SubscriptionService.expires_tomorrow(user, now_utc):
                with SessionLocal() as db_notify:
                    await notify_subscription_expiring_tomorrow(db_notify, user)

        logger.info("Polling activity engines for user %s...", user.id)
        await container.poll_once(full_check)

    async def run(self):
        self._run_migrations()
        cycle_count = 0
        controll_hour = int(os.getenv("CONTROLLER_DAILY_HOUR", "1"))
        once_in_a_day = datetime.now().hour < controll_hour

        while True:
            start_loop_time = time.monotonic()
            try:
                now = datetime.now()
                now_utc = datetime.now(timezone.utc)
                run_this_cycle = False
                full_check = cycle_count % 60 == 0

                if now.hour == 0 and once_in_a_day:
                    once_in_a_day = False
                elif now.hour >= controll_hour and not once_in_a_day:
                    once_in_a_day = True
                    run_this_cycle = True

                with SessionLocal() as db:
                    users = (
                        db.query(User)
                        .filter(
                            (User.wb_api_token.isnot(None))
                            | (User.wb_chat_api_token.isnot(None))
                        )
                        .all()
                    )

                    # 1. Слой выполнения Спам-скриптов и Сбора Ивентов Чатов
                    for user in users:
                        if not user.wb_chat_api_token:
                            continue
                        if not SubscriptionService.has_active_spam_subscription(
                            user, now_utc
                        ):
                            continue
                        try:
                            await self.spam_service.process_user_spam(db, user, now_utc)
                            await self.event_service.check_user_chat_events(db, user)
                        except Exception as e:
                            logger.exception(
                                "Spam/Event worker failed for user %s: %s", user.id, e
                            )

                    # 2. Слой обработки автоматических Отзывов и Вопросов
                    current_user_ids = set()
                    for user in users:
                        if not user.wb_api_token:
                            continue
                        current_user_ids.add(user.id)

                        if (
                            full_check
                            and not SubscriptionService.has_active_subscription(
                                user, now_utc
                            )
                        ):
                            self.registry.remove(user.id)
                            continue

                        try:
                            await self.run_sync_and_polls(
                                user, now_utc, run_this_cycle, full_check
                            )
                        except Exception as e:
                            logger.exception(
                                "Error processing runtime metrics for user %s: %s",
                                user.id,
                                e,
                            )

                    # Самоочистка кэша удаленных или пустых пользователей
                    for rid in self.registry.active_ids():
                        if rid not in current_user_ids:
                            self.registry.remove(rid)

            except Exception as e:
                logger.exception(
                    "Global background exception loop crash averted: %s", e
                )

            cycle_count += 1

            # Защита от наползания задач: вычисляем точное время сна
            elapsed = time.monotonic() - start_loop_time
            sleep_time = max(0.1, 60.0 - elapsed)
            logger.info(
                "Cycle %d done in %.2fs. Next run inside %.2fs.",
                cycle_count,
                elapsed,
                sleep_time,
            )
            await asyncio.sleep(sleep_time)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    runner = ControllerRunner()
    try:
        asyncio.run(runner.run())
    except KeyboardInterrupt:
        logger.info("Runner shutdown safely requested.")
