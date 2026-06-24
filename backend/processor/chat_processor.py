import asyncio
import json
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

    async def _parse_response(self, response: aiohttp.ClientResponse, method: str, url: str):
        try:
            return await response.json()
        except aiohttp.ContentTypeError:
            text = await response.text()
            if not text.strip():
                # WB often returns empty body on success for write endpoints.
                return {}
            logger.warning(
                "[wb] non-json %s response status=%s url=%s body=%s",
                method,
                response.status,
                url,
                text[:500],
            )
            return {
                "status": response.status,
                "raw": text,
            }
        except Exception as exc:
            logger.warning(
                "[wb] failed to parse %s response status=%s url=%s: %s",
                method,
                response.status,
                url,
                exc,
            )
            return {
                "status": response.status,
                "error": str(exc),
            }

    async def _get(self, url, params=None):
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.get(url, params=params) as response:
                return await self._parse_response(response, "GET", url)

    async def _post(self, url, json_data=None):
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.post(url, json=json_data) as response:
                return await self._parse_response(response, "POST", url)

    async def _patch(self, url, json_data=None):
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.patch(url, json=json_data) as response:
                return await self._parse_response(response, "PATCH", url)

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

    async def get_feedback(self, feedback_id: str) -> Dict:
        url = "https://feedbacks-api.wildberries.ru/api/v1/feedback"
        res = await self._get(url, params={"id": feedback_id})
        if not isinstance(res, dict):
            return {}

        data = res.get("data")
        if isinstance(data, dict):
            feedback = data.get("feedback")
            if isinstance(feedback, dict):
                return feedback
            return data
        return {}

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

    async def answer_feedback(
        self,
        feedback_id: str,
        text: str,
        only_post: bool = False,
    ) -> Dict:
        text = (
            text.replace("\\n", "\n")
            .replace("\\r", "\r")
            .replace("\\", "")
        )
        logger.info(f"Answer feedback: {feedback_id}, text: {text}")

        url = "https://feedbacks-api.wildberries.ru/api/v1/feedbacks/answer"
        payload = {"id": feedback_id, "text": text}
        last_response = {}
        methods = (
            [self._post]
            if only_post
            else [
                self._post,
                self._patch,
            ]
        )
        for request in methods:
            try:
                res = await request(url, json_data=payload)
            except Exception as exc:
                logger.warning(
                    "[feedbacks] answer request failed method=%s feedback_id=%s: %s",
                    request.__name__,
                    feedback_id,
                    exc,
                )
                continue
            if not res:
                return True

            if isinstance(res, dict) and not res.get("error") and not res.get("errors"):
                return True

            last_response = last_response or res

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
