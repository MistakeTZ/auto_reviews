from typing import Dict, List

import httpx
from sqlalchemy.orm import Session

from .. import crud
from ..models import User


WB_PRICES_API_URL = "https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter"


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

    products = fetch_wb_products(token, limit=1000)

    if replace_existing:
        crud.clear_nm_ids(db, user.id)

    crud.upsert_nm_ids_bulk(db, user.id, products)

    rows = crud.get_nm_ids(db, user.id)
    return [{"nmId": row.nm_id, "name": row.product_name} for row in rows]
