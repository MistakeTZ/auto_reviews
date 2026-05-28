import os
import logging
import httpx

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from admin import setup_admin
from bot import (
    BotType,
    MaxBotClient,
    TelegramBotClient,
    configure_webhook,
    parse_max_update,
    parse_tg_update,
    process_update,
)
from database import engine
from models import Base
from routers import auth, rules, reviews, settings, products, payments

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def run_migrations():
    db_url = os.getenv("DATABASE_URL", "sqlite:///./autoreviews.db")
    if db_url.startswith("postgresql"):
        try:
            inspector = inspect(engine)
            with engine.connect() as conn:
                pass # migrations if needed

        except Exception as e:
            logger.warning("Automatic PostgreSQL migrations warning:", exc_info=e)


run_migrations()

Base.metadata.create_all(bind=engine)

class XForwardedProtoMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            headers = dict(scope.get("headers", []))
            
            # Determine host
            host_val = b""
            if b"x-forwarded-host" in headers:
                host_val = headers[b"x-forwarded-host"].split(b",")[0].strip()
            elif b"host" in headers:
                host_val = headers[b"host"].split(b",")[0].strip()
                
            host_str = host_val.decode("latin1").lower()
            
            # Determine proto
            proto = ""
            if b"x-forwarded-proto" in headers:
                proto = headers[b"x-forwarded-proto"].decode("latin1").split(",")[0].strip().lower()
            
            # If the request comes from production domain (reanswer.ru) or has https proxy proto, force https
            if proto == "https" or "reanswer.ru" in host_str:
                scope["scheme"] = "https"
                
            # Keep host header aligned with X-Forwarded-Host if provided
            if b"x-forwarded-host" in headers:
                new_headers = []
                for k, v in scope.get("headers", []):
                    if k == b"host":
                        new_headers.append((b"host", host_val))
                    else:
                        new_headers.append((k, v))
                scope["headers"] = new_headers
                
        await self.app(scope, receive, send)


app = FastAPI(title="Wildberries reAnswer API")

app.add_middleware(XForwardedProtoMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(rules.router, prefix="/api/rules", tags=["rules"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])

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
        await configure_webhook(
            BotType.TELEGRAM, tg_token, webhook_base_url, webhook_secret
        )
    if max_token:
        await configure_webhook(BotType.MAX, max_token, webhook_base_url, webhook_secret)


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
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            if bot_type == "telegram":
                client = TelegramBotClient(http_client, token)
                ctx = parse_tg_update(payload, client)
            else:
                client = MaxBotClient(http_client, token)
                ctx = parse_max_update(payload, client)

            # Some updates do not carry link/start payload and can be ignored.
            if ctx:
                await process_update(ctx)
    except Exception as e:
        logger.error(f"Error processing {bot_type} webhook: {e}, data: {payload}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error processing webhook") from e
    return {"ok": True}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
