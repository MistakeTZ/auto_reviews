from datetime import datetime
from math import sin
from threading import Lock

from fastapi import APIRouter


router = APIRouter()
START_DATE = datetime(2026, 5, 1)
ANSWER_PER_SECOND = 260
_last_total_answers = 0
_counter_lock = Lock()


@router.post("/reviews")
def get_reviews():
    global _last_total_answers

    now = datetime.now()
    seconds_since_start = (now - START_DATE).total_seconds()
    total_answers = int(seconds_since_start / ANSWER_PER_SECOND)
    # Добавляем некоторую синусоидальную вариацию для реалистичности
    variation = int(1000 * sin(seconds_since_start / 3600))  # колебания в течение часа
    total_answers += variation

    # Never return a value lower than we have already exposed.
    with _counter_lock:
        total_answers = max(total_answers, 0)
        if total_answers < _last_total_answers:
            total_answers = _last_total_answers
        else:
            _last_total_answers = total_answers

    return {"total_answers": total_answers}
