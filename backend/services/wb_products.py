import logging
from typing import Dict, List

import httpx
from sqlalchemy.orm import Session

import crud
from models import User

logger = logging.getLogger(__name__)


WB_CONTENT_CARDS_API_URL = (
    "https://content-api.wildberries.ru/content/v2/get/cards/list"
)


def _normalize_characteristics(raw_characteristics: object) -> List[Dict]:
    normalized: List[Dict] = []
    if not isinstance(raw_characteristics, list):
        return normalized

    for item in raw_characteristics:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        if not name:
            continue

        values_raw = item.get("value")
        if isinstance(values_raw, list):
            values = [str(v).strip() for v in values_raw if v is not None]
        elif values_raw is None:
            values = []
        else:
            values = [str(values_raw).strip()]

        normalized.append({"name": name, "value": values})

    return normalized


async def fetch_wb_products(api_token: str, limit: int = 100) -> List[Dict]:
    """Fetch all products via WB content cards endpoint using cursor pagination."""
    if not api_token:
        return []

    products: List[Dict] = []
    seen_nm_ids: set[str] = set()
    cursor: Dict = {"limit": limit}

    async with httpx.AsyncClient(timeout=20.0) as client:
        while True:
            response = await client.post(
                WB_CONTENT_CARDS_API_URL,
                headers={"Authorization": api_token},
                json={
                    "settings": {
                        "sort": {"ascending": True},
                        "cursor": cursor,
                        "filter": {"withPhoto": -1},
                    }
                },
            )
            response.raise_for_status()

            payload = response.json() if response.content else {}
            cards = payload.get("cards", []) if isinstance(payload, dict) else []
            if not cards:
                break

            for item in cards:
                if not isinstance(item, dict):
                    continue

                nm_id = item.get("nmID") or item.get("nmId")
                if nm_id is None:
                    continue
                nm_id_str = str(nm_id)
                if nm_id_str in seen_nm_ids:
                    continue
                seen_nm_ids.add(nm_id_str)

                title = str(item.get("title") or f"WB #{nm_id_str}")
                description = item.get("description")

                photo_url = None
                photos = item.get("photos")
                if isinstance(photos, list) and photos and isinstance(photos[0], dict):
                    photo_url = photos[0].get("tm")

                characteristics = _normalize_characteristics(item.get("characteristics"))

                products.append(
                    {
                        "nmId": nm_id_str,
                        "name": title,
                        "title": title,
                        "description": str(description or "").strip(),
                        "characteristics": characteristics,
                    }
                )
                if photo_url:
                    products[-1]["photo_url"] = str(photo_url).strip()

            response_cursor = payload.get("cursor", {}) if isinstance(payload, dict) else {}
            if len(cards) < limit or not isinstance(response_cursor, dict):
                break

            next_cursor: Dict = {"limit": limit}
            updated_at = response_cursor.get("updatedAt")
            nm_id_cursor = response_cursor.get("nmID")
            if updated_at is not None:
                next_cursor["updatedAt"] = updated_at
            if nm_id_cursor is not None:
                next_cursor["nmID"] = nm_id_cursor

            if cursor == next_cursor:
                break
            cursor = next_cursor

    return products


async def sync_user_products(
    db: Session,
    user: User,
    replace_existing: bool,
) -> List[Dict]:
    """Refresh products from WB and persist them for this user."""
    token = str(user.wb_api_token or "").strip()
    if not token:
        if replace_existing:
            crud.clear_nm_ids(db, user.id)
        rows = crud.get_nm_ids(db, user.id)
        return [{"nmId": row.nm_id, "name": row.product_name} for row in rows]

    products: List[Dict] = []

    try:
        products = await fetch_wb_products(token, limit=100)
    except httpx.HTTPError as exc:
        logger.warning("WB content cards fetch failed: %s", exc)

    if not products:
        rows = crud.get_nm_ids(db, user.id)
        return [{"nmId": row.nm_id, "name": row.product_name} for row in rows]

    if replace_existing:
        crud.clear_nm_ids(db, user.id)

    crud.upsert_nm_ids_bulk(db, user.id, products)

    rows = crud.get_nm_ids(db, user.id)
    return [{"nmId": row.nm_id, "name": row.product_name} for row in rows]
