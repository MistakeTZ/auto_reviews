import asyncio
import logging
import os

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("controller_runner")

from database import SessionLocal
from models import User
from processor.chat_processor import ChatProcessor
from processor.gpt import AsyncOpenAIClient
from processor.controller import build_controller


async def run_controllers():
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        logger.warning(
            "OPENAI_API_KEY is not set. Controller will fail on GPT tasks if called."
        )

    gpt_client = AsyncOpenAIClient(api_key=openai_api_key)

    controllers = {}

    while True:
        try:
            db = SessionLocal()
            users = db.query(User).filter(User.wb_api_token.isnot(None)).all()
            db.close()

            current_user_ids = set()

            for user in users:
                token = str(user.wb_api_token).strip()
                if not token:
                    continue

                current_user_ids.add(user.id)

                if user.id not in controllers:
                    logger.info(f"Initializing controller for user {user.id}")
                    processor = ChatProcessor(api_key=token)
                    controllers[user.id] = build_controller(
                        processor=processor,
                        gpt_client=gpt_client,
                        poll_interval=0,
                        use_gpt_for_feedbacks=True,
                        user_id=user.id,
                        db_factory=SessionLocal,
                    )

                logger.info(f"Polling for user {user.id}...")
                controller = controllers[user.id]
                try:
                    await controller.poll_once()
                except Exception as e:
                    logger.exception(f"Error polling for user {user.id}: {e}")

            for user_id in list(controllers.keys()):
                if user_id not in current_user_ids:
                    logger.info(f"Removing controller for user {user_id}")
                    del controllers[user_id]

        except Exception as e:
            logger.exception(f"Main loop error: {e}")

        logger.info("Sleeping for 60 seconds before next poll...")
        await asyncio.sleep(60)


if __name__ == "__main__":
    try:
        asyncio.run(run_controllers())
    except KeyboardInterrupt:
        logger.info("Controller stopped.")
