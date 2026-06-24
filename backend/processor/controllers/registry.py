import asyncio
from typing import Callable, Dict
from processor.chat_processor import ChatProcessor
from processor.services.gpt.gpt import AsyncOpenAIClient
from processor.controllers.review_controller import ReviewController
from processor.controllers.question_controller import QuestionController
from processor.controllers.feedback_generator import FeedbackGenerator


class UserContextContainer:
    def __init__(
        self, review_ctrl: ReviewController, question_ctrl: QuestionController
    ):
        self.review = review_ctrl
        self.question = question_ctrl

    async def poll_once(self, full_check: bool = False):
        await asyncio.gather(
            self.question.poll(full_check),
            self.review.poll(full_check),
        )


class ControllerRegistry:
    def __init__(self):
        self._controllers: Dict[int, UserContextContainer] = {}
        self._lock = (
            asyncio.Lock()
        )  # Защита от Race Condition при параллельном обращении

    async def get_or_create(
        self,
        user_id: int,
        token: str,
        gpt_client: AsyncOpenAIClient,
        db_factory: Callable,
    ) -> UserContextContainer:
        async with self._lock:
            if user_id in self._controllers:
                return self._controllers[user_id]

            processor = ChatProcessor(api_key=token)
            generator = FeedbackGenerator(gpt_client=gpt_client, use_gpt=True)

            review_ctrl = ReviewController(user_id, processor, generator, db_factory)
            question_ctrl = QuestionController(
                user_id, processor, gpt_client, db_factory
            )

            container = UserContextContainer(review_ctrl, question_ctrl)
            self._controllers[user_id] = container
            return container

    def remove(self, user_id: int):
        self._controllers.pop(user_id, None)

    def active_ids(self) -> set:
        return set(self._controllers.keys())
