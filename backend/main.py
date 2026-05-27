from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from admin import setup_admin
from models import Base
from database import engine
from routers import auth, rules, reviews, settings, products
from sqlalchemy import inspect, text
import os
from bot import configure_webhook, process_update


def run_migrations():
    db_url = os.getenv("DATABASE_URL", "sqlite:///./autoreviews.db")
    if db_url.startswith("postgresql"):
        try:
            inspector = inspect(engine)
            with engine.connect() as conn:
                # 1. Migrations for rules table
                if inspector.has_table("rules"):
                    existing_rules_cols = [c["name"] for c in inspector.get_columns("rules")]
                    for col, col_type in [
                        ("with_video", "BOOLEAN DEFAULT FALSE"),
                        ("with_photo", "BOOLEAN DEFAULT FALSE"),
                        ("with_name", "BOOLEAN DEFAULT FALSE"),
                        ("priority", "INTEGER DEFAULT 0"),
                        ("send_notification", "BOOLEAN DEFAULT FALSE"),
                        ("is_edited_feedback", "BOOLEAN DEFAULT FALSE"),
                    ]:
                        if col not in existing_rules_cols:
                            conn.execute(text(f"ALTER TABLE rules ADD COLUMN {col} {col_type}"))
                            conn.commit()

                # 2. Migrations for users table
                if inspector.has_table("users"):
                    existing_users_cols = [c["name"] for c in inspector.get_columns("users")]
                    for col, col_type in [
                        ("uuid", "VARCHAR(255)"),
                        ("subscription_expires_at", "TIMESTAMP WITH TIME ZONE"),
                        ("tariff_type", "VARCHAR(50) DEFAULT 'trial'"),
                        ("trial_activated", "BOOLEAN DEFAULT FALSE"),
                        ("referred_by_id", "INTEGER"),
                        ("referral_code", "VARCHAR(50)"),
                    ]:
                        if col not in existing_users_cols:
                            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                            conn.commit()

                # 3. Migrations for reviews table (new columns for pros, cons, photos count, has video, user name)
                if inspector.has_table("reviews"):
                    existing_reviews_cols = [c["name"] for c in inspector.get_columns("reviews")]
                    for col, col_type in [
                        ("user_name", "VARCHAR(255)"),
                        ("pros", "TEXT"),
                        ("cons", "TEXT"),
                        ("photos_count", "INTEGER DEFAULT 0"),
                        ("has_video", "BOOLEAN DEFAULT FALSE"),
                        ("editable", "BOOLEAN DEFAULT TRUE"),
                        ("is_edited_feedback", "BOOLEAN DEFAULT FALSE"),
                    ]:
                        if col not in existing_reviews_cols:
                            conn.execute(text(f"ALTER TABLE reviews ADD COLUMN {col} {col_type}"))
                            conn.commit()

                    # Normalize legacy statuses to the new enum-like set.
                    conn.execute(
                        text(
                            """
                            UPDATE reviews
                            SET status = CASE
                                WHEN status = 'auto-answered' THEN 'auto'
                                WHEN status = 'manual-review' THEN 'manually'
                                WHEN status = 'pending' THEN 'manually'
                                ELSE status
                            END
                            WHERE status IN ('auto-answered', 'manual-review', 'pending')
                            """
                        )
                    )
                    conn.commit()

                # 4. Backfill unique uuids for users that don't have one
                if inspector.has_table("users"):
                    try:
                        result = conn.execute(text("SELECT id FROM users WHERE uuid IS NULL")).fetchall()
                        if result:
                            import uuid
                            for row in result:
                                user_id = row[0]
                                conn.execute(
                                    text("UPDATE users SET uuid = :uuid WHERE id = :id"),
                                    {"uuid": str(uuid.uuid4()), "id": user_id}
                                )
                            conn.commit()
                    except Exception as users_err:
                        print("Backfill users uuid warning:", users_err)

                # 5. Backfill unique referral codes for users that don't have one
                if inspector.has_table("users"):
                    try:
                        result = conn.execute(text("SELECT id FROM users WHERE referral_code IS NULL")).fetchall()
                        if result:
                            import uuid
                            for row in result:
                                user_id = row[0]
                                conn.execute(
                                    text("UPDATE users SET referral_code = :code WHERE id = :id"),
                                    {"code": str(uuid.uuid4())[:8], "id": user_id}
                                )
                            conn.commit()
                    except Exception as ref_err:
                        print("Backfill users referral_code warning:", ref_err)

        except Exception as e:
            print("Automatic PostgreSQL migrations warning:", e)


run_migrations()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wildberries reAnswer API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def handle_x_forwarded_proto(request: Request, call_next):
    proto = request.headers.get("x-forwarded-proto")
    if proto:
        request.scope["scheme"] = proto
    return await call_next(request)


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(rules.router, prefix="/api/rules", tags=["rules"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])

setup_admin(app)


@app.on_event("startup")
async def setup_bot_webhooks():
    webhook_base_url = os.getenv("BOT_WEBHOOK_BASE_URL", "").strip()
    webhook_secret = os.getenv("BOT_WEBHOOK_SECRET", "").strip()

    if not webhook_base_url or not webhook_secret:
        return

    tg_token = os.getenv("TG_BOT_TOKEN", "").strip()
    max_token = os.getenv("MAX_BOT_TOKEN", "").strip()

    if tg_token:
        await configure_webhook(tg_token, "telegram", webhook_base_url, webhook_secret)
    if max_token:
        await configure_webhook(max_token, "max", webhook_base_url, webhook_secret)


@app.post("/api/bot/webhook/{bot_type}/{secret}")
async def bot_webhook(bot_type: str, secret: str, request: Request):
    expected_secret = os.getenv("BOT_WEBHOOK_SECRET", "").strip()
    if not expected_secret or secret != expected_secret:
        raise HTTPException(status_code=403, detail="Invalid webhook secret")

    if bot_type not in {"telegram", "max"}:
        raise HTTPException(status_code=404, detail="Unknown bot type")

    token_env = "TG_BOT_TOKEN" if bot_type == "telegram" else "MAX_BOT_TOKEN"
    token = os.getenv(token_env, "").strip()
    if not token:
        raise HTTPException(status_code=503, detail=f"{token_env} is not configured")

    payload = await request.json()
    await process_update(payload, token, bot_type)
    return {"ok": True}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
