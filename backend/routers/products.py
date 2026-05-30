from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import crud
import database
from routers.auth import check_active_subscription
from models import User
from pydantic import BaseModel
from services.wb_products import sync_user_products

router = APIRouter()


class Product(BaseModel):
    nmId: str
    name: str


@router.get("/", response_model=List[Product])
async def read_products(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
):
    rows = crud.get_nm_ids(db, current_user.id)
    if not rows:
        return await sync_user_products(
            db=db,
            user=current_user,
            replace_existing=False,
        )

    return [{"nmId": row.nm_id, "name": row.product_name} for row in rows]
