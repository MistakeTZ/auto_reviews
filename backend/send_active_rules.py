import asyncio
from datetime import datetime, timezone
import logging
import os
import random
import sys
import httpx

# Ensure we can import modules from backend/
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models
import crud

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("send_active_rules")

async def send_message_for_rule(db, rule, now_utc):
    user = db.query(models.User).filter(models.User.id == rule.user_id).first()
    if not user or not user.wb_chat_api_token:
        logger.error("Skipping rule %s: user token is not configured.", rule.id)
        return False

    token = user.wb_chat_api_token.strip()
    headers = {"Authorization": token}

    # Fetch templates
    templates = rule.templates
    if not templates:
        logger.warning("Skipping rule %s: no templates found.", rule.id)
        return False

    selected_template = random.choice(templates)
    client_name = rule.client_name or "Покупатель"
    rendered_text = selected_template.text.replace("[name]", client_name)

    reply_sign = rule.reply_sign
    if not reply_sign:
        # Fallback: fetch from chats list
        chats_url = "https://buyer-chat-api.wildberries.ru/api/v1/seller/chats"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(chats_url, headers=headers)
                if res.status_code == 200:
                    chats = res.json().get("result") or []
                    for chat in chats:
                        if chat.get("chatID") == rule.chat_id:
                            reply_sign = chat.get("replySign")
                            rule.reply_sign = reply_sign
                            db.add(rule)
                            db.commit()
                            break
        except Exception as e:
            logger.error("Failed to fetch chats for fallback replySign: %s", e)

    if not reply_sign:
        logger.error("Skipping rule %s: replySign is not found and cannot be resolved.", rule.id)
        return False

    send_url = "https://buyer-chat-api.wildberries.ru/api/v1/seller/message"
    payload = {"replySign": reply_sign, "message": rendered_text}

    logger.info("Sending message for rule %s (chat %s)...", rule.id, rule.chat_id)
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(send_url, headers=headers, json=payload)
            if res.status_code == 200:
                res_data = res.json()
                result = res_data.get("result") or {}
                add_time = result.get("addTime")

                if add_time:
                    crud.log_spam_sent_message(
                        db, rule.id, rendered_text, rule.chat_id, add_time
                    )
                    rule.last_sent_at = datetime.now(timezone.utc)
                    rule.last_sent_message_timestamp = add_time
                    db.add(rule)
                    db.commit()
                    logger.info("Successfully sent message for rule %s.", rule.id)
                    return True
            else:
                logger.error("Failed to send message for rule %s: %s", rule.id, res.text)
    except Exception as e:
        logger.error("Error sending message for rule %s: %s", rule.id, e)

    return False

async def main():
    db = SessionLocal()
    # Prevent attributes from expiring on commits
    db.expire_on_commit = False
    try:
        active_rules = (
            db.query(models.SpamRule)
            .filter(models.SpamRule.is_active == True)
            .all()
        )
        if not active_rules:
            logger.info("No active rules found in the database.")
            return

        logger.info("Found %s active rules. Starting dispatch...", len(active_rules))
        now_utc = datetime.now(timezone.utc)

        success_count = 0
        for rule in active_rules:
            success = await send_message_for_rule(db, rule, now_utc)
            if success:
                success_count += 1

        logger.info("Dispatch finished. Successfully sent messages for %s/%s rules.", success_count, len(active_rules))
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
