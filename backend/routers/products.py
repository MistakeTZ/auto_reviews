from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, database
from .auth import get_current_user
from ..models import User
from pydantic import BaseModel

router = APIRouter()


class ProductMock(BaseModel):
    nmId: str
    name: str


@router.get("/", response_model=List[ProductMock])
def read_products(current_user: User = Depends(get_current_user)):
    # Mocking products for now. In real app, fetch from WB API using current_user.wb_api_token
    return [
        {"nmId": "1001", "name": "T-Shirt Black L"},
        {"nmId": "1002", "name": "Summer Dress"},
        {"nmId": "1003", "name": "Jeans Slim Fit"},
    ]
