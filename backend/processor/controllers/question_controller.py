import logging
from typing import Callable, Optional
from models import Question, User as DbUser
from schemas import QuestionCreate
from crud import upsert_question
from processor.chat_processor import ChatProcessor
from processor.gpt import AsyncOpenAIClient
from services.question_replies import (
    classify_question_reply_state,
    generate_question_reply_text,
)
from services.notifications import notify_question_processed

logger = logging.getLogger("question_controller")


class QuestionController:
    def __init__(
        self,
        user_id: int,
        processor: ChatProcessor,
        gpt_client: AsyncOpenAIClient,
        db_factory: Callable,
    ):
        self.user_id = user_id
        self.processor = processor
        self.gpt = gpt_client
        self.db_factory = db_factory

    async def poll(self, full_check: bool = False):
        question_mode = "manual"
        question_prompt = ""

        count = await self.processor.get_count_unanswered_questions()
        if not full_check and count == 0:
            return

        questions = await self.processor.get_questions(is_answered=False, take=50)
        if full_check:
            questions.extend(
                await self.processor.get_questions(is_answered=True, take=50)
            )

        if not questions:
            return

        with self.db_factory() as db:
            user = db.query(DbUser).filter(DbUser.id == self.user_id).first()
            if user:
                question_mode = (
                    str(user.question_answer_mode or "manual").strip().lower()
                )
                question_prompt = str(user.question_answer_prompt or "").strip()

        for q in questions:
            if not q.get("id"):
                continue
            exists, saved = await self._upsert_question_in_db(q)
            if not saved:
                continue

            proposed_answer = (saved.proposed_answer_text or "").strip()
            proposed_state = saved.state or "none"

            if (
                question_mode in {"confirm", "auto"}
                and not (saved.answer_text or "").strip()
                and not proposed_answer
            ):
                proposed_answer, proposed_state = await self._build_proposed_answer(
                    q, question_prompt
                )
                if proposed_answer:
                    with self.db_factory() as db:
                        db_q = (
                            db.query(Question)
                            .filter(
                                Question.id == saved.id,
                                Question.user_id == self.user_id,
                            )
                            .first()
                        )
                        if db_q:
                            db_q.proposed_answer_text = proposed_answer
                            db_q.state = proposed_state or db_q.state or "none"
                            db.commit()
                            saved = db_q

            if (
                question_mode == "auto"
                and proposed_answer
                and not (saved.answer_text or "").strip()
            ):
                await self._reply_automatically(saved, proposed_answer, proposed_state)

            if not exists:
                await notify_question_processed(self.db_factory, self.user_id, saved)

    async def _upsert_question_in_db(
        self, question: dict
    ) -> tuple[Optional[bool], Optional[Question]]:
        product_details = question.get("productDetails") or {}
        user_name = (question.get("userName") or "").strip()
        if user_name and user_name.startswith("Покупатель"):
            user_name = None

        question_data = QuestionCreate(
            wb_question_id=str(question.get("id")),
            nm_id=str(product_details.get("nmId") or ""),
            product_name=str(product_details.get("productName") or "Unknown Product"),
            text=question.get("text"),
            date=question.get("createdDate"),
            editable=bool(
                question.get("answer", {}).get("editable", True)
                if question.get("answer")
                else True
            ),
            state=question.get("state"),
            answer_text=(
                question.get("answer", {}).get("text")
                if question.get("answer")
                else None
            ),
            user_name=user_name,
        )
        try:
            with self.db_factory() as db:
                return upsert_question(db, question_data, self.user_id)
        except Exception as exc:
            logger.exception("Upsert question exception %s", question.get("id"), exc)
            return None, None

    async def _build_proposed_answer(
        self, question: dict, prompt: str
    ) -> tuple[str, str]:
        product_details = question.get("productDetails") or {}
        summary = f"Продукт: {product_details.get('productName')}\nВопрос: {question.get('text')}"
        reply_text = await generate_question_reply_text(
            self.gpt,
            question_summary=summary,
            product_data=f"ID: {product_details.get('nmId')}",
            custom_prompt=prompt,
        )
        if not reply_text:
            return "", "none"
        state = await classify_question_reply_state(
            self.gpt, question_summary=summary, reply_text=reply_text
        )
        return reply_text, state

    async def _reply_automatically(self, question: Question, text: str, state: str):
        try:
            with self.db_factory() as db:
                user = db.query(DbUser).filter(DbUser.id == self.user_id).first()
                if not user or not user.wb_api_token:
                    return

                async with ChatProcessor(user.wb_api_token) as proc:
                    res = await proc.answer_question(
                        question_id=question.wb_question_id,
                        text=text,
                        state=state or "none",
                    )

                if isinstance(res, dict) and (
                    res.get("error")
                    or res.get("errors")
                    or res.get("status", 200) >= 400
                ):
                    return

                db_q = (
                    db.query(Question)
                    .filter(
                        Question.id == question.id, Question.user_id == self.user_id
                    )
                    .first()
                )
                if db_q:
                    db_q.answer_text = text
                    db_q.proposed_answer_text = text
                    db_q.state = state or db_q.state or "none"
                    db.commit()
        except Exception as exc:
            logger.exception(
                "Auto answer fail on question %s", question.wb_question_id, exc
            )
