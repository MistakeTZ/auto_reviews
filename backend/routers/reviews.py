from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import crud
import schemas
import database
from routers.auth import get_current_user
from models import User, Review
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


from processor.chat_processor import ChatProcessor


@router.post("/sync", response_model=List[schemas.Review])
async def sync_reviews(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.wb_api_token:
        raise HTTPException(
            status_code=400, detail="Wildberries API token not set for user"
        )

    async with ChatProcessor(current_user.wb_api_token) as processor:
        # Fetch unanswered feedbacks
        feedbacks = await processor.get_feedbacks(is_answered=False, take=50)

    # Get user rules
    rules = crud.get_rules(db, user_id=current_user.id)

    synced_reviews = []
    for fb in feedbacks:
        fb_id = fb.get("id")
        text = fb.get("text", "")
        rating = fb.get("productValuation", 5)  # ProductValuation is usually rating
        product_details = fb.get("productDetails", {})
        nm_id = product_details.get("nmId", "")
        product_name = product_details.get("productName", "Unknown Product")
        created_date = fb.get("createdDate", "")

        # Check rules
        auto_answer = None
        status = "pending"
        matched_rule = None
        for rule in rules:
            if rule.target == "specific_nm" and str(rule.nm_id) != str(nm_id):
                continue

            match = False
            if (
                rule.condition_rating_operator == "exact"
                and rule.condition_rating == rating
            ):
                match = True
            elif (
                rule.condition_rating_operator == "less_than"
                and rating < rule.condition_rating
            ):
                match = True
            elif (
                rule.condition_rating_operator == "more_than"
                and rating > rule.condition_rating
            ):
                match = True

            if match and rule.condition_keyword:
                if rule.condition_keyword.lower() not in text.lower():
                    match = False

            if match:
                matched_rule = rule
                break

        if matched_rule:
            status = "manual-review"  # Default to manual review for safety
            if getattr(matched_rule, "action_type", "template") == "template":
                auto_answer = matched_rule.action_text
            elif getattr(matched_rule, "action_type", "template") == "ai":
                # AI generation placeholder
                auto_answer = f"[AI Generated based on: {matched_rule.action_text}] Thank you for your feedback!"

        review_data = schemas.ReviewCreate(
            wb_review_id=str(fb_id),
            nm_id=str(nm_id),
            product_name=str(product_name),
            rating=rating,
            text=text,
            date=created_date,
            status=status,
            auto_answer_text=auto_answer,
        )
        saved_review = crud.upsert_review(db, review_data, current_user.id)
        synced_reviews.append(saved_review)

    return synced_reviews


@router.post("/{review_id}/reply")
async def reply_to_review(
    review_id: int,
    request: ReplyRequest,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.wb_api_token:
        raise HTTPException(
            status_code=400, detail="Wildberries API token not set for user"
        )

    db_review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.user_id == current_user.id)
        .first()
    )

    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")

    async with ChatProcessor(current_user.wb_api_token) as processor:
        res = await processor.answer_feedback(db_review.wb_review_id, request.text)
        if isinstance(res, dict) and res.get("error"):
            raise HTTPException(
                status_code=400,
                detail=res.get("errorText", "Failed to reply to feedback on WB"),
            )

    # Update in DB after success
    review = crud.update_review_status(
        db,
        review_id=review_id,
        user_id=current_user.id,
        status="auto-answered",
        auto_answer_text=request.text,
    )
    return review
