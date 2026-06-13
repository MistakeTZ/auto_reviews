from backend.services.wb_products import sync_user_products
from models import Question, Rule, User as DbUser
import asyncio
import json
import logging
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)

from processor.chat_processor import ChatProcessor
from processor.gpt import AsyncOpenAIClient
from crud import get_reviews, get_rules, upsert_question, upsert_review
from prompts import (
    CHAT_REPLY_DECISION_SYSTEM_PROMPT,
    FEEDBACK_REPLY_SUFFIX,
)
from schemas import QuestionCreate, ReviewCreate
from services.question_replies import (
    classify_question_reply_state,
    generate_question_reply_text,
)
from services.notifications import notify_question_processed, notify_review_processed


class MainController:
    def __init__(
        self,
        processor: ChatProcessor,
        gpt_client: AsyncOpenAIClient,
        poll_interval: int = 45,
        use_gpt_for_feedbacks: bool = True,
        user_id: Optional[int] = None,
        db_factory: Optional[Callable] = None,
        full_check_cycles: int = 60,
    ):
        self.processor = processor
        self.gpt = gpt_client
        self.poll_interval = poll_interval
        self.use_gpt_for_feedbacks = use_gpt_for_feedbacks
        self.full_check_cycles = full_check_cycles
        self.user_id = user_id
        self.db_factory = db_factory

        # Runtime deduplication to avoid repeated replies while process is alive.
        self._processed_chat_signatures: set[str] = set()
        self._question_examples: List[Dict] = []
        self._feedback_examples: List[Dict] = []

    async def run(self):
        cycle_count = 0
        while True:
            try:
                full_check = cycle_count % self.full_check_cycles == 0
                logger.info(
                    "Starting poll cycle %d, full_check=%s", cycle_count, full_check
                )
                await self.poll_once(full_check=full_check)
            except Exception as exc:
                logger.exception("Poll error: %s", exc)
            cycle_count += 1

            await asyncio.sleep(self.poll_interval)

    async def poll_once(self, full_check: bool = False):
        await asyncio.gather(
            # self._handle_chats(),
            self._handle_questions(full_check),
            self._handle_feedbacks(full_check),
        )

    async def fetch_all_products(self):
        """Placeholder for daily full products sync task."""
        logger.info(
            "[controller] fetch_all_products placeholder user_id=%s", self.user_id
        )
        if self.db_factory and self.user_id:
            db = None
            user_id = self.user_id
            token = ""
            try:
                db = self.db_factory()
                user = db.query(DbUser).filter(DbUser.id == self.user_id).first()
                if user:
                    user_id = user.id
                    token = str(user.wb_api_token or "")
            except Exception as exc:
                logger.exception("[controller] fetch_all_products error: %s", exc)
            finally:
                if "db" in locals() and db:
                    db.close()

            if token:
                await sync_user_products(self.db_factory, user_id, token, False)

    async def _handle_chats(self):
        chats = await self.processor.get_chat_messages(take=50)
        for chat in chats:
            chat_id = str(chat.get("chatID", ""))
            reply_sign = chat.get("replySign")
            if not chat_id or not reply_sign:
                continue

            messages = await self.processor.get_chat_history(chat_id=chat_id, take=30)
            if not messages:
                continue

            normalized = self._normalize_messages(messages)
            if not normalized:
                continue

            pending_client_message = self._get_pending_client_message(normalized)
            if pending_client_message is None:
                continue

            signature = f"{chat_id}:{pending_client_message['id']}:{pending_client_message['timestamp']}"
            if signature in self._processed_chat_signatures:
                continue

            gpt_payload = await self._decide_chat_reply(chat, normalized)
            if not gpt_payload.get("is_send"):
                self._processed_chat_signatures.add(signature)
                continue

            answer = str(gpt_payload.get("answer", "")).strip()
            if not answer:
                self._processed_chat_signatures.add(signature)
                continue

            response = await self.processor.send_message(
                reply_sign=reply_sign, text=answer
            )
            if self._is_success_response(response):
                self._processed_chat_signatures.add(signature)
                logger.info("[chat] sent answer for chat_id=%s", chat_id)
            else:
                logger.warning(
                    "[chat] failed to send answer for chat_id=%s: %s", chat_id, response
                )

    async def _handle_questions(self, full_check: bool = False):
        question_mode = "manual"
        question_prompt = ""

        count = await self.processor.get_count_unanswered_questions()
        if not full_check and count == 0:
            logger.debug("[questions] no unanswered questions, skipping")
            return

        logger.info("[questions] %d unanswered question(s) found", count)
        questions = await self.processor.get_questions(is_answered=False, take=50)
        if full_check:
            answered_questions = await self.processor.get_questions(
                is_answered=True, take=50
            )
            questions.extend(answered_questions)

        if not questions:
            logger.debug("[questions] no questions fetched, skipping")
            return

        if self.db_factory and self.user_id:
            db = None
            try:
                db = self.db_factory()
                user = db.query(DbUser).filter(DbUser.id == self.user_id).first()
                if user:
                    question_mode = (
                        str(user.question_answer_mode or "manual").strip().lower()
                    )
                    question_prompt = str(user.question_answer_prompt or "").strip()
            except Exception as exc:
                logger.exception(
                    "[questions] failed to load question settings: %s", exc
                )
            finally:
                if "db" in locals() and db:
                    db.close()

        for question in questions:
            question_id = str(question.get("id", ""))
            if not question_id:
                continue

            exists, saved = await self._upsert_question_in_db(question)
            if saved:
                proposed_answer = ""
                proposed_state = "none"

                if (
                    question_mode in {"confirm", "auto"}
                    and not (saved.answer_text or "").strip()
                ):
                    proposed_answer, proposed_state = (
                        await self._build_question_proposed_answer(
                            question,
                            question_prompt,
                        )
                    )
                    if proposed_answer:
                        db = None
                        try:
                            db = self.db_factory()
                            db_question = (
                                db.query(Question)
                                .filter(
                                    Question.id == saved.id,
                                    Question.user_id == self.user_id,
                                )
                                .first()
                            )
                            if db_question:
                                db_question.proposed_answer_text = proposed_answer
                                db_question.state = (
                                    proposed_state or db_question.state or "none"
                                )
                                db.commit()
                                db.refresh(db_question)
                                saved = db_question
                        except Exception as exc:
                            logger.exception(
                                "[questions] failed to persist proposed answer for question_id=%s: %s",
                                question_id,
                                exc,
                            )
                        finally:
                            if "db" in locals() and db:
                                db.close()

                if question_mode == "auto" and proposed_answer:
                    await self._reply_question_automatically(
                        saved, proposed_answer, proposed_state
                    )
                    saved.answer_text = proposed_answer
                    saved.proposed_answer_text = proposed_answer
                    saved.state = proposed_state or saved.state or "none"

                logger.info("[questions] synced question_id=%s to db", question_id)
                if not exists:
                    await notify_question_processed(
                        self.db_factory, self.user_id, saved
                    )
            else:
                logger.warning(
                    "[questions] failed to sync question_id=%s to db", question_id
                )

    async def _upsert_question_in_db(
        self, question: Dict
    ) -> tuple[Optional[bool], Optional[Question]]:
        """Persist/update a question record in the questions table without answering it."""
        if not self.db_factory or not self.user_id:
            return

        question_id = str(question.get("id") or "")
        if not question_id:
            return

        product_details = question.get("productDetails") or {}
        user_name = (question.get("userName") or "").strip()
        if user_name and user_name.startswith("Покупатель"):
            user_name = None

        question_data = QuestionCreate(
            wb_question_id=question_id,
            nm_id=str(product_details.get("nmId") or ""),
            product_name=str(product_details.get("productName") or "Unknown Product"),
            text=question.get("text"),
            date=question.get("createdDate"),
            editable=bool(
                question.get("answer", {}).get("editable", True)
                if question.get("answer")
                else True
            ),
            state=(question.get("state")),
            answer_text=(
                question.get("answer", {}).get("text")
                if question.get("answer")
                else None
            ),
            user_name=user_name,
        )

        db = None
        try:
            db = self.db_factory()
            exists, question_model = upsert_question(db, question_data, self.user_id)
            return exists, question_model
        except Exception as exc:
            logger.exception(
                "[questions] failed to upsert question %s: %s", question_id, exc
            )
        finally:
            if "db" in locals() and db:
                db.close()

        return None, None

    async def _build_question_proposed_answer(
        self, question: Dict, question_prompt: str
    ) -> tuple[str, str]:
        user_name = (question.get("userName") or "").strip()
        if user_name and user_name.startswith("Покупатель"):
            user_name = ""

        product_details = question.get("productDetails") or {}
        product_name = str(product_details.get("productName") or "Unknown Product")
        nm_id = str(product_details.get("nmId") or "").strip()
        question_text = str(question.get("text") or "")

        product_data = ""
        if product_name:
            product_data += f"Название продукта: {product_name}\n"
        if nm_id:
            product_data += f"ID товара: {nm_id}\n"

        question_summary_parts = []

        if user_name:
            question_summary_parts.append(f"Имя пользователя: {user_name}")
        if product_name:
            question_summary_parts.append(f"Название продукта: {product_name}")
        if question_text:
            question_summary_parts.append(f"Вопрос: {question_text}")

        question_summary = "\n".join(question_summary_parts)

        reply_text = await generate_question_reply_text(
            self.gpt,
            question_summary=question_summary,
            product_data=product_data,
            custom_prompt=question_prompt,
        )
        if not reply_text:
            return "", "none"

        state = await classify_question_reply_state(
            self.gpt,
            question_summary=question_summary,
            reply_text=reply_text,
        )

        return reply_text, state

    async def _reply_question_automatically(
        self, question: Question, text: str, state: str
    ) -> None:
        if not self.user_id or not self.db_factory:
            return

        db = None
        try:
            db = self.db_factory()
            user = db.query(DbUser).filter(DbUser.id == self.user_id).first()
            if not user or not user.wb_api_token:
                return

            async with ChatProcessor(user.wb_api_token) as processor:
                response = await processor.answer_question(
                    question_id=question.wb_question_id,
                    text=text,
                    state=state or "none",
                )

            if isinstance(response, dict) and (
                response.get("error")
                or response.get("errors")
                or response.get("status", 200) >= 400
            ):
                logger.warning(
                    "[questions] auto-answer failed question_id=%s response=%s",
                    question.wb_question_id,
                    response,
                )
                return

            db_question = (
                db.query(Question)
                .filter(Question.id == question.id, Question.user_id == self.user_id)
                .first()
            )
            if db_question:
                db_question.answer_text = text
                db_question.proposed_answer_text = text
                db_question.state = state or db_question.state or "none"
                db.commit()
                db.refresh(db_question)
        except Exception as exc:
            logger.exception(
                "[questions] auto-answer error question_id=%s: %s",
                question.wb_question_id,
                exc,
            )
        finally:
            if "db" in locals() and db:
                db.close()

    def _match_rule(self, rules: List[Any], feedback: Dict) -> Optional[Rule]:
        """Return the first rule that matches this feedback, or None."""
        nm_id = str(feedback.get("productDetails", {}).get("nmId") or "")
        rating = feedback.get("productValuation")
        text = (feedback.get("text") or "").lower()
        cons = (feedback.get("cons") or "").lower()
        pros = (feedback.get("pros") or "").lower()

        if cons:
            text += f"\nНедостатки: {cons}"

        if pros:
            text += f"\nДостоинства: {pros}"

        for rule in rules:
            # Check nm_id match
            if rule.target == "general":
                nm_match = True
            elif rule.nm_id:
                allowed = [x.strip() for x in rule.nm_id.split(",")]
                nm_match = nm_id in allowed
            else:
                nm_match = False

            if not nm_match:
                continue

            # Check rating condition
            if rule.condition_rating is not None and rating is not None:
                r = int(rating)
                cr = int(rule.condition_rating)
                op = rule.condition_rating_operator
                if op == "exact" and r != cr:
                    continue
                elif op == "less_than" and r > cr:
                    continue
                elif op == "more_than" and r < cr:
                    continue

            # Check keyword condition
            if rule.condition_keyword:
                if rule.condition_keyword.lower() not in text:
                    continue

            # Check new checkbox conditions
            if getattr(rule, "with_video", False):
                if not bool(feedback.get("video")):
                    continue

            if getattr(rule, "with_photo", False):
                photo_count = len(feedback.get("photoLinks") or [])
                if photo_count == 0:
                    continue

            if getattr(rule, "with_name", False):
                user_name = (feedback.get("userName") or "").strip()
                if not user_name or user_name.startswith("Покупатель"):
                    continue

            # Check is_edited_feedback condition
            if getattr(rule, "is_edited_feedback", False):
                is_edited = bool(feedback.get("parentFeedbackId"))
                if not is_edited:
                    continue

            return rule

        return None

    async def _upsert_review_in_db(
        self, feedback: Dict, answer_text: str, status: str
    ) -> ReviewCreate | None:
        """Persist/update a review record in the database."""
        if not self.db_factory or not self.user_id:
            return

        wb_review_id = str(feedback.get("id") or "")
        if not wb_review_id:
            return

        user_name = (feedback.get("userName") or "").strip()
        if user_name and user_name.startswith("Покупатель"):
            user_name = None

        review_data = ReviewCreate(
            wb_review_id=wb_review_id,
            nm_id=str(feedback.get("productDetails", {}).get("nmId") or ""),
            product_name=str(feedback.get("subjectName") or "")
            + " "
            + feedback.get("color", ""),
            rating=int(feedback.get("productValuation") or 0),
            text=str(feedback.get("text") or ""),
            date=str(feedback.get("createdDate") or ""),
            status=status,
            auto_answer_text=answer_text or None,
            editable=True,
            user_name=user_name,
            pros=(feedback.get("pros") or "").strip() or None,
            cons=(feedback.get("cons") or "").strip() or None,
            photos_count=len(feedback.get("photoLinks") or []),
            has_video=bool(feedback.get("video")),
        )

        try:
            db = self.db_factory()
            upsert_review(db, review_data, self.user_id)
        except Exception as exc:
            logger.exception(
                "[feedbacks] failed to upsert review %s: %s", wb_review_id, exc
            )
        finally:
            if "db" in locals() and db:
                db.close()

        return review_data

    async def _handle_feedbacks(self, full_check: bool = False):
        # Load rules from DB once per poll cycle
        rules: List[Any] = []
        existing_reviews_by_wb_id: Dict[str, Any] = {}
        if self.db_factory and self.user_id:
            try:
                db = self.db_factory()
                rules = get_rules(db, self.user_id)
                rules = [r for r in rules if getattr(r, "is_active", True) is not False]
                existing_reviews = get_reviews(db, self.user_id, status="all")
                existing_reviews_by_wb_id = {
                    str(r.wb_review_id): r for r in existing_reviews if r.wb_review_id
                }
                db.close()
            except Exception as exc:
                logger.exception("[feedbacks] failed to load rules: %s", exc)
        has_rules = bool(rules)
        if not has_rules:
            logger.warning("[feedbacks] no rules found; will only sync fetched answers")

        count = await self.processor.get_count_unanswered_feedbacks()
        feedbacks = await self.processor.get_feedbacks(
            is_answered=True, take=50 if full_check else 2
        )
        if count > 0:
            new_feedbacks = await self.processor.get_feedbacks(
                is_answered=False, take=50
            )
            feedbacks.extend(new_feedbacks)

        for feedback in feedbacks:
            feedback_id = str(feedback.get("id", ""))
            if not feedback_id:
                continue

            api_answer = feedback.get("answer") or {}
            api_answer_text = str(api_answer.get("text") or "").strip()
            api_editable = api_answer.get("editable")
            api_editable_bool = True if api_editable is None else bool(api_editable)
            existing = existing_reviews_by_wb_id.get(feedback_id)

            if api_answer_text:
                user_name = (feedback.get("userName") or "").strip()
                if user_name and user_name.startswith("Покупатель"):
                    user_name = None

                should_sync = (
                    existing is None
                    or (existing.auto_answer_text or "").strip() != api_answer_text
                    or bool(existing.editable) != api_editable_bool
                )

                if not should_sync:
                    continue
                if existing and (existing.auto_answer_text or "").strip().replace(
                    "\n", ""
                ).replace("\r", "").replace(" ", "").replace(
                    "\\", ""
                ) != api_answer_text.replace(
                    "\n", ""
                ).replace(
                    "\r", ""
                ).replace(
                    " ", ""
                ).replace(
                    "\\", ""
                ):
                    status = "fetched"
                elif existing:
                    status = existing.status
                else:
                    status = "fetched"

                if existing:
                    logger.info(f"""
                        Syncing existing review with new answer text for feedback_id={feedback_id}
                        Old answer: {existing.auto_answer_text}
                        New answer: {api_answer_text}
                        Old editable: {existing.editable}
                        New editable: {api_editable_bool}
                        """)

                db = None
                try:
                    db = self.db_factory()
                    review_data = ReviewCreate(
                        wb_review_id=feedback_id,
                        nm_id=str(feedback.get("productDetails", {}).get("nmId") or ""),
                        product_name=str(
                            feedback.get("productDetails", {}).get("productName") or ""
                        ),
                        rating=int(feedback.get("productValuation") or 0),
                        text=str(feedback.get("text") or ""),
                        date=str(feedback.get("createdDate") or ""),
                        status=status,
                        auto_answer_text=api_answer_text,
                        editable=api_editable_bool,
                        user_name=user_name,
                        pros=(feedback.get("pros") or "").strip() or None,
                        cons=(feedback.get("cons") or "").strip() or None,
                        photos_count=len(feedback.get("photoLinks") or []),
                        has_video=bool(feedback.get("video")),
                    )
                    saved = upsert_review(db, review_data, self.user_id)
                    existing_reviews_by_wb_id[feedback_id] = saved
                except Exception as exc:
                    logger.exception(
                        "[feedbacks] failed to sync fetched answer feedback_id=%s: %s",
                        feedback_id,
                        exc,
                    )
                finally:
                    if "db" in locals() and db:
                        db.close()
                continue

            if not has_rules:
                continue

            matched_rule = self._match_rule(rules, feedback)

            if matched_rule is not None and matched_rule.action_type == "template":
                text = matched_rule.action_text
                user_name = (feedback.get("userName") or "").strip()
                if user_name and not user_name.startswith("Покупатель"):
                    text = text.replace("[name]", user_name)
                else:
                    text = text.replace(", [name]", "").replace("[name]", "")
                answer_status = "auto"
                text = text.strip(", ")
                text = text[0].upper() + text[1:] if text else text

            elif matched_rule is not None:
                text = await self._build_feedback_answer(
                    feedback, matched_rule.action_text
                )
                answer_status = "auto"
            else:
                text = None

            if not text or not text.strip():
                logger.warning(
                    "[feedbacks] empty answer for feedback_id=%s, skipping",
                    feedback_id,
                )
                review_create = await self._upsert_review_in_db(feedback, "", "none")

            else:
                response = await self.processor.answer_feedback(
                    feedback_id=feedback_id,
                    text=text,
                    only_post=True,
                )
                if response is True or response == {}:
                    logger.info(
                        "[feedbacks] answered feedback_id=%s (rule=%s)",
                        feedback_id,
                        matched_rule.name if matched_rule else "none",
                    )
                    review_create = await self._upsert_review_in_db(
                        feedback, text, answer_status
                    )

                else:
                    logger.warning(
                        "[feedbacks] failed feedback_id=%s: %s", feedback_id, response
                    )
                    review_create = await self._upsert_review_in_db(
                        feedback, text, "none"
                    )
                    review_create.auto_answer_text = None

            if (
                matched_rule
                and matched_rule.send_notification
                and review_create
                and existing is None
            ):
                try:
                    db = self.db_factory()
                    await notify_review_processed(
                        db,
                        self.user_id,
                        review_create,
                    )
                except Exception as exc:
                    logger.exception(
                        "[feedbacks] failed to send notification for feedback_id=%s: %s",
                        feedback_id,
                        exc,
                    )
                finally:
                    if "db" in locals() and db:
                        db.close()

    def _normalize_messages(self, messages: List[Dict]) -> List[Dict]:
        normalized: List[Dict] = []
        for idx, msg in enumerate(messages):
            text = str(msg.get("text") or msg.get("message") or "").strip()
            if not text:
                continue

            sender = self._extract_sender_role(msg)
            timestamp = (
                msg.get("addTimestamp")
                or msg.get("createdDate")
                or msg.get("createdAt")
                or msg.get("timestamp")
                or idx
            )
            message_id = msg.get("id") or msg.get("messageID") or idx

            normalized.append(
                {
                    "id": str(message_id),
                    "timestamp": timestamp,
                    "role": sender,
                    "text": text,
                }
            )

        # Normalize order to oldest -> newest.
        normalized.sort(key=lambda x: str(x["timestamp"]))
        return normalized

    def _extract_sender_role(self, msg: Dict) -> str:
        parts = [
            str(msg.get("senderType", "")),
            str(msg.get("sender", "")),
            str(msg.get("authorType", "")),
            str(msg.get("author", "")),
            str(msg.get("from", "")),
        ]
        raw = " ".join(parts).lower()

        if any(word in raw for word in ("client", "buyer", "user", "customer")):
            return "client"
        if any(word in raw for word in ("seller", "supplier", "manager", "operator")):
            return "seller"
        if msg.get("isIncoming") is True:
            return "client"
        if msg.get("isOutgoing") is True:
            return "seller"
        return "unknown"

    def _get_pending_client_message(self, messages: List[Dict]) -> Optional[Dict]:
        last_client_idx = None
        for i, message in enumerate(messages):
            if message["role"] == "client":
                last_client_idx = i

        if last_client_idx is None:
            return None

        for message in messages[last_client_idx + 1 :]:
            if message["role"] == "seller":
                return None

        return messages[last_client_idx]

    async def _decide_chat_reply(self, chat: Dict, messages: List[Dict]) -> Dict:
        history_lines = []
        for message in messages:
            history_lines.append(f"[{message['role']}] {message['text']}")

        raw = await self.gpt.chat_completion(
            messages=[
                {"role": "system", "content": CHAT_REPLY_DECISION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Chat meta: {json.dumps(chat, ensure_ascii=False)}\n"
                        f"Last {len(messages)} messages:\n" + "\n".join(history_lines)
                    ),
                },
            ],
            model="gpt-5-nano",
            temperature=0.2,
            max_tokens=1300,
        )
        return self._safe_parse_json_response(raw)

    async def _build_feedback_answer(self, feedback: Dict, prompt: str) -> str:
        if not self.use_gpt_for_feedbacks:
            valuation = feedback.get("productValuation")
            user_name = (feedback.get("userName") or "").strip()
            if user_name and user_name.startswith("Покупатель"):
                user_name = None

            is_positive = valuation is None or int(valuation) >= 4

            if is_positive:
                if user_name:
                    return f"Здравствуйте, {user_name}! Благодарим за отзыв и высокую оценку. Будем рады видеть Вас снова!"
                return "Здравствуйте! Благодарим за отзыв и высокую оценку. Будем рады видеть Вас снова!"
            else:
                if user_name:
                    return f"Здравствуйте, {user_name}! Сожалеем, что товар не оправдал Ваших ожиданий. Мы обязательно учтем Ваши замечания."
                return "Здравствуйте! Сожалеем, что товар не оправдал Ваших ожиданий. Мы обязательно учтем Ваши замечания."

        text = (feedback.get("text") or "").strip()
        pros = (feedback.get("pros") or "").strip()
        cons = (feedback.get("cons") or "").strip()
        valuation = feedback.get("productValuation")
        user_name = (feedback.get("userName") or "").strip()
        if user_name and user_name.startswith("Покупатель"):
            user_name = None
        subject_name = (feedback.get("subjectName") or "").strip()
        has_video = bool(feedback.get("video"))
        photo_count = len(feedback.get("photoLinks") or [])

        parts: List[str] = []
        if user_name:
            parts.append(f"Клиент: {user_name}")
        parts.append(f"Продукт: {subject_name}")
        parts.append(f"Рейтинг: {valuation}/5")
        if text:
            parts.append(f"Текст отзыва: {text}")
        if pros:
            parts.append(f"Достоинства: {pros}")
        if cons:
            parts.append(f"Недостатки: {cons}")
        if has_video:
            parts.append("Клиент прикрепил видео")
        if photo_count:
            parts.append(f"Клиент прикрепил {photo_count} фото")

        feedback_summary = "\n".join(parts)
        prompt = (FEEDBACK_REPLY_SUFFIX + (prompt or "").strip()).strip()

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
                "[feedbacks] failed to generate answer text for feedback_id=%s: %s",
                feedback.get("id"),
                exc,
            )
            return ""

    def _safe_parse_json_response(self, raw: str) -> Dict:
        text = str(raw).strip()
        try:
            data = json.loads(text)
            if isinstance(data, dict):
                return {
                    "is_send": bool(data.get("is_send", False)),
                    "answer": str(data.get("answer", "")),
                }
        except json.JSONDecodeError:
            pass

        # Fallback for cases where model wraps JSON with extra text.
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                data = json.loads(text[start : end + 1])
                if isinstance(data, dict):
                    return {
                        "is_send": bool(data.get("is_send", False)),
                        "answer": str(data.get("answer", "")),
                    }
            except json.JSONDecodeError:
                pass

        return {"is_send": False, "answer": ""}

    def _is_success_response(self, response: Dict) -> bool:
        if not isinstance(response, dict):
            return False
        if response.get("error"):
            return False
        if response.get("errors"):
            return False
        return True


def build_controller(
    processor: ChatProcessor,
    gpt_client: AsyncOpenAIClient,
    poll_interval: int = 45,
    use_gpt_for_feedbacks: bool = True,
    user_id: Optional[int] = None,
    db_factory: Optional[Callable] = None,
) -> MainController:
    return MainController(
        processor=processor,
        gpt_client=gpt_client,
        poll_interval=poll_interval,
        use_gpt_for_feedbacks=use_gpt_for_feedbacks,
        user_id=user_id,
        db_factory=db_factory,
    )
