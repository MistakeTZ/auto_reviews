from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import logging
import time

import crud
import schemas
import database
import models
from routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

WB_CHATS_CACHE_TTL_SECONDS = 30 * 60
_wb_chats_cache: dict[str, tuple[float, List[dict]]] = {}


async def fetch_wb_chats(token: str) -> List[dict]:
    cached = _wb_chats_cache.get(token)
    now = time.time()
    if cached and cached[0] > now:
        return cached[1]

    url = "https://buyer-chat-api.wildberries.ru/api/v1/seller/chats"
    headers = {"Authorization": token}
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                chats = data.get("result") or []
                _wb_chats_cache[token] = (now + WB_CHATS_CACHE_TTL_SECONDS, chats)
                return chats
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Wildberries API error: {response.text}",
                )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with Wildberries chat API: {str(e)}",
            )


@router.get("/validate-id")
async def validate_chat_id(
    chat_id: str,
    current_user: models.User = Depends(get_current_user),
):
    token = (current_user.wb_chat_api_token or "").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wildberries chat API token is not configured in settings.",
        )

    if chat_id.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat ID cannot be empty.",
        )
    if not chat_id.startswith("1:"):
        chat_id = f"1:{chat_id.strip()}"
    chats = await fetch_wb_chats(token)
    for chat in chats:
        if chat.get("chatID") == chat_id.strip():
            return {
                "found": True,
                "clientName": chat.get("clientName") or "Buyer",
            }

    return {"found": False, "clientName": "chat not found"}


@router.get("/stats")
def get_spam_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    stats = crud.get_spam_stats(db, current_user.id)
    last_sent = crud.get_spam_sent_messages(db, current_user.id, limit=10)
    return {
        "stats": stats,
        "lastSentMessages": last_sent,
    }


@router.get("/rules", response_model=List[schemas.SpamRule])
def list_spam_rules(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_spam_rules(db, current_user.id)


@router.post("/rules", response_model=schemas.SpamRule)
async def create_spam_rule(
    rule: schemas.SpamRuleCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    token = (current_user.wb_chat_api_token or "").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wildberries chat API token must be configured before creating rules.",
        )

    # Resolve reply_sign from Wildberries if not provided by client
    if not rule.reply_sign:
        try:
            chats = await fetch_wb_chats(token)
            for chat in chats:
                if chat.get("chatID") == rule.chat_id.strip():
                    rule.reply_sign = chat.get("replySign")
                    if not rule.client_name:
                        rule.client_name = chat.get("clientName")
                    break
        except Exception as e:
            logger.error(f"Failed to fetch replySign during rule creation: {e}")

    if not rule.reply_sign:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve replySign for this Chat ID. Please check if the Chat ID exists on Wildberries.",
        )

    return crud.create_spam_rule(db, current_user.id, rule)


@router.put("/rules/{rule_id}", response_model=schemas.SpamRule)
async def update_spam_rule(
    rule_id: int,
    rule_in: schemas.SpamRuleUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    token = (current_user.wb_chat_api_token or "").strip()

    # If chat_id is changing, resolve the new reply_sign
    if rule_in.chat_id is not None:
        if not rule_in.reply_sign:
            try:
                chats = await fetch_wb_chats(token)
                for chat in chats:
                    if chat.get("chatID") == rule_in.chat_id.strip():
                        rule_in.reply_sign = chat.get("replySign")
                        if not rule_in.client_name:
                            rule_in.client_name = chat.get("clientName")
                        break
            except Exception as e:
                logger.error(f"Failed to fetch replySign during rule update: {e}")

        if not rule_in.reply_sign:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve replySign for the new Chat ID. Please check if the Chat ID exists on Wildberries.",
            )

    db_rule = crud.update_spam_rule(db, rule_id, current_user.id, rule_in)
    if not db_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Spam rule not found."
        )
    return db_rule


@router.delete("/rules/{rule_id}")
def delete_spam_rule(
    rule_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    success = crud.delete_spam_rule(db, rule_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Spam rule not found."
        )
    return {"ok": True}


@router.get("/templates", response_model=List[schemas.SpamMessageTemplate])
def list_spam_templates(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_spam_templates(db, current_user.id)


@router.post("/templates", response_model=schemas.SpamMessageTemplate)
def create_spam_template(
    template: schemas.SpamMessageTemplateCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.create_spam_template(db, current_user.id, template)


@router.put("/templates/{template_id}", response_model=schemas.SpamMessageTemplate)
def update_spam_template(
    template_id: int,
    template_in: schemas.SpamMessageTemplateUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_template = crud.update_spam_template(
        db, template_id, current_user.id, template_in
    )
    if not db_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Template not found."
        )
    return db_template


@router.delete("/templates/{template_id}")
def delete_spam_template(
    template_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    success = crud.delete_spam_template(db, template_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Template not found."
        )
    return {"ok": True}


@router.post("/settings", response_model=schemas.UserPublic)
def update_spam_settings(
    settings_in: schemas.SpamSettingsUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    if settings_in.wb_chat_api_token is not None:
        current_user.wb_chat_api_token = settings_in.wb_chat_api_token
    if settings_in.notify_answers_in_chats is not None:
        current_user.notify_answers_in_chats = settings_in.notify_answers_in_chats
    if settings_in.notify_all_messages is not None:
        current_user.notify_all_messages = settings_in.notify_all_messages

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/sent-messages", response_model=List[schemas.SpamSentMessage])
def list_sent_messages(
    rule_id: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    if rule_id:
        # Check rule ownership
        rule = crud.get_spam_rule(db, rule_id, current_user.id)
        if not rule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Spam rule not found."
            )
        return (
            db.query(models.SpamSentMessage)
            .filter(models.SpamSentMessage.rule_id == rule_id)
            .order_by(models.SpamSentMessage.sent_at.desc())
            .all()
        )
    return crud.get_spam_sent_messages(db, current_user.id)
