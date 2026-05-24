import asyncio
import os
import sys
import httpx
import logging
from typing import Any, Optional

from database import SessionLocal
import models

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def _bot_url(token: str) -> str:
    return f"https://api.telegram.org/bot{token}"


async def _send_message(
    client: httpx.AsyncClient, bot_url: str, chat_id: str, text: str
):
    await client.post(
        f"{bot_url}/sendMessage",
        json={
            "chat_id": chat_id,
            "text": text,
        },
    )


async def configure_webhook(token: str, bot_type: str, base_url: str, secret: str):
    if not token or token.strip() == "":
        logger.warning("[%s] Token not found, webhook setup skipped.", bot_type)
        return

    if not base_url or not secret:
        logger.warning(
            "[%s] BOT_WEBHOOK_BASE_URL or BOT_WEBHOOK_SECRET missing, webhook setup skipped.",
            bot_type,
        )
        return

    bot_url = _bot_url(token)
    webhook_url = f"{base_url.rstrip('/')}/api/bot/webhook/{bot_type}/{secret}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{bot_url}/setWebhook",
                json={
                    "url": webhook_url,
                    "secret_token": secret,
                    "allowed_updates": ["message"],
                    "drop_pending_updates": True,
                },
            )
            response.raise_for_status()
            data = response.json()
            logger.info("[%s] setWebhook result: %s", bot_type, data)
        except Exception as exc:
            logger.exception("[%s] Failed to set webhook: %s", bot_type, exc)


async def process_update(update: dict[str, Any], token: str, bot_type: str):
    message = update.get("message")
    if not message:
        return

    chat_id = str(message["chat"]["id"])
    text = message.get("text", "").strip()
    bot_url = _bot_url(token)

    async with httpx.AsyncClient(timeout=30.0) as client:
        if text.startswith("/start"):
            parts = text.split(maxsplit=1)
            if len(parts) > 1:
                user_uuid = parts[1].strip()
                await process_start_code(user_uuid, chat_id, bot_type, client, bot_url)
            else:
                await _send_message(
                    client,
                    bot_url,
                    chat_id,
                    "Привет! Пожалуйста, используйте ссылку активации из настроек вашего кабинета, чтобы подключить уведомления.",
                )


async def run_bot_poller(token: str, bot_type: str):
    if not token or token.strip() == "":
        logging.warning(f"[{bot_type}] Token not found, poller skipped.")
        return

    logging.info(f"[{bot_type}] Starting bot poller...")
    url = _bot_url(token)
    offset = 0

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Delete webhook first to ensure polling works
        try:
            await client.get(f"{url}/deleteWebhook")
        except Exception as e:
            logging.warning("[%s] deleteWebhook exception: %s", bot_type, e)

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
                    try:
                        await process_update(update, token, bot_type)
                    except Exception as exc:
                        logging.warning(
                            "[%s] Failed to process update: %s", bot_type, exc
                        )
            except Exception as e:
                logging.warning("[%s] Error in update poller loop: %s", bot_type, e)
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
        logging.info(f"[{bot_type}] Error linking user by uuid={user_uuid}: {e}")
        try:
            await _send_message(
                client,
                bot_url,
                chat_id,
                "Произошла внутренняя ошибка при попытке привязать аккаунт к уведомлениям.",
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
    webhook_base_url = os.getenv("BOT_WEBHOOK_BASE_URL", "").strip()
    webhook_secret = os.getenv("BOT_WEBHOOK_SECRET", "").strip()

    if not tg_token and not max_token:
        logging.info(
            "No bot tokens specified in environment variables (TG_BOT_TOKEN / MAX_BOT_TOKEN). Exiting..."
        )
        return

    if webhook_base_url and webhook_secret:
        logging.info("Webhook mode enabled.")
        await configure_webhook(tg_token, "telegram", webhook_base_url, webhook_secret)
        if max_token:
            await configure_webhook(max_token, "max", webhook_base_url, webhook_secret)

        # Keep process alive for container health and logs.
        await asyncio.Event().wait()
        return

    await asyncio.gather(
        run_bot_poller(tg_token, "telegram"),  # run_bot_poller(max_token, "max")
    )


if __name__ == "__main__":
    asyncio.run(main())
