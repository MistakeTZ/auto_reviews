from datetime import datetime
from math import sin

from fastapi import APIRouter


router = APIRouter()
START_DATE = datetime(2026, 5, 1)
ANSWER_PER_SECOND = 260


@router.post("/reviews")
def get_reviews():
    now = datetime.now()
    seconds_since_start = (now - START_DATE).total_seconds()
    total_answers = int(seconds_since_start / ANSWER_PER_SECOND)
    # Добавляем некоторую синусоидальную вариацию для реалистичности
    variation = int(1000 * sin(seconds_since_start / 3600))  # колебания в течение часа
    total_answers += variation
    return {"total_answers": max(total_answers, 0)}
