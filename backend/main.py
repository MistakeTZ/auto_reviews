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
                pass # migrations if needed

        except Exception as e:
            print("Automatic PostgreSQL migrations warning:", e)


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
