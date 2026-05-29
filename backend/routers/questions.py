from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import database
import crud
import schemas
from models import Review, User
from processor.chat_processor import ChatProcessor
from routers.auth import check_active_subscription

router = APIRouter()


class QuestionOut(BaseModel):
    id: str
    nm_id: Optional[str] = None
    product_name: Optional[str] = None
    text: str
    answer_text: Optional[str] = None
    date: Optional[str] = None
    is_answered: bool = False
    user_name: Optional[str] = None


def _extract_answer_text(question: Dict) -> Optional[str]:
    answer = question.get("answer")
    if isinstance(answer, dict):
        return (answer.get("text") or "").strip() or None
    if isinstance(answer, str):
        return answer.strip() or None
    return None


def _to_question_out_from_review(review: Review) -> QuestionOut:
    wb_id = str(review.wb_review_id or "")
    question_id = wb_id[2:] if wb_id.startswith("q_") else wb_id
    answer_text = (review.auto_answer_text or "").strip() or None

    return QuestionOut(
        id=question_id,
        nm_id=review.nm_id,
        product_name=review.product_name,
        text=review.text,
        answer_text=answer_text,
        date=review.date,
        is_answered=bool(answer_text),
        user_name=review.user_name,
    )


def _to_question_review_create(question: Dict) -> schemas.ReviewCreate:
    product_details = question.get("productDetails") or {}
    answer_text = _extract_answer_text(question)
    status = "manually" if answer_text else "none"

    user_name = (question.get("userName") or "").strip()
    if user_name and user_name.startswith("Покупатель"):
        user_name = None

    question_id = str(question.get("id") or "")

    return schemas.ReviewCreate(
        wb_review_id=f"q_{question_id}",
        nm_id=str(product_details.get("nmId") or ""),
        product_name=str(product_details.get("productName") or "Unknown Product"),
        rating=0,
        text=str(
            question.get("text")
            or question.get("questionText")
            or question.get("question")
            or ""
        ),
        date=str(question.get("createdDate") or question.get("createdAt") or ""),
        status=status,
        auto_answer_text=answer_text,
        editable=False,
        user_name=user_name,
        pros=None,
        cons=None,
        photos_count=0,
        has_video=False,
        is_edited_feedback=False,
    )


async def _fetch_questions_from_wb(
    current_user: User, include_answered: bool, take: int
) -> List[Dict]:
    if not current_user.wb_api_token:
        raise HTTPException(
            status_code=400, detail="Wildberries API token not set for user"
        )

    async with ChatProcessor(current_user.wb_api_token) as processor:
        unanswered = await processor.get_questions(is_answered=False, take=take, skip=0)
        questions = unanswered
        if include_answered:
            answered = await processor.get_questions(is_answered=True, take=take, skip=0)
            questions = unanswered + answered

    deduped: Dict[str, Dict] = {}
    for question in questions:
        qid = str(question.get("id") or "")
        if qid and qid not in deduped:
            deduped[qid] = question
    return list(deduped.values())


@router.get("/", response_model=List[QuestionOut])
def read_questions(
    include_answered: bool = True,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
):
    query = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .filter(Review.wb_review_id.like("q_%"))
    )

    if not include_answered:
        query = query.filter(
            (Review.auto_answer_text.is_(None)) | (Review.auto_answer_text == "")
        )

    rows = query.order_by(Review.id.desc()).all()
    normalized = [_to_question_out_from_review(row) for row in rows]
    normalized.sort(key=lambda item: item.date or "", reverse=True)
    return normalized


@router.post("/sync", response_model=List[QuestionOut])
async def sync_questions(
    include_answered: bool = True,
    take: int = 50,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
):
    questions = await _fetch_questions_from_wb(current_user, include_answered, take)

    for question in questions:
        question_id = str(question.get("id") or "")
        if not question_id:
            continue
        review_data = _to_question_review_create(question)
        crud.upsert_review(db, review_data, current_user.id)

    rows = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .filter(Review.wb_review_id.like("q_%"))
        .order_by(Review.id.desc())
        .all()
    )
    normalized = [_to_question_out_from_review(row) for row in rows]
    normalized.sort(key=lambda item: item.date or "", reverse=True)
    return normalized