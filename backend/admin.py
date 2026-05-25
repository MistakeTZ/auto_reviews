import os

from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from sqlalchemy import select
from starlette.requests import Request

from auth import verify_password
from database import engine
from models import NmIDs, NotificationMethod, Review, Rule, User


class AdminAuth(AuthenticationBackend):
    """Simple session auth for SQLAdmin panel using credentials from env vars."""

    def __init__(self, secret_key: str):
        super().__init__(secret_key=secret_key)

    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = str(form.get("username") or "")
        password = str(form.get("password") or "")

        admin_login = os.getenv("SQLADMIN_USERNAME", "admin")
        admin_password = os.getenv("SQLADMIN_PASSWORD", "admin")

        if username == admin_login and password == admin_password:
            request.session.update({"token": username})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return bool(request.session.get("token"))


class UserAdmin(ModelView, model=User):
    column_list = [
        User.id,
        User.email,
        User.name,
        User.wb_api_token,
        User.uuid,
    ]
    form_excluded_columns = [User.rules, User.reviews, User.nm_ids, User.notification_methods]
    name = "User"
    name_plural = "Users"


class RuleAdmin(ModelView, model=Rule):
    column_list = [
        Rule.id,
        Rule.name,
        Rule.target,
        Rule.nm_id,
        Rule.condition_rating_operator,
        Rule.condition_rating,
        Rule.condition_keyword,
        Rule.action_type,
        Rule.priority,
        Rule.user_id,
    ]
    name = "Rule"
    name_plural = "Rules"


class ReviewAdmin(ModelView, model=Review):
    column_list = [
        Review.id,
        Review.wb_review_id,
        Review.nm_id,
        Review.product_name,
        Review.rating,
        Review.status,
        Review.user_id,
    ]
    name = "Review"
    name_plural = "Reviews"


class NmIDsAdmin(ModelView, model=NmIDs):
    column_list = [NmIDs.id, NmIDs.nm_id, NmIDs.product_name, NmIDs.user_d_id]
    name = "Product"
    name_plural = "Products"


class NotificationMethodAdmin(ModelView, model=NotificationMethod):
    column_list = [
        NotificationMethod.id,
        NotificationMethod.user_id,
        NotificationMethod.type,
        NotificationMethod.value,
        NotificationMethod.is_active,
    ]
    name = "Notification Method"
    name_plural = "Notification Methods"


def _has_users() -> bool:
    """Enable auth when at least one user exists in DB."""
    with engine.connect() as conn:
        row = conn.execute(select(User.id).limit(1)).first()
        return row is not None


def setup_admin(app):
    secret = os.getenv("SQLADMIN_SECRET_KEY", "change-me-sqladmin-secret")
    authentication_backend = AdminAuth(secret_key=secret) if _has_users() else None

    admin = Admin(
        app=app,
        engine=engine,
        title="reAnswer Admin",
        authentication_backend=authentication_backend,
    )

    admin.add_view(UserAdmin)
    admin.add_view(RuleAdmin)
    admin.add_view(ReviewAdmin)
    admin.add_view(NmIDsAdmin)
    admin.add_view(NotificationMethodAdmin)

    return admin
