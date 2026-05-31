from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict
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
    photo: str | None = None


@router.get("/", response_model=Dict[str, Product])
async def read_products(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(check_active_subscription),
):
    rows = crud.get_nm_ids(db, current_user.id)
    if not rows:
        synced = await sync_user_products(
            database.SessionLocal,
            current_user.id,
            current_user.wb_api_token or "",
            replace_existing=False,
        )
        return {
            item["nmId"]: {
                "nmId": item["nmId"],
                "name": item["name"],
                "photo": None,
            }
            for item in synced
        }

    return {
        row.nm_id: {
            "nmId": row.nm_id,
            "name": row.product_name,
            "photo": row.photo_url,
        }
        for row in rows
    }
