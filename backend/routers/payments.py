from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
import database.database as database
from routers.auth import get_current_user
from database.models import User, Payment
from services.yookassa_service import (
    create_yookassa_payment,
    verify_and_process_payment,
)
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class CreatePaymentRequest(BaseModel):
    amount: Optional[str] = "990.00"
    return_url: Optional[str] = None
    service_type: Optional[str] = None


@router.post("/create")
async def create_payment(
    req: CreatePaymentRequest,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service_type = req.service_type
        if not service_type:
            amount_clean = str(req.amount).split(".")[0]
            if amount_clean == "990":
                service_type = "reanswer"
            elif amount_clean == "490":
                service_type = "respam"
            elif amount_clean == "1190":
                service_type = "both"
            else:
                service_type = "reanswer"

        confirmation_url, payment_id = await create_yookassa_payment(
            db=db,
            user_id=current_user.id,
            amount_val=req.amount,
            return_url=req.return_url,
            email=current_user.email,
            service_type=service_type,
        )
        return {
            "ok": True,
            "confirmation_url": confirmation_url,
            "payment_id": payment_id,
        }
    except Exception as e:
        logger.error(f"Error creating payment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create payment session")


@router.get("/check/{payment_id}")
async def check_payment_status(
    payment_id: str,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    payment = (
        db.query(Payment).filter(Payment.yookassa_payment_id == payment_id).first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Sync and verify status (from YooKassa or Mock check)
    success = await verify_and_process_payment(db, payment_id)

    # Reload payment to get current status after verification
    db.refresh(payment)

    successful_payments_count = (
        db.query(func.count(Payment.id))
        .filter(Payment.user_id == current_user.id, Payment.status == "succeeded")
        .scalar()
        or 0
    )
    is_first_payment = payment.status == "succeeded" and successful_payments_count == 1

    return {
        "ok": True,
        "status": payment.status,
        "success": success,
        "is_first_payment": is_first_payment,
    }


@router.post("/yookassa/webhook")
async def yookassa_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
):
    """
    Webhook endpoint called by YooKassa.
    Specifically listens for payment.succeeded event.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event = payload.get("event")
    if not event:
        raise HTTPException(status_code=400, detail="Missing event field")

    # We only care about payment.succeeded
    if event == "payment.succeeded":
        payment_obj = payload.get("object", {})
        payment_id = payment_obj.get("id")

        if not payment_id:
            raise HTTPException(status_code=400, detail="Missing payment ID in object")

        logger.info(
            f"Received YooKassa payment.succeeded webhook for payment ID: {payment_id}"
        )
        # Process the payment in a background task so we can reply immediately with a 200 OK to YooKassa
        background_tasks.add_task(verify_and_process_payment, db, payment_id)

    return {"ok": True}
