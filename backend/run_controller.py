import asyncio
from datetime import datetime, timezone, timedelta
import logging
import os

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("controller_runner")

from database import SessionLocal, Base, engine
from models import NmIDs, User
from processor.chat_processor import ChatProcessor
from processor.gpt import AsyncOpenAIClient
from processor.controller import build_controller
from services.notifications import notify_subscription_expiring_tomorrow


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
            db.query(NmIDs.id)
            .filter(NmIDs.user_d_id == user_id)
            .limit(1)
            .first()
            is not None
        )
    finally:
        db.close()


async def run_controllers():
    # Controller runs as a separate service, so ensure schema exists on startup.
    Base.metadata.create_all(bind=engine)

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
            users = db.query(User).filter(User.wb_api_token.isnot(None)).all()
            db.close()

            current_user_ids = set()

            for user in users:
                token = str(user.wb_api_token).strip()
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
