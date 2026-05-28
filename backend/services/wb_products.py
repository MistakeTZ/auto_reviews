import logging
from typing import Dict, List

import httpx
from sqlalchemy.orm import Session

import crud
from models import User

logger = logging.getLogger(__name__)


WB_PRICES_API_URL = (
    "https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter"
)
WB_FEEDBACKS_API_URL = "https://feedbacks-api.wildberries.ru/api/v1/feedbacks"


def fetch_wb_products(api_token: str, limit: int = 1000) -> List[Dict]:
    """Fetch all products via WB prices endpoint using offset pagination."""
    if not api_token:
        return []

    products: List[Dict] = []
    offset = 0

    with httpx.Client(timeout=20.0) as client:
        while True:
            response = client.get(
                WB_PRICES_API_URL,
                headers={"Authorization": api_token},
                params={"limit": limit, "offset": offset},
            )
            response.raise_for_status()

            payload = response.json() if response.content else {}
            data = payload.get("data", {}) if isinstance(payload, dict) else {}
            list_goods = data.get("listGoods", []) if isinstance(data, dict) else []
            if not list_goods:
                break

            for item in list_goods:
                nm_id = item.get("nmID")
                vendor_code = item.get("vendorCode")
                if nm_id is None:
                    continue
                products.append(
                    {
                        "nmId": str(nm_id),
                        "name": str(vendor_code or f"WB #{nm_id}"),
                    }
                )

            offset += limit

    return products


def fetch_wb_products_from_feedbacks(api_token: str, take: int = 100) -> List[Dict]:
    """Fetch products from feedbacks endpoint (works without prices API access)."""
    if not api_token:
        return []

    products_by_nm_id: Dict[str, Dict] = {}

    with httpx.Client(timeout=20.0) as client:
        for is_answered in (False, True):
            skip = 0
            for _ in range(200):
                response = client.get(
                    WB_FEEDBACKS_API_URL,
                    headers={"Authorization": api_token},
                    params={
                        "isAnswered": str(is_answered).lower(),
                        "take": take,
                        "skip": skip,
                    },
                )

                # If token has no access or endpoint is unavailable, stop this branch.
                if response.status_code >= 400:
                    logger.warning(
                        "WB feedbacks fetch failed (isAnswered=%s, skip=%s, status=%s)",
                        is_answered,
                        skip,
                        response.status_code,
                    )
                    break

                payload = response.json() if response.content else {}
                data = payload.get("data", {}) if isinstance(payload, dict) else {}
                feedbacks = data.get("feedbacks", []) if isinstance(data, dict) else []
                if not feedbacks:
                    break

                for fb in feedbacks:
                    if not isinstance(fb, dict):
                        continue
                    product_details = fb.get("productDetails") or {}
                    nm_id = product_details.get("nmId")
                    if nm_id is None:
                        continue

                    nm_id_str = str(nm_id)
                    if nm_id_str in products_by_nm_id:
                        continue

                    product_name = str(
                        product_details.get("productName")
                        or fb.get("productName")
                        or f"WB #{nm_id_str}"
                    )
                    products_by_nm_id[nm_id_str] = {
                        "nmId": nm_id_str,
                        "name": product_name,
                    }

                if len(feedbacks) < take:
                    break
                skip += take

    return list(products_by_nm_id.values())


def sync_user_products(
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
        products = fetch_wb_products(token, limit=1000)
    except httpx.HTTPError as exc:
        logger.warning("WB prices API fetch failed, fallback to feedbacks: %s", exc)

    if not products:
        products = fetch_wb_products_from_feedbacks(token, take=100)

    if not products:
        rows = crud.get_nm_ids(db, user.id)
        return [{"nmId": row.nm_id, "name": row.product_name} for row in rows]

    if replace_existing:
        crud.clear_nm_ids(db, user.id)

    crud.upsert_nm_ids_bulk(db, user.id, products)

    rows = crud.get_nm_ids(db, user.id)
    return [{"nmId": row.nm_id, "name": row.product_name} for row in rows]
