from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

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


def _to_question_out(question: Dict) -> QuestionOut:
    product_details = question.get("productDetails") or {}
    answer_text = _extract_answer_text(question)
    is_answered = bool(question.get("isAnswered")) or bool(answer_text)

    return QuestionOut(
        id=str(question.get("id") or ""),
        nm_id=(
            str(product_details.get("nmId"))
            if product_details.get("nmId") is not None
            else None
        ),
        product_name=(product_details.get("productName") or None),
        text=(
            question.get("text")
            or question.get("questionText")
            or question.get("question")
            or ""
        ),
        answer_text=answer_text,
        date=(question.get("createdDate") or question.get("createdAt") or None),
        is_answered=is_answered,
        user_name=(question.get("userName") or None),
    )


@router.get("/", response_model=List[QuestionOut])
async def read_questions(
    include_answered: bool = True,
    take: int = 50,
    current_user: User = Depends(check_active_subscription),
):
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

    normalized = [_to_question_out(item) for item in deduped.values()]
    normalized.sort(key=lambda item: item.date or "", reverse=True)
    return normalized