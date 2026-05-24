import asyncio
import os
import sys
import httpx
import logging

from database import SessionLocal
import models

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


async def run_bot_poller(token: str, bot_type: str):
    if not token or token.strip() == "":
        logging.warning(f"[{bot_type}] Token not found, poller skipped.")
        return

    logging.info(f"[{bot_type}] Starting bot poller...")
    url = f"https://api.telegram.org/bot{token}"
    offset = 0

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Delete webhook first to ensure polling works
        try:
            await client.get(f"{url}/deleteWebhook")
        except Exception as e:
            logging.warning(f"[{bot_type}] deleteWebhook exception:", e)

        while True:
            try:
                res = await client.get(
                    f"{url}/getUpdates", params={"offset": offset, "timeout": 20}
                )
                if res.status_code != 200:
                    await asyncio.sleep(5)
                    continue

                data = res.json()
                if not data.get("ok"):
                    await asyncio.sleep(5)
                    continue

                for update in data.get("result", []):
                    offset = update["update_id"] + 1
                    message = update.get("message")
                    if not message:
                        continue

                    chat_id = str(message["chat"]["id"])
                    text = message.get("text", "").strip()

                    if text.startswith("/start"):
                        parts = text.split(maxsplit=1)
                        if len(parts) > 1:
                            user_uuid = parts[1].strip()
                            await process_start_code(
                                user_uuid, chat_id, bot_type, client, url
                            )
                        else:
                            await client.post(
                                f"{url}/sendMessage",
                                json={
                                    "chat_id": chat_id,
                                    "text": "Привет! Пожалуйста, используйте ссылку активации из настроек вашего кабинета, чтобы подключить уведомления.",
                                },
                            )
            except Exception as e:
                logging.warning(f"[{bot_type}] Error in update poller loop:", e)
                await asyncio.sleep(5)


async def process_start_code(
    user_uuid: str,
    chat_id: str,
    bot_type: str,
    client: httpx.AsyncClient,
    bot_url: str,
):
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.uuid == user_uuid).first()
        if not user:
            await client.post(
                f"{bot_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": "Ошибка: Пользователь с таким UUID не найден. Убедитесь, что ссылка верна.",
                },
            )
            return

        # Check maximum of 5 methods per user limit
        existing = (
            db.query(models.NotificationMethod)
            .filter(models.NotificationMethod.user_id == user.id)
            .all()
        )
        if len(existing) >= 5:
            await client.post(
                f"{bot_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": f"Превышен лимит: У вас уже добавлено {len(existing)} способов уведомлений. Максимально разрешено — 5.",
                },
            )
            return

        # Check if already registered
        existing_dup = (
            db.query(models.NotificationMethod)
            .filter(
                models.NotificationMethod.user_id == user.id,
                models.NotificationMethod.type == bot_type,
                models.NotificationMethod.value == chat_id,
            )
            .first()
        )

        if existing_dup:
            await client.post(
                f"{bot_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": f"Этот {bot_type.capitalize()} чат уже подключен для получения уведомлений!",
                },
            )
            return

        # Add the notification method!
        new_method = models.NotificationMethod(
            user_id=user.id, type=bot_type, value=chat_id, is_active=True
        )
        db.add(new_method)
        db.commit()

        await client.post(
            f"{bot_url}/sendMessage",
            json={
                "chat_id": chat_id,
                "text": f"Успешно! Ваш {bot_type.capitalize()} подключен для получения уведомлений об автоответах.",
            },
        )
        logging.info(
            f"[{bot_type}] Linked chat_id={chat_id} to user_id={user.id} ({user.email}) successfully."
        )
    except Exception as e:
        logging.info(f"[{bot_type}] Error linking user by uuid={user_uuid}:", e)
        try:
            await client.post(
                f"{bot_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": "Произошла внутренняя ошибка при попытке привязать аккаунт к уведомлениям.",
                },
            )
        except:
            logging.warning(
                f"[{bot_type}] Failed to send error message to chat_id={chat_id}"
            )
            pass
    finally:
        db.close()


async def main():
    tg_token = os.getenv("TG_BOT_TOKEN")
    max_token = os.getenv("MAX_BOT_TOKEN")

    if not tg_token and not max_token:
        logging.info(
            "No bot tokens specified in environment variables (TG_BOT_TOKEN / MAX_BOT_TOKEN). Exiting..."
        )
        return

    await asyncio.gather(
        run_bot_poller(tg_token, "telegram"),  # run_bot_poller(max_token, "max")
    )


if __name__ == "__main__":
    asyncio.run(main())
