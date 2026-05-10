import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/telegram", tags=["Telegram"])

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID", "@rojgarschool")


class TelegramSendRequest(BaseModel):
    caption: str
    pdf_url: Optional[str] = None


@router.post("/send")
async def send_to_telegram(req: TelegramSendRequest):
    if not BOT_TOKEN:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN not set in Railway environment variables")

    if not CHANNEL_ID:
        raise HTTPException(status_code=500, detail="TELEGRAM_CHANNEL_ID not set")

    base_url = f"https://api.telegram.org/bot{BOT_TOKEN}"

    async with httpx.AsyncClient(timeout=20) as client:
        # Try sending with PDF document first
        if req.pdf_url and req.pdf_url.endswith(".pdf"):
            try:
                res = await client.post(f"{base_url}/sendDocument", json={
                    "chat_id": CHANNEL_ID,
                    "document": req.pdf_url,
                    "caption": req.caption,
                    "parse_mode": "Markdown",
                })
                if res.status_code == 200:
                    return {"ok": True, "method": "document", "result": res.json()}
            except Exception:
                pass  # Fall through to text message

        # Send as text message
        res = await client.post(f"{base_url}/sendMessage", json={
            "chat_id": CHANNEL_ID,
            "text": req.caption,
            "parse_mode": "Markdown",
            "disable_web_page_preview": False,
        })

        data = res.json()
        if not data.get("ok"):
            raise HTTPException(
                status_code=400,
                detail=f"Telegram error: {data.get('description', 'Unknown error')}"
            )

        return {"ok": True, "method": "message", "message_id": data["result"]["message_id"]}


@router.get("/test")
async def test_telegram():
    """Test if Telegram bot is configured correctly."""
    if not BOT_TOKEN:
        return {"ok": False, "error": "TELEGRAM_BOT_TOKEN not set in Railway variables"}

    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(f"https://api.telegram.org/bot{BOT_TOKEN}/getMe")
        data = res.json()
        if data.get("ok"):
            return {"ok": True, "bot": data["result"]["username"], "channel": CHANNEL_ID}
        return {"ok": False, "error": data.get("description")}
