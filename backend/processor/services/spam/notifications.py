from sqlalchemy.orm import Session
from services.notifications import send_custom_notification


class SpamNotificationService:
    @staticmethod
    def extract_media_line(message: dict | None) -> str:
        if not message:
            return ""
        attachments = message.get("attachments") or {}
        photo_icons = ["🖼️"] * len(attachments.get("images") or [])

        for f in attachments.get("files") or []:
            ctype = str(f.get("contentType") or "").lower()
            if "video" in ctype:
                photo_icons.append("🎥")
            elif "image" in ctype:
                photo_icons.append("🖼️")

        return " ".join(photo_icons) if photo_icons else ""

    @classmethod
    async def send_chat_message_notification(
        cls,
        db: Session,
        user_id: int,
        client_name: str,
        message: dict,
        *,
        stopped: bool = False,
    ):
        msg_text = message.get("text") or "без текста"
        media_line = cls.extract_media_line(message)

        title = "💬 <b>НОВОЕ СООБЩЕНИЕ В ЧАТЕ</b>"
        body = [title, f"👤 Покупатель: {client_name}"]
        if media_line:
            body.append(media_line)
        body.extend(["", f"<i>{msg_text}</i>"])

        subject = "Новое сообщение в чате"
        if stopped:
            body.extend(["", "❗️ Рассылка остановлена."])
            subject = "Сообщение в чате | Рассылка остановлена"

        await send_custom_notification(db, user_id, "\n".join(body), subject=subject)
