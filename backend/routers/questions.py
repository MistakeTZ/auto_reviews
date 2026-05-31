from typing import Dict, List, Optional
import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import database
import crud
import schemas
from models import User, Question, NmIDs
from processor.chat_processor import ChatProcessor
from processor.gpt import AsyncOpenAIClient
from prompts import QUESTION_REPLY_SYSTEM_PROMPT
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
    state: Optional[str] = None
    editable: Optional[bool] = None


class GenerateQuestionReplyResponse(BaseModel):
    text: str


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
        state=question.state,
        editable=question.editable,
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
        text=str(question.get("text") or ""),
        date=str(question.get("createdDate") or question.get("createdAt") or ""),
        state=(
            question.get("state") or (question.get("answer") or {}).get("state") or None
        ),
        editable=(
            question.get("editable") if question.get("editable") is not None else True
        ),
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
            answered = await processor.get_questions(
                is_answered=True, take=take, skip=0
            )
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
    normalized = [
        _to_question_out_from_model(schemas.Question.model_validate(row))
        for row in rows
    ]
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
    normalized = [
        _to_question_out_from_model(schemas.Question.model_validate(row))
        for row in rows
    ]
    normalized.sort(key=lambda item: item.date or "", reverse=True)
    return normalized


class QuestionReplyRequest(BaseModel):
    text: str
    state: str = "none"


@router.post("/{question_id}/reply", response_model=QuestionOut)
@router.patch("/{question_id}/reply", response_model=QuestionOut)
async def reply_to_question(
    question_id: int,
    request: QuestionReplyRequest,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
):
    if not current_user.wb_api_token:
        raise HTTPException(
            status_code=400, detail="Wildberries API token not set for user"
        )

    db_question = (
        db.query(Question)
        .filter(Question.id == question_id, Question.user_id == current_user.id)
        .first()
    )

    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    reply_text = request.text
    state = request.state

    async with ChatProcessor(current_user.wb_api_token) as processor:
        res = await processor.answer_question(
            question_id=db_question.wb_question_id,
            text=reply_text,
            state=state,
        )
        if isinstance(res, dict) and (
            res.get("error") or res.get("errors") or res.get("status", 200) >= 400
        ):
            error_msg = (
                res.get("errorText")
                or res.get("detail")
                or res.get("error")
                or "Failed to reply to question on WB"
            )
            raise HTTPException(
                status_code=400,
                detail=str(error_msg),
            )

    # Update DB values on success
    db_question.answer_text = reply_text
    db_question.state = state
    db.commit()
    db.refresh(db_question)

    return _to_question_out_from_model(schemas.Question.model_validate(db_question))


@router.post("/{question_id}/generate", response_model=GenerateQuestionReplyResponse)
async def generate_reply_for_question(
    question_id: str,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
):
    db_question = (
        db.query(Question)
        .filter(
            Question.wb_question_id == str(question_id),
            Question.user_id == current_user.id,
        )
        .first()
    )

    if not db_question and str(question_id).isdigit():
        db_question = (
            db.query(Question)
            .filter(
                Question.id == int(question_id),
                Question.user_id == current_user.id,
            )
            .first()
        )

    if not db_question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")

    product_meta = None
    nm_id = str(db_question.nm_id or "").strip()
    if nm_id:
        product_meta = (
            db.query(NmIDs)
            .filter(
                NmIDs.nm_id == nm_id,
                NmIDs.user_d_id == current_user.id,
            )
            .first()
        )

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="Сервис GPT не настроен")

    user_name = (db_question.user_name or "").strip()
    if user_name and user_name.startswith("Покупатель"):
        user_name = ""

    parts = []
    if user_name:
        parts.append(f"Имя пользователя: {user_name}")
    if product_meta.title:
        parts.append(f"Название продукта: {product_meta.title}")
    elif db_question.product_name:
        parts.append(f"Название продукта: {db_question.product_name}")
    if db_question.text:
        parts.append(f"Вопрос: {db_question.text}")
    question_summary = "\n".join(parts)

    product_data = ""
    if product_meta.description:
        product_data += f"Описание продукта: {product_meta.description[:1000]}\n"
    if product_meta.characteristics:
        try:
            characteristics = "\n".join(
                f"{item['name']}: {[', '.join(item['value']) if isinstance(item['value'], list) else item['value']]}"
                for item in product_meta.characteristics
                if isinstance(item, dict) and "name" in item and "value" in item
            )
            product_data += f"Характеристики продукта: {characteristics}"
        except Exception:
            pass

    client = AsyncOpenAIClient(api_key=api_key)
    generated = await client.chat_completion(
        messages=[
            {
                "role": "system",
                "content": QUESTION_REPLY_SYSTEM_PROMPT,
            },
            {"role": "user", "content": product_data[:3000]},
            {"role": "user", "content": question_summary},
        ],
        model="gpt-5-nano",
        temperature=0.4,
        max_tokens=4000,
    )

    reply_text = str(generated or "").strip()
    if not reply_text:
        raise HTTPException(status_code=502, detail="Не удалось сгенерировать ответ")

    return {"text": reply_text}
