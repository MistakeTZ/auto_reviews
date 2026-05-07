from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, database
from .auth import get_current_user
from ..models import User
from pydantic import BaseModel
from ..services.wb_products import sync_user_products

router = APIRouter()


class ProductMock(BaseModel):
    nmId: str
    name: str


@router.get("/", response_model=List[ProductMock])
def read_products(
    refresh: bool = False,
    replace: bool = False,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user),
):
    if refresh:
        return sync_user_products(db=db, user=current_user, replace_existing=replace)

    rows = crud.get_nm_ids(db, current_user.id)
    return [{"nmId": row.nm_id, "name": row.product_name} for row in rows]
