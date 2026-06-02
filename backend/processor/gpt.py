import logging
from typing import Optional

import openai

logger = logging.getLogger(__name__)


class AsyncOpenAIClient:
    def __init__(self, api_key: Optional[str] = None):
        if not api_key:
            self.client = None
            return
        self.client = openai.AsyncOpenAI(api_key=api_key)

    @staticmethod
    def _adapt_messages(messages: list) -> list:
        """Convert 'system' role to 'developer' for reasoning models."""
        return [
            {**m, "role": "developer"} if m.get("role") == "system" else m
            for m in messages
        ]

    async def chat_completion(
        self,
        messages: list,
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Send a chat message and get a response."""
        if not self.client:
            return ""
        response = await self.client.chat.completions.create(
            model=model,
            messages=self._adapt_messages(messages),
            # temperature=temperature,
            # max_tokens=max_tokens,
            max_completion_tokens=max_tokens,
            reasoning_effort="low",
        )
        if response.usage and response.usage.completion_tokens_details:
            logger.info(
                "Chat completion tokens usage: %s",
                response.usage.completion_tokens_details.model_dump_json(
                    ensure_ascii=False
                ),
            )
        return response.choices[0].message.content.strip()


# from typing import Optional

# import openai


# class AsyncOpenAIClient:
#     def __init__(self, api_key: Optional[str] = None):
#         if not api_key:
#             self.client = None
#             return
#         self.client = openai.AsyncOpenAI(api_key=api_key)

#     async def chat_completion(
#         self,
#         messages: list,
#         model: str = "gpt-4",
#         temperature: float = 0.7,
#         max_tokens: Optional[int] = None,
#     ) -> str:
#         """Send a chat message and get a response."""
#         if not self.client:
#             return ""

#         response = await self.client.chat.completions.create(
#             **self._build_request_kwargs(
#                 model=model,
#                 messages=messages,
#                 temperature=temperature,
#                 max_tokens=max_tokens,
#             )
#         )
#         content = self._extract_content(response)

#         if content:
#             return content

#         if self._should_retry_with_more_tokens(response, max_tokens):
#             retry_max_tokens = max(max_tokens * 4, max_tokens + 512)
#             retry_response = await self.client.chat.completions.create(
#                 **self._build_request_kwargs(
#                     model=model,
#                     messages=messages,
#                     temperature=temperature,
#                     max_tokens=retry_max_tokens,
#                 )
#             )
#             return self._extract_content(retry_response)

#         return ""

#     def _build_request_kwargs(
#         self,
#         *,
#         model: str,
#         messages: list,
#         temperature: float,
#         max_tokens: Optional[int],
#     ) -> dict:
#         request_kwargs = {
#             "model": model,
#             "messages": messages,
#         }

#         if max_tokens is not None:
#             request_kwargs["max_completion_tokens"] = max_tokens

#         # GPT-5 reasoning models are stricter about supported params.
#         if not model.startswith("gpt-5"):
#             request_kwargs["temperature"] = temperature

#         return request_kwargs

#     def _extract_content(self, response) -> str:
#         choices = getattr(response, "choices", None) or []
#         if not choices:
#             return ""

#         message = getattr(choices[0], "message", None)
#         content = getattr(message, "content", "")
#         return str(content or "").strip()

#     def _should_retry_with_more_tokens(self, response, max_tokens: Optional[int]) -> bool:
#         if not max_tokens:
#             return False

#         choices = getattr(response, "choices", None) or []
#         if not choices:
#             return False

#         finish_reason = getattr(choices[0], "finish_reason", None)
#         if finish_reason != "length":
#             return False

#         usage = getattr(response, "usage", None)
#         completion_details = getattr(usage, "completion_tokens_details", None)
#         reasoning_tokens = getattr(completion_details, "reasoning_tokens", 0) or 0
#         return reasoning_tokens >= max_tokens
