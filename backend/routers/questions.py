from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import database
import crud
import schemas
from models import User
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


def _to_question_out_from_model(question: schemas.Question) -> QuestionOut:
    answer_text = (question.answer_text or "").strip() or None

    return QuestionOut(
        id=question.wb_question_id,
        nm_id=question.nm_id,
        product_name=question.product_name,
        text=question.text,
        answer_text=answer_text,
        date=question.date,
        is_answered=bool(answer_text),
        user_name=question.user_name,
    )


def _to_question_create(question: Dict) -> schemas.QuestionCreate:
    product_details = question.get("productDetails") or {}
    answer_text = _extract_answer_text(question)

    user_name = (question.get("userName") or "").strip()
    if user_name and user_name.startswith("Покупатель"):
        user_name = None

    question_id = str(question.get("id") or "")

    return schemas.QuestionCreate(
        wb_question_id=question_id,
        nm_id=str(product_details.get("nmId") or ""),
        product_name=str(product_details.get("productName") or "Unknown Product"),
        text=str(
            question.get("text")
            or question.get("questionText")
            or question.get("question")
            or ""
        ),
        date=str(question.get("createdDate") or question.get("createdAt") or ""),
        answer_text=answer_text,
        user_name=user_name,
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
    rows = crud.get_questions(
        db,
        user_id=current_user.id,
        include_answered=include_answered,
    )
    normalized = [_to_question_out_from_model(schemas.Question.model_validate(row)) for row in rows]
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
        question_data = _to_question_create(question)
        crud.upsert_question(db, question_data, current_user.id)

    rows = crud.get_questions(
        db,
        user_id=current_user.id,
        include_answered=include_answered,
    )
    normalized = [_to_question_out_from_model(schemas.Question.model_validate(row)) for row in rows]
    normalized.sort(key=lambda item: item.date or "", reverse=True)
    return normalized