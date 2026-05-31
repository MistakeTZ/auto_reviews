import json

from processor.gpt import AsyncOpenAIClient
from prompts import (
    QUESTION_ANSWER_STATE_SYSTEM_PROMPT,
    QUESTION_REPLY_SYSTEM_PROMPT,
    QUESTION_REPLY_SYSTEM_PROMPT_SHORT,
)


async def generate_question_reply_text(
    client: AsyncOpenAIClient,
    question_summary: str,
    product_data: str,
    custom_prompt: str = "",
) -> str:
    if custom_prompt:
        system_prompt = f"{custom_prompt}\n{QUESTION_REPLY_SYSTEM_PROMPT_SHORT}"
    else:
        system_prompt = QUESTION_REPLY_SYSTEM_PROMPT

    generated = await client.chat_completion(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": product_data[:3000]},
            {"role": "user", "content": question_summary},
        ],
        model="gpt-5-nano",
        temperature=0.4,
        max_tokens=4000,
    )
    return str(generated or "").strip()


async def classify_question_reply_state(
    client: AsyncOpenAIClient,
    question_summary: str,
    reply_text: str,
) -> str:
    raw = await client.chat_completion(
        messages=[
            {
                "role": "system",
                "content": QUESTION_ANSWER_STATE_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": (
                    f"Вопрос:\n{question_summary[:200]}\n\n"
                    f"Ответ:\n{reply_text[:200]}"
                ),
            },
        ],
        model="gpt-4o-mini",
        temperature=0.2,
        max_tokens=400,
    )

    raw_str = str(raw).strip()
    start = raw_str.find("{")
    end = raw_str.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            data = json.loads(raw_str[start : end + 1])
            if isinstance(data, dict):
                return "wbRu" if bool(data.get("global_answer", False)) else "none"
        except json.JSONDecodeError:
            pass

    return "none"