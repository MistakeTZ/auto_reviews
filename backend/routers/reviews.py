from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from .auth import get_current_user
from ..models import User
from pydantic import BaseModel

router = APIRouter()


class ReplyRequest(BaseModel):
    text: str


@router.get("/", response_model=List[schemas.Review])
def read_reviews(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    reviews = crud.get_reviews(db, user_id=current_user.id)
    return reviews


@router.post("/{review_id}/reply")
def reply_to_review(
    review_id: int,
    request: ReplyRequest,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    review = crud.update_review_status(
        db,
        review_id=review_id,
        user_id=current_user.id,
        status="manual-review",
        auto_answer_text=request.text,
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    # In a real app, we would call WB API here to post the reply
    return review
