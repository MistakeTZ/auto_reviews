import math
from datetime import datetime

from fastapi import APIRouter

router = APIRouter()
START_DATE = datetime(2026, 5, 1)
START_MESSAGES_DATE = datetime(2026, 4, 17)
REVIEWS_PER_MONTH = 10000
MESSAGES_PER_MONTH = 80000
SECONDS_IN_MONTH = 30 * 24 * 60 * 60


@router.post("/reviews")
def get_reviews():
    t_passed = (datetime.now() - START_DATE).total_seconds()

    linear_part = (REVIEWS_PER_MONTH / SECONDS_IN_MONTH) * t_passed
    sine_part = 100 * math.sin((2 * math.pi * 5 * t_passed) / SECONDS_IN_MONTH)
    total_answers = linear_part + sine_part
    total_answers *= 1.5

    return {"total_answers": total_answers}


@router.post("/messages")
def get_messages():
    t_passed = (datetime.now() - START_MESSAGES_DATE).total_seconds()

    linear_part = (MESSAGES_PER_MONTH / SECONDS_IN_MONTH) * t_passed
    sine_part = 800 * math.sin((2 * math.pi * 5 * t_passed) / SECONDS_IN_MONTH)
    total_messages = 220000 + linear_part + sine_part

    return {"total_messages": total_messages}
