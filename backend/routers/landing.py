import math
from datetime import datetime

from fastapi import APIRouter


router = APIRouter()
START_DATE = datetime(2026, 5, 1)
REVIEWS_PER_MONTH = 10000
SECONDS_IN_MONTH = 30 * 24 * 60 * 60


@router.post("/reviews")
def get_reviews():
    t_passed = (datetime.now() - START_DATE).total_seconds()
        
    linear_part = (REVIEWS_PER_MONTH / SECONDS_IN_MONTH) * t_passed
    sine_part = 100 * math.sin((2 * math.pi * 5 * t_passed) / SECONDS_IN_MONTH)

    return {"total_answers": linear_part + sine_part}
