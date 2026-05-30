import os
import logging
import secrets
from datetime import datetime, timezone

from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request

from database import engine
from models import NmIDs, NotificationMethod, Question, Review, Rule, User, Payment

logger = logging.getLogger("uvicorn.error")


def _auth_trace(message: str) -> None:
    # Emit both logger and stdout so traces are visible even with strict logger configs.
    logger.warning(message)
    logger.warning(message, extra={"flush": True})


class AdminAuth(AuthenticationBackend):
    """Simple session auth for SQLAdmin panel using credentials from env vars."""

    def __init__(self, secret_key: str):
        super().__init__(secret_key=secret_key)

    async def login(self, request: Request) -> bool:
        _auth_trace(
            "[SQLADMIN AUTH] "
            f"{datetime.now(timezone.utc).isoformat()} "
            f"login() called method={request.method} path={request.url.path} "
            f"content_type={request.headers.get('content-type', '')}"
        )

        form = await request.form()
        username = str(form.get("username") or "")
        password = str(form.get("password") or "")

        admin_login = os.getenv("SQLADMIN_USERNAME", "admin")
        admin_password = os.getenv("SQLADMIN_PASSWORD", "admin")

        is_login_ok = secrets.compare_digest(username, admin_login)
        is_password_ok = secrets.compare_digest(password, admin_password)

        if is_login_ok and is_password_ok:
            _auth_trace(
                "[SQLADMIN AUTH] "
                f"{datetime.now(timezone.utc).isoformat()} "
                f"login success username={username}"
            )
            request.session.update({"token": username})
            return True

        _auth_trace(
            "[SQLADMIN AUTH] "
            f"{datetime.now(timezone.utc).isoformat()} "
            f"login failed username={username}"
        )
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
        # User.wb_api_token,
        User.sid,
        User.uuid,
    ]
    form_excluded_columns = [
        User.rules,
        User.reviews,
        User.nm_ids,
        User.notification_methods,
    ]
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


class QuestionAdmin(ModelView, model=Question):
    column_list = [
        Question.id,
        Question.wb_question_id,
        Question.nm_id,
        Question.product_name,
        Question.text,
        Question.answer_text,
        Question.date,
        Question.state,
        Question.editable,
        Question.user_name,
        Question.user_id,
    ]
    name = "Question"
    name_plural = "Questions"


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


class PaymentAdmin(ModelView, model=Payment):
    column_list = [
        Payment.id,
        Payment.yookassa_payment_id,
        Payment.user_id,
        Payment.amount,
        Payment.status,
        Payment.created_at,
        Payment.updated_at,
    ]
    name = "Payment"
    name_plural = "Payments"


def setup_admin(app):
    secret = os.getenv("SQLADMIN_SECRET_KEY", "change-me-sqladmin-secret")
    authentication_backend = AdminAuth(secret_key=secret)

    admin = Admin(
        app=app,
        engine=engine,
        title="reAnswer Admin",
        authentication_backend=authentication_backend,
    )

    admin.add_view(UserAdmin)
    admin.add_view(RuleAdmin)
    admin.add_view(ReviewAdmin)
    admin.add_view(QuestionAdmin)
    admin.add_view(NmIDsAdmin)
    admin.add_view(NotificationMethodAdmin)
    admin.add_view(PaymentAdmin)

    return admin
