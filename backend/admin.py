import os
import logging
import secrets
from datetime import datetime, timezone

from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request

from database import engine
from models import (
    NmIDs,
    NotificationMethod,
    Question,
    Review,
    Rule,
    User,
    Payment,
    PromoCode,
    SpamRule,
    SpamMessageTemplate,
    SpamRuleTemplate,
    SpamSentMessage,
    SpamLastFetchedEventTime,
)

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
        User.sid,
        User.uuid,
        User.subscription_expires_at,
        User.tariff_type,
        User.trial_activated,
        User.respam_subscription_expires_at,
        User.respam_tariff_type,
        User.respam_trial_activated,
        User.referral_source,
    ]
    column_searchable_list = [
        User.email,
        User.name,
        User.sid,
        User.uuid,
        User.referral_code,
    ]
    column_sortable_list = [
        User.id,
        User.email,
        User.name,
        User.subscription_expires_at,
        User.tariff_type,
    ]
    column_default_sort = (User.id, True)
    form_excluded_columns = [
        User.rules,
        User.reviews,
        User.questions,
        User.nm_ids,
        User.notification_methods,
    ]
    name = "User"
    name_plural = "Users"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


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
        Rule.is_active,
    ]
    column_searchable_list = [
        Rule.name,
        Rule.nm_id,
        Rule.condition_keyword,
        Rule.action_text,
    ]
    column_sortable_list = [
        Rule.id,
        Rule.name,
        Rule.priority,
        Rule.user_id,
        Rule.is_active,
    ]
    column_default_sort = (Rule.id, True)
    form_excluded_columns = [Rule.owner]
    name = "Rule"
    name_plural = "Rules"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class ReviewAdmin(ModelView, model=Review):
    column_list = [
        Review.id,
        Review.wb_review_id,
        Review.nm_id,
        Review.product_name,
        Review.rating,
        Review.status,
        Review.date,
        Review.user_name,
        Review.user_id,
    ]
    column_searchable_list = [
        Review.wb_review_id,
        Review.nm_id,
        Review.product_name,
        Review.text,
        Review.auto_answer_text,
        Review.user_name,
    ]
    column_sortable_list = [
        Review.id,
        Review.rating,
        Review.status,
        Review.user_id,
        Review.date,
    ]
    column_default_sort = (Review.id, True)
    form_excluded_columns = [Review.owner]
    name = "Review"
    name_plural = "Reviews"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


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
    column_searchable_list = [
        Question.wb_question_id,
        Question.nm_id,
        Question.product_name,
        Question.text,
        Question.answer_text,
        Question.proposed_answer_text,
        Question.user_name,
    ]
    column_sortable_list = [
        Question.id,
        Question.nm_id,
        Question.state,
        Question.user_id,
        Question.date,
    ]
    column_default_sort = (Question.id, True)
    form_excluded_columns = [Question.owner]
    name = "Question"
    name_plural = "Questions"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class NmIDsAdmin(ModelView, model=NmIDs):
    column_list = [
        NmIDs.id,
        NmIDs.nm_id,
        NmIDs.product_name,
        NmIDs.title,
        NmIDs.user_d_id,
    ]
    column_searchable_list = [
        NmIDs.nm_id,
        NmIDs.product_name,
        NmIDs.title,
        NmIDs.description,
    ]
    column_sortable_list = [
        NmIDs.id,
        NmIDs.nm_id,
        NmIDs.product_name,
        NmIDs.user_d_id,
    ]
    column_default_sort = (NmIDs.id, True)
    form_excluded_columns = [NmIDs.owner]
    name = "Product"
    name_plural = "Products"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class PromoCodeAdmin(ModelView, model=PromoCode):
    column_list = [
        PromoCode.id,
        PromoCode.code,
        PromoCode.days_on_registration,
        PromoCode.topup_days,
        PromoCode.expires_at,
        PromoCode.max_uses,
        PromoCode.used_count,
    ]
    column_searchable_list = [PromoCode.code]
    column_sortable_list = [
        PromoCode.id,
        PromoCode.code,
        PromoCode.expires_at,
        PromoCode.used_count,
    ]
    column_default_sort = (PromoCode.id, True)
    name = "Promo Code"
    name_plural = "Promo Codes"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class NotificationMethodAdmin(ModelView, model=NotificationMethod):
    column_list = [
        NotificationMethod.id,
        NotificationMethod.user_id,
        NotificationMethod.type,
        NotificationMethod.value,
        NotificationMethod.is_active,
    ]
    column_searchable_list = [NotificationMethod.value]
    column_sortable_list = [
        NotificationMethod.id,
        NotificationMethod.user_id,
        NotificationMethod.type,
        NotificationMethod.is_active,
    ]
    column_default_sort = (NotificationMethod.id, True)
    form_excluded_columns = [NotificationMethod.owner]
    name = "Notification Method"
    name_plural = "Notification Methods"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


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
    column_searchable_list = [
        Payment.yookassa_payment_id,
        Payment.amount,
        Payment.status,
    ]
    column_sortable_list = [
        Payment.id,
        Payment.user_id,
        Payment.amount,
        Payment.status,
        Payment.created_at,
    ]
    column_default_sort = (Payment.id, True)
    form_excluded_columns = [Payment.user]
    name = "Payment"
    name_plural = "Payments"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class SpamRuleAdmin(ModelView, model=SpamRule):
    column_list = [
        SpamRule.id,
        SpamRule.user_id,
        SpamRule.chat_id,
        SpamRule.client_name,
        SpamRule.is_active,
        SpamRule.frequency_type,
        SpamRule.interval_days,
        SpamRule.send_hours,
        SpamRule.last_sent_at,
    ]
    column_searchable_list = [
        SpamRule.chat_id,
        SpamRule.client_name,
        SpamRule.reply_sign,
    ]
    column_sortable_list = [
        SpamRule.id,
        SpamRule.user_id,
        SpamRule.chat_id,
        SpamRule.is_active,
        SpamRule.last_sent_at,
    ]
    column_default_sort = (SpamRule.id, True)
    form_excluded_columns = [SpamRule.owner, SpamRule.templates]
    name = "Spam Rule"
    name_plural = "Spam Rules"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class SpamMessageTemplateAdmin(ModelView, model=SpamMessageTemplate):
    column_list = [
        SpamMessageTemplate.id,
        SpamMessageTemplate.user_id,
        SpamMessageTemplate.rule_id,
        SpamMessageTemplate.text,
        SpamMessageTemplate.start_hour,
        SpamMessageTemplate.end_hour,
        SpamMessageTemplate.is_global,
    ]
    column_searchable_list = [SpamMessageTemplate.text]
    column_sortable_list = [
        SpamMessageTemplate.id,
        SpamMessageTemplate.user_id,
        SpamMessageTemplate.rule_id,
        SpamMessageTemplate.is_global,
    ]
    column_default_sort = (SpamMessageTemplate.id, True)
    form_excluded_columns = [SpamMessageTemplate.owner, SpamMessageTemplate.rule]
    name = "Spam Message Template"
    name_plural = "Spam Message Templates"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class SpamRuleTemplateAdmin(ModelView, model=SpamRuleTemplate):
    column_list = [
        SpamRuleTemplate.id,
        SpamRuleTemplate.rule_id,
        SpamRuleTemplate.template_id,
    ]
    column_sortable_list = [
        SpamRuleTemplate.id,
        SpamRuleTemplate.rule_id,
        SpamRuleTemplate.template_id,
    ]
    column_default_sort = (SpamRuleTemplate.id, True)
    name = "Spam Rule Template"
    name_plural = "Spam Rule Templates"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class SpamSentMessageAdmin(ModelView, model=SpamSentMessage):
    column_list = [
        SpamSentMessage.id,
        SpamSentMessage.rule_id,
        SpamSentMessage.text,
        SpamSentMessage.sent_at,
        SpamSentMessage.chat_id,
        SpamSentMessage.add_time,
    ]
    column_searchable_list = [
        SpamSentMessage.text,
        SpamSentMessage.chat_id,
    ]
    column_sortable_list = [
        SpamSentMessage.id,
        SpamSentMessage.rule_id,
        SpamSentMessage.sent_at,
        SpamSentMessage.chat_id,
    ]
    column_default_sort = (SpamSentMessage.id, True)
    form_excluded_columns = [SpamSentMessage.rule]
    name = "Spam Sent Message"
    name_plural = "Spam Sent Messages"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


class SpamLastFetchedEventTimeAdmin(ModelView, model=SpamLastFetchedEventTime):
    column_list = [
        SpamLastFetchedEventTime.id,
        SpamLastFetchedEventTime.user_id,
        SpamLastFetchedEventTime.last_event_time_ms,
    ]
    column_sortable_list = [
        SpamLastFetchedEventTime.id,
        SpamLastFetchedEventTime.user_id,
        SpamLastFetchedEventTime.last_event_time_ms,
    ]
    column_default_sort = (SpamLastFetchedEventTime.id, True)
    form_excluded_columns = [SpamLastFetchedEventTime.owner]
    name = "Spam Last Fetched Event Time"
    name_plural = "Spam Last Fetched Event Times"
    page_size = 50
    page_size_options = [25, 50, 100, 200]


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
    admin.add_view(PromoCodeAdmin)
    admin.add_view(NotificationMethodAdmin)
    admin.add_view(PaymentAdmin)
    admin.add_view(SpamRuleAdmin)
    admin.add_view(SpamMessageTemplateAdmin)
    admin.add_view(SpamRuleTemplateAdmin)
    admin.add_view(SpamSentMessageAdmin)
    admin.add_view(SpamLastFetchedEventTimeAdmin)

    return admin
