import logging
from processor.gpt import AsyncOpenAIClient
from prompts import FEEDBACK_REPLY_SUFFIX

logger = logging.getLogger("feedback_generator")


class FeedbackGenerator:
    """Выделенный чистый сервис для работы с OpenAI без зависимостей от СУБД."""

    def __init__(self, gpt_client: AsyncOpenAIClient, use_gpt: bool = True):
        self.gpt = gpt_client
        self.use_gpt = use_gpt

    async def generate_answer(self, feedback: dict, custom_prompt: str) -> str:
        valuation = feedback.get("productValuation")
        user_name = (feedback.get("userName") or "").strip()
        if user_name and user_name.startswith("Покупатель"):
            user_name = None

        if not self.use_gpt:
            is_positive = valuation is None or int(valuation) >= 4
            if is_positive:
                return (
                    f"Здравствуйте, {user_name}! Благодарим за отзыв и высокую оценку. Будем рады видеть Вас снова!"
                    if user_name
                    else "Здравствуйте! Благодарим за отзыв и высокую оценку. Будем рады видеть Вас снова!"
                )
            return (
                f"Здравствуйте, {user_name}! Сожалеем, что товар не оправдал Ваших ожиданий. Мы обязательно учтем Ваши замечания."
                if user_name
                else "Здравствуйте! Сожалеем, что товар не оправдал Ваших ожиданий. Мы обязательно учтем Ваши замечания."
            )

        parts = []
        if user_name:
            parts.append(f"Клиент: {user_name}")
        parts.append(f"Продукт: {str(feedback.get('subjectName') or '').strip()}")
        parts.append(f"Рейтинг: {valuation}/5")
        if (feedback.get("text") or "").strip():
            parts.append(f"Текст отзыва: {feedback.get('text')}")
        if (feedback.get("pros") or "").strip():
            parts.append(f"Достоинства: {feedback.get('pros')}")
        if (feedback.get("cons") or "").strip():
            parts.append(f"Недостатки: {feedback.get('cons')}")
        if bool(feedback.get("video")):
            parts.append("Клиент прикрепил видео")
        if len(feedback.get("photoLinks") or []):
            parts.append(f"Клиент прикрепил {len(feedback.get('photoLinks'))} фото")

        feedback_summary = "\n".join(parts)
        prompt = (FEEDBACK_REPLY_SUFFIX + (custom_prompt or "").strip()).strip()

        try:
            raw = await self.gpt.chat_completion(
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": feedback_summary},
                ],
                model="gpt-5-nano",
                temperature=0.3,
                max_tokens=1000,
            )
            return str(raw).strip()
        except Exception as exc:
            logger.exception(
                "AI Generation failure for review %s: %s", feedback.get("id"), exc
            )
            return ""
