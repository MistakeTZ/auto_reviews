import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)


class AsyncOpenAIClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        if api_key:
            self.headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            }
        else:
            self.headers = {}

    async def chat_completion(
        self,
        messages: list,
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Send a chat message to Perplexity agent and get a response."""
        if not self.api_key:
            return ""

        # Map model name
        perplexity_model = model
        if perplexity_model.startswith("gpt-5"):
            perplexity_model = "openai/gpt-5.4-nano"
        elif perplexity_model == "gpt-4":
            perplexity_model = "openai/gpt-5.4-nano"

        # Construct input from messages
        system_parts = []
        other_parts = []
        for msg in messages:
            if msg.get("role") == "system":
                system_parts.append(msg.get("content", ""))
            else:
                other_parts.append(msg.get("content", ""))

        system_prompt = "\n".join(system_parts)
        user_content = "\n".join(other_parts)
        input_str = f"{system_prompt}\n\nUser: {user_content}\nAI:"

        payload = {
            "model": perplexity_model,
            "input": input_str,
        }

        if max_tokens is not None:
            try:
                payload["max_output_tokens"] = int(max_tokens)
            except (ValueError, TypeError):
                pass

        url = "https://api.perplexity.ai/v1/agent"
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=self.headers,
                )

                if response.status_code != 200:
                    logger.error(
                        "Perplexity API error: %d - %s",
                        response.status_code,
                        response.text,
                    )
                    return ""

                data = response.json()
                # Extract text using data.output?.[0]?.content?.[0]?.text
                output = data.get("output")
                if isinstance(output, list) and len(output) > 0:
                    content_list = output[0].get("content")
                    if isinstance(content_list, list) and len(content_list) > 0:
                        text = content_list[0].get("text")
                        if text:
                            return text.strip()

                logger.warning("Perplexity response format unexpected: %s", data)
                return ""
        except Exception as exc:
            logger.exception("Failed to call Perplexity API: %s", exc)
            return ""

