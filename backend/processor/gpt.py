from typing import Optional

import openai


class AsyncOpenAIClient:
    def __init__(self, api_key: Optional[str] = None):
        if not api_key:
            self.client = None
            return
        self.client = openai.AsyncOpenAI(api_key=api_key)

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
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
