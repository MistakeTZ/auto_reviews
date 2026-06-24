import logging
from typing import Callable, List, Any, Dict, Optional
from database.models import Rule
from database.schemas import ReviewCreate
from database.crud import get_rules, get_reviews, upsert_review
from processor.chat_processor import ChatProcessor
from processor.controllers.feedback_generator import FeedbackGenerator
from services.notifications import notify_review_processed

logger = logging.getLogger("review_controller")


class ReviewController:
    def __init__(
        self,
        user_id: int,
        processor: ChatProcessor,
        generator: FeedbackGenerator,
        db_factory: Callable,
    ):
        self.user_id = user_id
        self.processor = processor
        self.generator = generator
        self.db_factory = db_factory

    async def poll(self, full_check: bool = False):
        rules: List[Any] = []
        existing_reviews: Dict[str, Any] = {}

        with self.db_factory() as db:
            rules = [
                r
                for r in get_rules(db, self.user_id)
                if getattr(r, "is_active", True) is not False
            ]
            existing_reviews = {
                str(r.wb_review_id): r
                for r in get_reviews(db, self.user_id, status="all")
                if r.wb_review_id
            }

        count = await self.processor.get_count_unanswered_feedbacks()
        feedbacks = await self.processor.get_feedbacks(
            is_answered=True, take=50 if full_check else 2
        )
        if count > 0:
            feedbacks.extend(
                await self.processor.get_feedbacks(is_answered=False, take=50)
            )

        for fb in feedbacks:
            fb_id = str(fb.get("id", ""))
            if not fb_id:
                continue

            api_answer_text = str((fb.get("answer") or {}).get("text") or "").strip()
            existing = existing_reviews.get(fb_id)

            if api_answer_text:
                # Синхронизация уже отвеченных отзывов
                await self._sync_existing_answer(fb, fb_id, api_answer_text, existing)
                continue

            if fb_id in existing_reviews and existing_reviews[fb_id].status in {
                "auto",
                "manually",
            }:
                continue

            matched_rule = self._match_rule(rules, fb) if rules else None

            if matched_rule and matched_rule.action_type == "template":
                text = matched_rule.action_text
                user_name = (fb.get("userName") or "").strip()
                if user_name and not user_name.startswith("Покупатель"):
                    text = text.replace("[name]", user_name)
                else:
                    text = text.replace(", [name]", "").replace("[name]", "")
                text = text.strip(", ").capitalize()
                status = "auto"
            elif matched_rule:
                text = await self.generator.generate_answer(
                    fb, matched_rule.action_text
                )
                status = "auto"
            else:
                text = None

            review_create = None
            if not text or not text.strip():
                review_create = await self._save_review_state(fb, "", "none")
            else:
                response = await self.processor.answer_feedback(
                    feedback_id=fb_id, text=text, only_post=True
                )
                if response is True or response == {}:
                    review_create = await self._save_review_state(fb, text, status)
                else:
                    review_create = await self._save_review_state(fb, text, "none")

            if (
                matched_rule
                and matched_rule.send_notification
                and review_create
                and existing is None
            ):
                with self.db_factory() as db:
                    await notify_review_processed(db, self.user_id, review_create)

    def _match_rule(self, rules: List[Any], fb: dict) -> Optional[Rule]:
        nm_id = str(fb.get("productDetails", {}).get("nmId") or "")
        rating = fb.get("productValuation")
        full_text = f"{(fb.get('text') or '')} {(fb.get('cons') or '')} {(fb.get('pros') or '')}".lower()

        for rule in rules:
            if (
                rule.target != "general"
                and rule.nm_id
                and nm_id not in [x.strip() for x in rule.nm_id.split(",")]
            ):
                continue
            if rule.condition_rating is not None and rating is not None:
                r, cr, op = (
                    int(rating),
                    int(rule.condition_rating),
                    rule.condition_rating_operator,
                )
                if op == "exact" and r != cr:
                    continue
                if op == "less_than" and r > cr:
                    continue
                if op == "more_than" and r < cr:
                    continue
            if (
                rule.condition_keyword
                and rule.condition_keyword.lower() not in full_text
            ):
                continue
            if getattr(rule, "with_video", False) and not bool(fb.get("video")):
                continue
            if (
                getattr(rule, "with_photo", False)
                and len(fb.get("photoLinks") or []) == 0
            ):
                continue
            return rule
        return None

    async def _sync_existing_answer(
        self, fb: dict, fb_id: str, api_text: str, existing: Any
    ):
        # Удаление лишних пробелов для проверки идентичности текстов ответов
        clean_api = "".join(api_text.split())
        clean_ext = (
            "".join((existing.auto_answer_text or "").split()) if existing else ""
        )
        if existing and clean_api == clean_ext:
            return

        status = "fetched" if existing else "fetched"
        review_data = ReviewCreate(
            wb_review_id=fb_id,
            nm_id=str(fb.get("productDetails", {}).get("nmId") or ""),
            product_name=str(fb.get("productDetails", {}).get("productName") or ""),
            rating=int(fb.get("productValuation") or 0),
            text=str(fb.get("text") or ""),
            date=str(fb.get("createdDate") or ""),
            status=status,
            auto_answer_text=api_text,
            editable=(
                True
                if fb.get("answer", {}).get("editable") is None
                else bool(fb.get("answer", {}).get("editable"))
            ),
            user_name=(
                None
                if str(fb.get("userName") or "").startswith("Покупатель")
                else fb.get("userName")
            ),
            photos_count=len(fb.get("photoLinks") or []),
            has_video=bool(fb.get("video")),
        )
        with self.db_factory() as db:
            upsert_review(db, review_data, self.user_id)

    async def _save_review_state(
        self, fb: dict, text: str, status: str
    ) -> ReviewCreate:
        review_data = ReviewCreate(
            wb_review_id=str(fb.get("id")),
            nm_id=str(fb.get("productDetails", {}).get("nmId") or ""),
            product_name=f"{fb.get('subjectName', '')} {fb.get('color', '')}".strip(),
            rating=int(fb.get("productValuation") or 0),
            text=str(fb.get("text") or ""),
            date=str(fb.get("createdDate") or ""),
            status=status,
            auto_answer_text=text or None,
            editable=True,
            user_name=(
                None
                if str(fb.get("userName") or "").startswith("Покупатель")
                else fb.get("userName")
            ),
            pros=(fb.get("pros") or "").strip() or None,
            cons=(fb.get("cons") or "").strip() or None,
            photos_count=len(fb.get("photoLinks") or []),
            has_video=bool(fb.get("video")),
        )
        with self.db_factory() as db:
            upsert_review(db, review_data, self.user_id)
        return review_data
