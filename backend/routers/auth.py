from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Annotated
from jose import JWTError, jwt
import os
from urllib.parse import urlparse

import crud
import schemas
import database
import auth
from services.notifications import send_password_reset_email

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(database.get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=schemas.UserPublic)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    try:
        return crud.create_user(db=db, user=user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/check-promocode")
def check_promocode(code: str, db: Session = Depends(database.get_db)):
    promo, error = crud.validate_registration_promocode(db, code)
    if error:
        return {
            "valid": False,
            "message": error,
            "days_on_registration": 0,
        }

    return {
        "valid": True,
        "message": "Promo code is valid",
        "days_on_registration": int(promo.days_on_registration or 0),
    }


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(database.get_db),
):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserPublic)
def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user


def check_active_subscription(current_user: schemas.User = Depends(get_current_user)):
    if not current_user.has_active_subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active subscription required. Please activate trial or buy a subscription.",
        )
    return current_user


@router.post("/forgot-password")
async def forgot_password(
    request: Request,
    body: schemas.ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
):
    user = crud.get_user_by_email(db, email=body.email)
    if user:
        token = auth.create_password_reset_token(user.email, user.hashed_password)
        origin = request.headers.get("origin")
        if not origin:
            referer = request.headers.get("referer")
            if referer:
                parsed = urlparse(referer)
                origin = f"{parsed.scheme}://{parsed.netloc}"
            else:
                webhook_url = os.getenv("BOT_WEBHOOK_BASE_URL", "").strip()
                if webhook_url:
                    origin = webhook_url
                else:
                    domain = os.getenv("DOMAIN", "localhost:3000").strip()
                    origin = (
                        f"https://{domain}"
                        if "localhost" not in domain
                        else f"http://{domain}"
                    )

        reset_link = f"{origin.rstrip('/')}/reset-password?token={token}"
        background_tasks.add_task(send_password_reset_email, user.email, reset_link)

    return {
        "message": "If the email is registered, a password reset link has been sent."
    }


@router.post("/reset-password")
def reset_password(
    body: schemas.ResetPasswordRequest,
    db: Session = Depends(database.get_db),
):
    try:
        payload = jwt.decode(body.token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("sub")
        purpose = payload.get("purpose")
        if not email or purpose != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid or expired token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    verified_email = auth.verify_password_reset_token(body.token, user.hashed_password)
    if not verified_email or verified_email != email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    new_hashed_password = auth.get_password_hash(body.new_password)
    user.hashed_password = new_hashed_password
    db.add(user)
    db.commit()

    return {"message": "Password reset successful"}
