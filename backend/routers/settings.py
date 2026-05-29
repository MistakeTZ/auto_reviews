import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
import database
from routers.auth import get_current_user
from models import User
from pydantic import BaseModel
from services.wb_products import sync_user_products
import base64
import json
from datetime import datetime
import schemas
from typing import List
import os

router = APIRouter()


class TokenUpdate(BaseModel):
    token: str


def check_token(token: str, db: Session) -> bool:
    if token is None or token.strip() == "":
        return {"error": "Токен пустой"}
    if "." not in token:
        return {"error": "Токен недействителен"}
    jwt = token.split(".")[1]

    try:
        jwt_decoded = base64.urlsafe_b64decode(jwt + "==").decode()
        decoded_data = json.loads(jwt_decoded)
    except (Exception, ValueError):
        return {"error": "Токен недействителен"}

    sid = decoded_data.get("sid")
    if not sid:
        return {"error": "Токен не содержит sid"}

    user = crud.get_user_by_sid(db, sid=sid)
    if user:
        return {"error": "Данный кабинет уже привязан к другому аккаунту"}

    s_bit_payload = decoded_data.get("s", 0)
    need_scopes = {
        7: "Вопросы и отзывы",
        # 9: "Чат с покупателем",
        # 11: "Возвраты",
    }

    user_scopes = [
        name for bit, name in need_scopes.items() if s_bit_payload & (1 << bit)
    ]
    read_only = s_bit_payload & (1 << 30) != 0
    missing_scopes = [
        name for _, name in need_scopes.items() if name not in user_scopes
    ]

    if missing_scopes:
        return {
            "error": f"Токен не содержит необходимые права: {', '.join(missing_scopes)}"
        }
    if read_only:
        return {"error": "Токен только для чтения, необходим токен с правами на запись"}

    expires_at = datetime.fromtimestamp(decoded_data.get("exp", 0))

    if datetime.now() > expires_at:
        return {"error": "Токен истек"}

    ping_url = "https://common-api.wildberries.ru/ping"
    try:
        response = requests.get(ping_url, headers={"Authorization": token})
        if response.status_code != 200:
            return {"error": "Токен недействителен"}
        return {"ok": True, "sid": sid}
    except Exception as e:
        return {"error": str(e)}


@router.post("/token")
def update_token(
    token_data: TokenUpdate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    checked_token = check_token(token_data.token, db)
    if checked_token.get("error"):
        raise HTTPException(status_code=401, detail=checked_token.get("error"))
    updated_user = crud.update_user_token(
        db,
        user_id=current_user.id,
        token=token_data.token,
        sid=checked_token.get("sid"),
    )
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    sync_user_products(db=db, user=updated_user, replace_existing=True)

    return {"ok": True, "message": "Token updated successfully"}


@router.get("/notifications", response_model=List[schemas.NotificationMethod])
def get_notifications(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_notification_methods(db, user_id=current_user.id)


@router.post("/notifications", response_model=schemas.NotificationMethod)
def add_notification(
    method_data: schemas.NotificationMethodCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    existing = crud.get_notification_methods(db, user_id=current_user.id)
    if current_user.tariff_type == "trial" and len(existing) >= 1:
        raise HTTPException(
            status_code=400,
            detail="Trial users are limited to 1 notification method. Upgrade for up to 5 methods.",
        )
    if len(existing) >= 5:
        raise HTTPException(
            status_code=400,
            detail="Maximum of 5 notification methods allowed per user",
        )
    return crud.create_notification_method(
        db, method=method_data, user_id=current_user.id
    )


@router.delete("/notifications/{method_id}")
def delete_notification(
    method_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    success = crud.delete_notification_method(
        db, method_id=method_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification method not found")
    return {"ok": True, "message": "Notification method deleted successfully"}


@router.get("/bots-config")
def get_bots_config():
    return {
        "tg_bot": os.getenv("TG_BOT_NAME", "autoreviews_bot"),
        "max_bot": os.getenv("MAX_BOT_NAME", "max_notification_bot"),
    }


class ReferralCodeRequest(BaseModel):
    code: str


@router.post("/apply-referral")
def apply_referral(
    req: ReferralCodeRequest,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        crud.apply_referral_code(db, user_id=current_user.id, code=req.code)
        return {"ok": True, "message": "Referral code applied successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/buy-subscription")
def buy_subscription(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        updated = crud.buy_full_subscription(db, user_id=current_user.id)
        return {
            "ok": True,
            "message": "Subscription purchased successfully",
            "subscription_expires_at": updated.subscription_expires_at,
            "tariff_type": updated.tariff_type,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/referrals-list")
def referrals_list(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    from models import User as DbUser

    referrals = db.query(DbUser).filter(DbUser.referred_by_id == current_user.id).all()
    return [
        {
            "id": ref.id,
            "name": ref.name,
            "email": ref.email,
            "trial_activated": ref.trial_activated,
            "tariff_type": ref.tariff_type,
        }
        for ref in referrals
    ]
