import httpx
import logging

logger = logging.getLogger("wb_chat_client")


class WBChatClient:
    BASE_URL = "https://buyer-chat-api.wildberries.ru/api/v1/seller"

    def __init__(self, client: httpx.AsyncClient | None = None):
        # Если клиент передан извне (например, общий пул раннера) — используем его
        self._client = client
        self._external_client = client is not None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=15.0)
            self._external_client = False
        return self._client

    def _headers(self, token: str) -> dict:
        return {"Authorization": token.strip()}

    async def get_chats(self, token: str) -> list:
        client = await self._get_client()
        response = await client.get(
            f"{self.BASE_URL}/chats", headers=self._headers(token)
        )
        response.raise_for_status()
        return response.json().get("result") or []

    async def get_events(self, token: str, cursor: int) -> dict:
        client = await self._get_client()
        response = await client.get(
            f"{self.BASE_URL}/events",
            params={"next": cursor},
            headers=self._headers(token),
        )
        response.raise_for_status()
        return response.json().get("result") or {}

    async def send_message(self, token: str, reply_sign: str, text: str) -> dict:
        client = await self._get_client()
        response = await client.post(
            f"{self.BASE_URL}/message",
            headers=self._headers(token),
            json={"replySign": reply_sign, "message": text},
        )
        try:
            data = response.json()
        except Exception:
            response.raise_for_status()
        if not data.get("result"):
            logger.warning(data)
            response.raise_for_status()

        return response.json().get("result") or {}

    async def close(self):
        if self._client and not self._external_client and not self._client.is_closed:
            await self._client.aclose()
