from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
import database
from routers.auth import get_current_user
from models import User
from pydantic import BaseModel
from services.wb_products import sync_user_products

router = APIRouter()


class TokenUpdate(BaseModel):
    token: str


@router.post("/token")
def update_token(
    token_data: TokenUpdate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    updated_user = crud.update_user_token(
        db, user_id=current_user.id, token=token_data.token
    )
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Requirement: when token changes, clear old nm_ids and fetch fresh list.
    sync_user_products(db=db, user=updated_user, replace_existing=True)

    return {"ok": True, "message": "Token updated successfully"}
