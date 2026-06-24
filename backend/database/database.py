import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./autoreviews.db")
SQLALCHEMY_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
SQLALCHEMY_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
SQLALCHEMY_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
SQLALCHEMY_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine_kwargs = {"connect_args": connect_args}

if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update(
        pool_size=SQLALCHEMY_POOL_SIZE,
        max_overflow=SQLALCHEMY_MAX_OVERFLOW,
        pool_timeout=SQLALCHEMY_POOL_TIMEOUT,
        pool_recycle=SQLALCHEMY_POOL_RECYCLE,
        pool_pre_ping=True,
    )

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
