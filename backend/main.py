from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Base
from database import engine
from routers import auth, rules, reviews, settings, products
import sqlite3
import os


def run_migrations():
    db_url = os.getenv("DATABASE_URL", "sqlite:///./autoreviews.db")
    if db_url.startswith("sqlite:///"):
        db_path = db_url.replace("sqlite:///", "")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            # Migrations for rules table
            for col, col_type in [
                ("with_video", "BOOLEAN DEFAULT 0"),
                ("with_photo", "BOOLEAN DEFAULT 0"),
                ("with_name", "BOOLEAN DEFAULT 0"),
                ("priority", "INTEGER DEFAULT 0"),
                ("send_notification", "BOOLEAN DEFAULT 0"),
                ("is_edited_feedback", "BOOLEAN DEFAULT 0"),
            ]:
                try:
                    cursor.execute(f"ALTER TABLE rules ADD COLUMN {col} {col_type}")
                except sqlite3.OperationalError:
                    pass
            
            # Migrations for users table
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN uuid TEXT")
            except sqlite3.OperationalError:
                pass
                
            # Backfill unique uuids for users that don't have one
            try:
                import uuid
                cursor.execute("SELECT id FROM users WHERE uuid IS NULL")
                null_users = cursor.fetchall()
                for (uid,) in null_users:
                    cursor.execute("UPDATE users SET uuid = ? WHERE id = ?", (str(uuid.uuid4()), uid))
            except Exception as users_err:
                print("Backfill users uuid warning:", users_err)
                
            conn.commit()
            conn.close()
        except Exception as e:
            print("Automatic SQLite migrations warning:", e)


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

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(rules.router, prefix="/api/rules", tags=["rules"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
