from database.database import SessionLocal
from database.models import NmIDs


class ProductSyncService:
    @staticmethod
    def user_has_saved_products(user_id: int) -> bool:
        with SessionLocal() as db:
            return (
                db.query(NmIDs.id).filter(NmIDs.user_d_id == user_id).limit(1).first()
                is not None
            )

    @staticmethod
    def is_db_factory_healthy(db_factory) -> bool:
        try:
            with db_factory() as db:
                db.execute("SELECT 1")
            return True
        except Exception:
            return False
