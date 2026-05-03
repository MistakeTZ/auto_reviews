from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database
from .auth import get_current_user
from ..models import User
from pydantic import BaseModel

router = APIRouter()

class TokenUpdate(BaseModel):
    token: str

@router.post("/token")
def update_token(token_data: TokenUpdate, db: Session = Depends(database.get_db), current_user: User = Depends(get_current_user)):
    # In a real app, we might want to verify the token with WB API here before saving
    updated_user = crud.update_user_token(db, user_id=current_user.id, token=token_data.token)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True, "message": "Token updated successfully"}
