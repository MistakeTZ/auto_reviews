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


router = APIRouter()


class TokenUpdate(BaseModel):
    token: str


def check_token(token: str) -> bool:
    if token is None or token.strip() == "":
        return {"error": "Token is empty"}
    if "." not in token:
        return {"error": "Token is invalid"}
    jwt = token.split(".")[1]

    try:
        jwt_decoded = base64.urlsafe_b64decode(jwt + "==").decode()
        decoded_data = json.loads(jwt_decoded)
    except (Exception, ValueError):
        return {"error": "Invalid token"}

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
        return {"error": f"Token is missing scopes: {', '.join(missing_scopes)}"}
    if read_only:
        return {"error": "Token is read only"}

    expires_at = datetime.fromtimestamp(decoded_data.get("exp", 0))

    if datetime.now() > expires_at:
        return {"error": "Token is expired"}

    ping_url = "https://common-api.wildberries.ru/ping"
    try:
        response = requests.get(ping_url, headers={"Authorization": token})
        if response.status_code != 200:
            return {"error": "Token is invalid"}
        return {"ok": True}
    except Exception as e:
        return {"error": str(e)}


@router.post("/token")
def update_token(
    token_data: TokenUpdate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    checked_token = check_token(token_data.token)
    if checked_token.get("error"):
        raise HTTPException(status_code=401, detail=checked_token.get("error"))
    updated_user = crud.update_user_token(
        db, user_id=current_user.id, token=token_data.token
    )
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    sync_user_products(db=db, user=updated_user, replace_existing=True)

    return {"ok": True, "message": "Token updated successfully"}
