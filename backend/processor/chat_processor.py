import asyncio
import logging
from typing import Dict, List, Optional

import aiohttp

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ChatProcessor:
    def __init__(self, api_key):
        self.headers = {
            "Authorization": api_key,
            "Content-Type": "application/json",
        }

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        return True

    async def _get(self, url, params=None):
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.get(url, params=params) as response:
                return await response.json()

    async def _post(self, url, json_data=None):
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.post(url, json=json_data) as response:
                return await response.json()

    async def _patch(self, url, json_data=None):
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.patch(url, json=json_data) as response:
                return await response.json()

    async def get_feedbacks(
        self,
        is_answered: bool = False,
        take: int = 2,
        skip: int = 0,
    ) -> List[Dict]:
        if is_answered == "all":
            answered = await self.get_feedbacks(is_answered=True, take=take, skip=skip)
            await asyncio.sleep(0.5)
            unanswered = await self.get_feedbacks(
                is_answered=False, take=take, skip=skip
            )
            return answered + unanswered

        url = "https://feedbacks-api.wildberries.ru/api/v1/feedbacks"

        res = await self._get(
            url,
            params={"isAnswered": str(is_answered).lower(), "take": take, "skip": skip},
        )
        return res.get("data", {}).get("feedbacks", []) if isinstance(res, dict) else []

    async def send_message(self, reply_sign: str, text: str):
        url = "https://buyer-chat-api.wildberries.ru/api/v1/seller/message"
        return await self._post(
            url,
            json_data={"replySign": reply_sign, "message": text},
        )

    async def get_questions(
        self,
        is_answered: bool = False,
        take: int = 50,
        skip: int = 0,
    ) -> List[Dict]:
        url = "https://feedbacks-api.wildberries.ru/api/v1/questions"
        res = await self._get(
            url,
            params={"isAnswered": str(is_answered).lower(), "take": take, "skip": skip},
        )
        return res.get("data", {}).get("questions", []) if isinstance(res, dict) else []

    async def get_chat_messages(
        self,
        take: int = 20,
    ) -> List[Dict]:
        url = "https://buyer-chat-api.wildberries.ru/api/v1/seller/chats"
        res = await self._get(
            url,
            params={"limit": take, "offset": 0},
        )
        if isinstance(res, list):
            return res
        if isinstance(res, dict):
            return res.get("result", res.get("chats", []))
        return []

    async def get_chat_events(
        self,
        next_cursor: Optional[int] = None,
        limit: int = 100,
    ) -> Dict:
        url = "https://buyer-chat-api.wildberries.ru/api/v1/seller/events"
        params = {"limit": limit}
        if next_cursor:
            params["next"] = next_cursor
        res = await self._get(
            url,
            params=params,
        )
        return res.get("result", {}) if isinstance(res, dict) else {}

    async def get_chat_history(
        self,
        chat_id: str,
        take: int = 30,
        offset: int = 0,
    ) -> List[Dict]:
        # Wildberries chat APIs have had small path/payload differences over time,
        # so we try a couple of known variants.
        endpoints = [
            (
                "https://buyer-chat-api.wildberries.ru/api/v1/seller/chat/history",
                {"chatID": chat_id, "limit": take, "offset": offset},
            ),
            (
                "https://buyer-chat-api.wildberries.ru/api/v1/seller/chat/messages",
                {"chatID": chat_id, "limit": take, "offset": offset},
            ),
            (
                f"https://buyer-chat-api.wildberries.ru/api/v1/seller/chats/{chat_id}/messages",
                {"limit": take, "offset": offset},
            ),
        ]

        for url, params in endpoints:
            try:
                res = await self._get(url, params=params)
            except Exception:
                continue

            if isinstance(res, list):
                return res
            if isinstance(res, dict):
                result = res.get("result", res)
                if isinstance(result, list):
                    return result
                if isinstance(result, dict):
                    for key in ("messages", "items", "data"):
                        candidate = result.get(key)
                        if isinstance(candidate, list):
                            return candidate
        return []

    async def answer_feedback(
        self,
        feedback_id: str,
        text: str,
    ) -> Dict:
        logger.info(f"Answer feedback: {feedback_id}, text: {text}")
        return {"feedback_id": feedback_id, "text": text}
        endpoints = [
            (
                "https://feedbacks-api.wildberries.ru/api/v1/feedbacks/answer",
                {"id": feedback_id, "text": text},
            ),
            (
                "https://feedbacks-api.wildberries.ru/api/v1/feedbacks",
                {"id": feedback_id, "text": text},
            ),
        ]

        last_response = {}
        for url, payload in endpoints:
            for request in (self._post, self._patch):
                try:
                    res = await request(url, json_data=payload)
                except Exception:
                    continue
                if res.status == 204:
                    return True

                last_response = res

        return last_response

    async def answer_question(
        self, question_id: str, text: str, state: str = "none"
    ) -> Dict:
        url = "https://feedbacks-api.wildberries.ru/api/v1/questions"
        payload = {"id": question_id, "answer": {"text": text}, "state": state}
        res = await self._patch(url, json_data=payload)
        return res if isinstance(res, dict) else {"raw": res}

    async def get_count_unanswered_questions(self) -> int:
        url = "https://feedbacks-api.wildberries.ru/api/v1/questions/count-unanswered"
        res = await self._get(url)
        if isinstance(res, dict):
            return int(res.get("data", {}).get("countUnanswered", 0))
        return 0

    async def get_count_unanswered_feedbacks(self) -> int:
        url = "https://feedbacks-api.wildberries.ru/api/v1/feedbacks/count-unanswered"
        res = await self._get(url)
        if isinstance(res, dict):
            return int(res.get("data", {}).get("countUnanswered", 0))
        return 0

    async def get_questions_by_nm_ids(
        self,
        nm_ids: List[int],
        take: int = 10000,
    ) -> List[Dict]:
        url = "https://feedbacks-api.wildberries.ru/api/v1/questions"
        all_questions: List[Dict] = []
        for nm_id in nm_ids:
            for is_answered in (True, False):
                res = await self._get(
                    url,
                    params={
                        "isAnswered": str(is_answered).lower(),
                        "nmId": nm_id,
                        "take": take,
                        "skip": 0,
                    },
                )
                questions = (
                    res.get("data", {}).get("questions", [])
                    if isinstance(res, dict)
                    else []
                )
                all_questions.extend(questions)
                await asyncio.sleep(0.35)
        return all_questions

    async def get_chat_history_by_nm_ids(
        self,
        nm_ids: List[int],
        take: int = 30,
    ) -> Dict[str, List[Dict]]:
        nm_id_set = set(nm_ids)
        chats = await self.get_chat_messages(take=1000)
        result: Dict[str, List[Dict]] = {}
        for chat in chats:
            good_card = chat.get("goodCard") or {}
            if good_card.get("nmID") in nm_id_set:
                chat_id = str(chat.get("chatID", ""))
                if not chat_id:
                    continue
                messages = await self.get_chat_history(chat_id=chat_id, take=take)
                result[chat_id] = messages
        return result
