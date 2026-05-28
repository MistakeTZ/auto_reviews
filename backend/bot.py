import asyncio
import enum
import logging
import os
import sys
from dataclasses import dataclass
from typing import Any, Optional, Protocol

from database import SessionLocal
import models
import httpx

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))


class BotType(enum.StrEnum):
    TELEGRAM = "telegram"
    MAX = "max"


# =====================================================================
# АБСТРАКЦИИ И КЛИЕНТЫ API
# =====================================================================
class BotClient(Protocol):
    """Интерфейс для унифицированной работы с API разных мессенджеров."""

    async def send_message(self, chat_id: str, text: str) -> None: ...


class TelegramBotClient:
    def __init__(self, http_client: httpx.AsyncClient, token: str):
        self.client = http_client
        self.base_url = f"https://api.telegram.org/bot{token}"

    async def send_message(self, chat_id: str, text: str) -> None:
        try:
            res = await self.client.post(
                f"{self.base_url}/sendMessage", json={"chat_id": chat_id, "text": text}
            )
            res.raise_for_status()
        except Exception as e:
            logger.warning("[Telegram] Failed to send message to %s: %s", chat_id, e)

    async def set_webhook(self, url: str, secret: str) -> None:
        res = await self.client.post(
            f"{self.base_url}/setWebhook",
            json={
                "url": url,
                "secret_token": secret,
                "allowed_updates": ["message"],
                "drop_pending_updates": True,
            },
        )
        res.raise_for_status()

    async def delete_webhook(self) -> None:
        await self.client.get(f"{self.base_url}/deleteWebhook")


class MaxBotClient:
    def __init__(self, http_client: httpx.AsyncClient, token: str):
        self.client = http_client
        self.headers = {"Authorization": token, "Content-Type": "application/json"}

    async def send_message(self, chat_id: str, text: str) -> None:
        try:
            res = await self.client.post(
                f"https://platform-api.max.ru/messages?chat_id={chat_id}",
                headers=self.headers,
                json={"text": text},
            )
            res.raise_for_status()
        except Exception as e:
            logger.warning("[Max] Failed to send message to %s: %s", chat_id, e)

    async def set_webhook(self, url: str, secret: str) -> None:
        res = await self.client.post(
            "https://platform-api.max.ru/subscriptions",
            headers=self.headers,
            json={
                "url": url,
                "update_types": ["message_created", "bot_started"],
                "secret": secret,
            },
        )
        res.raise_for_status()

    async def delete_webhook(self, target_url: str) -> None:
        await self.client.request(
            "DELETE",
            "https://platform-api.max.ru/subscriptions",
            headers=self.headers,
            params={"url": target_url},
        )


@dataclass
class BotContext:
    """Контекст пришедшего обновления, независимый от платформы."""

    bot_type: BotType
    chat_id: str
    start_code: Optional[str]
    client: BotClient


# =====================================================================
# БИЗНЕС-ЛОГИКА И ОБРАБОТКА ОБНОВЛЕНИЙ
# =====================================================================
def parse_tg_update(update: dict[str, Any], client: BotClient) -> Optional[BotContext]:
    message = update.get("message")
    if not message:
        return None

    chat_id = str(message["chat"]["id"])
    text = message.get("text", "").strip()
    start_code = None

    if text.startswith("/start"):
        parts = text.split(maxsplit=1)
        start_code = parts[1].strip() if len(parts) > 1 else ""

    return BotContext(BotType.TELEGRAM, chat_id, start_code, client)


def parse_max_update(update: dict[str, Any], client: BotClient) -> Optional[BotContext]:
    update_type = update.get("update_type")
    chat_id = str(update.get("chat_id", ""))

    if not chat_id or update_type != "bot_started":
        return None

    # Платформа MAX передает диплинк напрямую в payload
    start_code = update.get("payload", "").strip() or ""
    return BotContext(BotType.MAX, chat_id, start_code, client)


async def process_update(context: BotContext):
    """Единая точка входа обработки нормализованного контекста."""
    if context.start_code is None:
        return

    if not context.start_code:
        await context.client.send_message(
            context.chat_id,
            f"Привет! Пожалуйста, используйте ссылку активации из настроек вашего кабинета, чтобы подключить уведомления {context.bot_type.upper()}.",
        )
        return

    await _link_user_notification(context)


async def _link_user_notification(ctx: BotContext):
    """Регистрация метода уведомлений в БД."""
    with SessionLocal() as db:
        try:
            user = (
                db.query(models.User).filter(models.User.uuid == ctx.start_code).first()
            )
            if not user:
                await ctx.client.send_message(
                    ctx.chat_id,
                    "Ошибка: Пользователь не найден. Убедитесь, что ссылка верна.",
                )
                return

            existing = (
                db.query(models.NotificationMethod)
                .filter(models.NotificationMethod.user_id == user.id)
                .all()
            )
            if len(existing) >= 5:
                await ctx.client.send_message(
                    ctx.chat_id,
                    f"Превышен лимит: добавлено {len(existing)} из 5 способов уведомлений.",
                )
                return

            is_duplicate = any(
                m.type == ctx.bot_type and m.value == ctx.chat_id for m in existing
            )
            if is_duplicate:
                await ctx.client.send_message(
                    ctx.chat_id, f"Этот {ctx.bot_type.capitalize()} чат уже подключен!"
                )
                return

            new_method = models.NotificationMethod(
                user_id=user.id, type=ctx.bot_type, value=ctx.chat_id, is_active=True
            )
            db.add(new_method)
            db.commit()

            await ctx.client.send_message(
                ctx.chat_id,
                f"Успешно! Ваш {ctx.bot_type.capitalize()} подключен для получения уведомлений.",
            )
            logger.info(
                "[%s] Linked chat_id=%s to user_id=%s successfully.",
                ctx.bot_type,
                ctx.chat_id,
                user.id,
            )

        except Exception as e:
            logger.exception(
                "[%s] Error linking user by uuid=%s: %s",
                ctx.bot_type,
                ctx.start_code,
                e,
            )
            await ctx.client.send_message(
                ctx.chat_id, "Произошла внутренняя ошибка при привязке аккаунта."
            )


# =====================================================================
# ИНИЦИАЛИЗАЦИЯ И ПОЛЛИНГ (POLLING MODE)
# =====================================================================
async def configure_webhook(bot_type: BotType, token: str, base_url: str, secret: str):
    if not token or token.strip() == "" or not base_url or not secret:
        logger.warning("[%s] Configuration missing. Webhook setup skipped.", bot_type)
        return

    webhook_url = f"{base_url.rstrip('/')}/api/bot/webhook/{bot_type}/{secret}"
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        try:
            if bot_type == BotType.TELEGRAM:
                client = TelegramBotClient(http_client, token)
                await client.set_webhook(webhook_url, secret)
            elif bot_type == BotType.MAX:
                client = MaxBotClient(http_client, token)
                await client.set_webhook(webhook_url, secret)
            logger.info("[%s] Webhook successfully configured.", bot_type)
        except Exception as exc:
            logger.exception("[%s] Failed to set webhook: %s", bot_type, exc)


async def run_bot_poller(bot_type: BotType, token: str):
    if not token or token.strip() == "":
        logger.warning("[%s] Token not found, poller skipped.", bot_type)
        return

    logger.info("[%s] Starting bot poller...", bot_type)

    async with httpx.AsyncClient(timeout=30.0) as http_client:
        if bot_type == BotType.TELEGRAM:
            tg_client = TelegramBotClient(http_client, token)
            await _run_tg_loop(tg_client)
        elif bot_type == BotType.MAX:
            max_client = MaxBotClient(http_client, token)
            await _run_max_loop(max_client)


async def _run_tg_loop(client: TelegramBotClient):
    try:
        await client.delete_webhook()
    except Exception as e:
        logger.warning("[Telegram] deleteWebhook exception: %s", e)

    offset = 0
    while True:
        try:
            res = await client.client.get(
                f"{client.base_url}/getUpdates",
                params={"offset": offset, "timeout": 20},
            )
            if res.status_code != 200 or not res.json().get("ok"):
                await asyncio.sleep(5)
                continue

            for update in res.json().get("result", []):
                offset = update["update_id"] + 1
                ctx = parse_tg_update(update, client)
                if ctx:
                    await process_update(ctx)
        except Exception as e:
            logger.warning("[Telegram] Error in poller loop: %s", e)
            await asyncio.sleep(5)


async def _run_max_loop(client: MaxBotClient):
    # Пытаемся отписаться от вебхука, если параметры доступны (требование MAX API для Long Polling)
    webhook_url = f"{os.getenv('BOT_WEBHOOK_BASE_URL', '').rstrip('/')}/api/bot/webhook/max/{os.getenv('BOT_WEBHOOK_SECRET', '')}"
    if os.getenv("BOT_WEBHOOK_BASE_URL"):
        try:
            await client.delete_webhook(webhook_url)
        except Exception as e:
            logger.warning("[Max] DELETE /subscriptions exception: %s", e)

    while True:
        try:
            res = await client.client.get(
                "https://platform-api.max.ru/updates",
                headers=client.headers,
                params={"timeout": 20},
            )
            if res.status_code != 200:
                await asyncio.sleep(5)
                continue

            updates = res.json()
            if isinstance(updates, list):
                for update in updates:
                    ctx = parse_max_update(update, client)
                    if ctx:
                        await process_update(ctx)
        except Exception as e:
            logger.warning("[Max] Error in poller loop: %s", e)
            await asyncio.sleep(5)


# =====================================================================
# ТОЧКА ВХОДА
# =====================================================================
async def main():
    tg_token = os.getenv("TG_BOT_TOKEN")
    max_token = os.getenv("MAX_BOT_TOKEN")
    webhook_base_url = os.getenv("BOT_WEBHOOK_BASE_URL", "").strip()
    webhook_secret = os.getenv("BOT_WEBHOOK_SECRET", "").strip()

    if not tg_token and not max_token:
        logger.info("No bot tokens specified in environment. Exiting...")
        return

    # Режим Webhook
    if webhook_base_url and webhook_secret:
        logger.info("Webhook mode enabled.")
        if tg_token:
            await configure_webhook(
                BotType.TELEGRAM, tg_token, webhook_base_url, webhook_secret
            )
        if max_token:
            await configure_webhook(
                BotType.MAX, max_token, webhook_base_url, webhook_secret
            )

        await asyncio.Event().wait()
        return

    # Режим Polling
    tasks = []
    if tg_token:
        tasks.append(run_bot_poller(BotType.TELEGRAM, tg_token))
    if max_token:
        tasks.append(run_bot_poller(BotType.MAX, max_token))

    if tasks:
        await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
