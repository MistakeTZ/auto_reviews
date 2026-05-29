from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import logging

import crud
import schemas
import database
from routers.auth import check_active_subscription
from models import User, Review
from pydantic import BaseModel
from processor.gpt import AsyncOpenAIClient

logger = logging.getLogger(__name__)
router = APIRouter()


class ReplyRequest(BaseModel):
    text: Optional[str] = None
    answer_feedback: Optional[str] = None


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


def _normalize_user_name(raw_name: Optional[str]) -> Optional[str]:
    user_name = (raw_name or "").strip()
    if user_name and user_name.startswith("Покупатель"):
        return None
    return user_name or None


def _extract_feedback_payload(feedback: dict, fallback_review: Review) -> schemas.ReviewCreate:
    product_details = feedback.get("productDetails") or {}
    rating = feedback.get("productValuation", fallback_review.rating)
    feedback_text = feedback.get("text", fallback_review.text or "")
    created_date = feedback.get("createdDate", fallback_review.date or "")
    user_name = _normalize_user_name(feedback.get("userName"))
    if user_name is None:
        user_name = fallback_review.user_name

    editable = feedback.get("editable")
    if editable is None:
        editable = fallback_review.editable

    return schemas.ReviewCreate(
        wb_review_id=str(feedback.get("id") or fallback_review.wb_review_id),
        nm_id=str(product_details.get("nmId") or fallback_review.nm_id),
        product_name=str(
            product_details.get("productName")
            or fallback_review.product_name
            or "Unknown Product"
        ),
        rating=int(rating or 0),
        text=feedback_text,
        date=created_date,
        status="manually",
        auto_answer_text=fallback_review.auto_answer_text,
        editable=bool(editable),
        user_name=user_name,
        pros=(feedback.get("pros") or "").strip() or fallback_review.pros,
        cons=(feedback.get("cons") or "").strip() or fallback_review.cons,
        photos_count=len(feedback.get("photoLinks") or [])
        if "photoLinks" in feedback
        else (fallback_review.photos_count or 0),
        has_video=bool(feedback.get("video"))
        if "video" in feedback
        else bool(fallback_review.has_video),
        is_edited_feedback=bool(feedback.get("parentFeedbackId"))
        if "parentFeedbackId" in feedback
        else bool(fallback_review.is_edited_feedback),
    )


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
        status = "none"
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
            status = "auto"
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

    reply_text = request.answer_feedback
    if reply_text is None:
        reply_text = request.text
    if reply_text is None:
        raise HTTPException(status_code=422, detail="Reply text is required")

    # Accept both real line breaks and escaped \n sequences from the UI.
    logger.info(f"Replying to review {review_id} with text: {reply_text}")

    refreshed_feedback = None
    async with ChatProcessor(current_user.wb_api_token) as processor:
        res = await processor.answer_feedback(
            db_review.wb_review_id,
            reply_text,
        )
        if res is not True:
            raise HTTPException(
                status_code=400,
                detail=res.get("detail", "Failed to reply to feedback on WB"),
            )

        refreshed_feedback = await processor.get_feedback(db_review.wb_review_id)

    # Update in DB after success
    db_review.auto_answer_text = reply_text

    if refreshed_feedback:
        review_data = _extract_feedback_payload(refreshed_feedback, db_review)
        review_data.auto_answer_text = reply_text
        review = crud.upsert_review(db, review_data, current_user.id)
    else:
        review = crud.update_review_status(
            db,
            review_id=review_id,
            user_id=current_user.id,
            status="manually",
            auto_answer_text=reply_text,
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
        model="gpt-5-nano",
        temperature=0.4,
        max_tokens=260,
    )

    reply_text = str(generated or "").strip()
    if not reply_text:
        raise HTTPException(status_code=502, detail="Failed to generate reply")

    return {"text": reply_text}
