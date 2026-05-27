from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os

import crud
import schemas
import database
from routers.auth import get_current_user, check_active_subscription
from models import User, Review
from pydantic import BaseModel
from processor.gpt import AsyncOpenAIClient

router = APIRouter()


class ReplyRequest(BaseModel):
    text: str


class GenerateReplyResponse(BaseModel):
    text: str


@router.get("/")
def read_reviews(
    page: Optional[int] = None,
    page_size: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
):
    if page is not None and page_size is not None:
        return crud.get_reviews_paginated(
            db,
            user_id=current_user.id,
            page=page,
            page_size=page_size,
            status=status,
        )
    return crud.get_reviews(db, user_id=current_user.id, status=status)


from processor.chat_processor import ChatProcessor


@router.post("/sync", response_model=List[schemas.Review])
async def sync_reviews(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
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
        user_name = (fb.get("userName") or "").strip()
        if user_name and user_name.startswith("Покупатель"):
            user_name = None

        # Check rules
        auto_answer = None
        status = "manually"
        matched_rule = None
        for rule in rules:
            if rule.target == "specific_nm":
                if not rule.nm_id:
                    continue
                allowed = [x.strip() for x in rule.nm_id.split(",")]
                if str(nm_id) not in allowed:
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
                # Check new checkbox conditions
                if getattr(rule, "with_video", False) and not bool(fb.get("video")):
                    match = False
                if (
                    getattr(rule, "with_photo", False)
                    and len(fb.get("photoLinks") or []) == 0
                ):
                    match = False
                if getattr(rule, "with_name", False) and not user_name:
                    match = False
                if getattr(rule, "is_edited_feedback", False) and not bool(
                    fb.get("parentFeedbackId")
                ):
                    match = False

            if match:
                matched_rule = rule
                break

        if matched_rule:
            status = "manually"  # Default to manual review for safety
            if getattr(matched_rule, "action_type", "template") == "template":
                auto_answer = matched_rule.action_text
                if user_name:
                    auto_answer = auto_answer.replace("[name]", user_name)
                else:
                    auto_answer = auto_answer.replace(", [name]", "").replace(
                        "[name]", ""
                    )
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
            editable=True,
            user_name=user_name,
            pros=(fb.get("pros") or "").strip() or None,
            cons=(fb.get("cons") or "").strip() or None,
            photos_count=len(fb.get("photoLinks") or []),
            has_video=bool(fb.get("video")),
            is_edited_feedback=bool(fb.get("parentFeedbackId")),
        )
        saved_review = crud.upsert_review(db, review_data, current_user.id)
        synced_reviews.append(saved_review)

    return synced_reviews


@router.post("/{review_id}/reply")
async def reply_to_review(
    review_id: int,
    request: ReplyRequest,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
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
        res = await processor.answer_feedback(
            db_review.wb_review_id,
            request.text,
        )
        if res is not True:
            raise HTTPException(
                status_code=400,
                detail=res.get("detail", "Failed to reply to feedback on WB"),
            )

    # Update in DB after success
    review = crud.update_review_status(
        db,
        review_id=review_id,
        user_id=current_user.id,
        status="auto",
        auto_answer_text=request.text,
        editable=True,
    )
    return review


@router.post("/{review_id}/generate", response_model=GenerateReplyResponse)
async def generate_reply_for_review(
    review_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
):
    db_review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.user_id == current_user.id)
        .first()
    )

    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="GPT service is not configured")

    user_name = (db_review.user_name or "").strip()
    if user_name and user_name.startswith("Покупатель"):
        user_name = ""

    parts = []
    if user_name:
        parts.append(f"Customer name: {user_name}")
    if db_review.product_name:
        parts.append(f"Product: {db_review.product_name}")
    if db_review.rating is not None:
        parts.append(f"Rating: {db_review.rating}/5")
    if db_review.text:
        parts.append(f"Review text: {db_review.text}")
    if db_review.pros:
        parts.append(f"Pros: {db_review.pros}")
    if db_review.cons:
        parts.append(f"Cons: {db_review.cons}")
    if db_review.photos_count:
        parts.append(f"Photos: {db_review.photos_count}")
    if db_review.has_video:
        parts.append("Has video: yes")
    if getattr(db_review, "is_edited_feedback", False):
        parts.append("Edited feedback: yes")

    review_summary = "\n".join(parts)

    client = AsyncOpenAIClient(api_key=api_key)
    generated = await client.chat_completion(
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a customer support assistant for a Wildberries seller. "
                    "Generate a short, polite, and useful response to this review. "
                    "Return only the reply text without quotes, markdown, labels, or explanations. "
                    "Use the same language as the review."
                ),
            },
            {"role": "user", "content": review_summary},
            
        ],
        model="gpt-4o-mini",
        temperature=0.4,
        max_tokens=260,
    )

    reply_text = str(generated or "").strip()
    if not reply_text:
        raise HTTPException(status_code=502, detail="Failed to generate reply")

    return {"text": reply_text}
