import logging
import os
import uuid
import httpx
from sqlalchemy.orm import Session
import models

logger = logging.getLogger(__name__)

YOOKASSA_API_URL = "https://api.yookassa.ru/v3/payments"


def get_yookassa_credentials():
    shop_id = os.getenv("YOOKASSA_SHOP_ID", "").strip()
    secret_key = os.getenv("YOOKASSA_SECRET_KEY", "").strip()
    return shop_id, secret_key


async def create_yookassa_payment(
    db: Session,
    user_id: int,
    amount_val: str,
    return_url: str,
    email: str,
) -> str:
    """
    Creates a payment in YooKassa and saves a pending Payment in local DB.
    Returns the confirmation/checkout URL.
    """
    shop_id, secret_key = get_yookassa_credentials()

    if not shop_id or not secret_key:
        raise ValueError(
            "YooKassa credentials are not configured. Cannot create payment."
        )

    # Generate an idempotency key
    idempotency_key = str(uuid.uuid4())

    if not return_url:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8082").rstrip("/")
        return_url = f"{frontend_url}/referrals"

    payload = {
        "amount": {"value": amount_val, "currency": "RUB"},
        "capture": True,
        "confirmation": {"type": "redirect", "return_url": return_url},
        "description": "Подписка на 30 дней - reAnswer",
        "metadata": {"user_id": str(user_id)},
        "receipt": {
            "customer": {"email": email},
            "items": [
                {
                    "description": "Подписка на 30 дней - reAnswer",
                    "quantity": 1,
                    "amount": {"value": amount_val, "currency": "RUB"},
                    "vat_code": 1,
                    "measure": "piece",
                    "payment_subject": "service",
                    "payment_mode": "full_payment",
                }
            ],
        },
    }

    headers = {"Idempotence-Key": idempotency_key, "Content-Type": "application/json"}

    data = None
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                YOOKASSA_API_URL,
                json=payload,
                headers=headers,
                auth=(shop_id, secret_key),
                timeout=15.0,
            )
            data = response.json()
            response.raise_for_status()

            yookassa_id = data.get("id")
            confirmation_url = data.get("confirmation", {}).get("confirmation_url")

            if not yookassa_id or not confirmation_url:
                raise ValueError("Invalid response structure from YooKassa")

            payment = models.Payment(
                yookassa_payment_id=yookassa_id,
                user_id=user_id,
                amount=amount_val,
                status="pending",
            )
            db.add(payment)
            db.commit()

            return confirmation_url, yookassa_id
        except Exception as e:
            logger.error(
                f"Failed to create YooKassa payment: {e}\nResponse data: {data}",
                exc_info=True,
            )
            raise


async def verify_and_process_payment(db: Session, yookassa_payment_id: str) -> bool:
    """
    Retrieves payment details from YooKassa, verifies it, and if succeeded, updates
    the user's subscription and updates the Payment status in DB.
    """
    payment = (
        db.query(models.Payment)
        .filter(models.Payment.yookassa_payment_id == yookassa_payment_id)
        .first()
    )
    if not payment:
        logger.warning(f"Payment {yookassa_payment_id} not found in database.")
        return False

    if payment.status == "succeeded":
        logger.info(
            f"Payment {yookassa_payment_id} was already processed successfully."
        )
        return True

    # If it's a mock payment (for dev testing)
    if yookassa_payment_id.startswith("mock_"):
        payment.status = "succeeded"
        # Update user subscription
        import crud

        crud.buy_full_subscription(db, user_id=payment.user_id)
        db.commit()
        logger.info(f"Mock Payment {yookassa_payment_id} processed successfully.")
        return True

    shop_id, secret_key = get_yookassa_credentials()
    if not shop_id or not secret_key:
        logger.error(
            "YooKassa credentials are not configured but a real payment ID was requested."
        )
        return False

    async with httpx.AsyncClient() as client:
        try:
            url = f"{YOOKASSA_API_URL}/{yookassa_payment_id}"
            response = await client.get(url, auth=(shop_id, secret_key), timeout=15.0)
            response.raise_for_status()
            data = response.json()

            status = data.get("status")
            if status == "succeeded":
                payment.status = "succeeded"
                # Update user subscription
                import crud

                crud.buy_full_subscription(db, user_id=payment.user_id)
                db.commit()
                logger.info(
                    f"YooKassa Payment {yookassa_payment_id} succeeded and user {payment.user_id} subscription extended."
                )
                return True
            elif status in ("canceled", "failed"):
                payment.status = "failed"
                db.commit()
                logger.info(
                    f"YooKassa Payment {yookassa_payment_id} has failed/canceled status: {status}"
                )
                return False
            else:
                logger.info(
                    f"YooKassa Payment {yookassa_payment_id} is in status: {status}"
                )
                return False
        except Exception as e:
            logger.error(
                f"Failed to verify YooKassa payment {yookassa_payment_id}: {e}",
                exc_info=True,
            )
            return False
