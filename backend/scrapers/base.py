"""
Base scraper — handles fetching, dedup, Supabase insert, Telegram alert.
"""
import hashlib
import asyncio
import logging
import re
import os
from datetime import datetime
from typing import Optional
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://urfzljcwduycxywyzlnt.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnpsamN3ZHV5Y3h5d3l6bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTgyOTksImV4cCI6MjA5Mzk3NDI5OX0.63njN4bw_MAWQgobNUawXdqZeCr9_Q_egsRPCPCtn7g")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID", "@rojgarschool")

SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

FETCH_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9",
}


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")[:180]


def classify_post_type(title: str) -> str:
    t = title.lower()
    if any(k in t for k in ["result", "final result", "merit list", "marks", "cutoff", "cut-off", "selected candidates"]):
        return "result"
    if any(k in t for k in ["admit card", "call letter", "hall ticket", "e-admit", "admit-card"]):
        return "admit_card"
    if any(k in t for k in ["answer key", "answer sheet", "provisional answer", "response sheet"]):
        return "answer_key"
    if any(k in t for k in ["syllabus", "exam pattern", "curriculum"]):
        return "syllabus"
    if any(k in t for k in ["admission", "prospectus", "entrance test"]):
        return "admission"
    return "job"


def extract_vacancies(text: str) -> Optional[int]:
    patterns = [
        r"(\d[\d,]+)\s*(?:posts?|vacancies|seats?|positions?)",
        r"(?:posts?|vacancies)\s*[:\-–]\s*(\d[\d,]+)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            try:
                return int(m.group(1).replace(",", ""))
            except ValueError:
                pass
    return None


def extract_last_date(text: str) -> Optional[str]:
    patterns = [
        r"last\s*date[:\s]+([^\n,;]+)",
        r"closing\s*date[:\s]+([^\n,;]+)",
        r"apply\s*(?:on\s*or\s*)?before[:\s]+([^\n,;]+)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            d = _parse_date(m.group(1))
            if d:
                return d
    return None


def _parse_date(s: str) -> Optional[str]:
    s = s.strip()
    formats = [
        ("%d-%m-%Y", r"\d{2}-\d{2}-\d{4}"),
        ("%d/%m/%Y", r"\d{2}/\d{2}/\d{4}"),
        ("%d.%m.%Y", r"\d{2}\.\d{2}\.\d{4}"),
        ("%d %b %Y", r"\d{1,2} \w{3} \d{4}"),
        ("%d %B %Y", r"\d{1,2} \w+ \d{4}"),
        ("%Y-%m-%d", r"\d{4}-\d{2}-\d{2}"),
    ]
    for fmt, pattern in formats:
        m = re.search(pattern, s)
        if m:
            try:
                return datetime.strptime(m.group(), fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue
    return None


class BaseScraper:
    name: str = "Base"
    dept_slug: str = ""
    base_url: str = ""
    source_site_id: int = 1
    request_delay: float = 2.0
    max_retries: int = 3
    # Override in subclass: "published" or "pending_approval"
    post_status: str = "published"
    # Override in subclass: "official" or "third_party"
    source_type: str = "official"

    async def fetch(self, url: str, attempt: int = 0) -> Optional[str]:
        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True, headers=FETCH_HEADERS) as c:
                r = await c.get(url)
                r.raise_for_status()
                await asyncio.sleep(self.request_delay)
                return r.text
        except Exception as e:
            if attempt < self.max_retries:
                wait = 2 ** attempt
                logger.warning(f"{self.name}: retry {attempt+1} — {e}")
                await asyncio.sleep(wait)
                return await self.fetch(url, attempt + 1)
            logger.error(f"{self.name}: failed {url} — {e}")
            return None

    def soup(self, html: str) -> BeautifulSoup:
        return BeautifulSoup(html, "html.parser")

    def dedup_hash(self, title: str, source_url: str) -> str:
        key = f"{title.lower().strip()}|{self.dept_slug}|{source_url}"
        return hashlib.sha256(key.encode()).hexdigest()

    async def scrape(self) -> list[dict]:
        return []

    async def get_dept_id(self) -> Optional[int]:
        try:
            async with httpx.AsyncClient(timeout=10) as c:
                r = await c.get(
                    f"{SUPABASE_URL}/rest/v1/departments?slug=eq.{self.dept_slug}&select=id&limit=1",
                    headers=SB_HEADERS
                )
                data = r.json()
                return data[0]["id"] if data else None
        except Exception:
            return None

    async def save_to_supabase(self, post: dict) -> Optional[dict]:
        try:
            async with httpx.AsyncClient(timeout=15) as c:
                # Dedup check
                check = await c.get(
                    f"{SUPABASE_URL}/rest/v1/scraper_raw_items?raw_hash=eq.{post['_hash']}&select=id&limit=1",
                    headers=SB_HEADERS
                )
                if check.json():
                    return None

                # Save hash
                await c.post(
                    f"{SUPABASE_URL}/rest/v1/scraper_raw_items",
                    json={
                        "source_site_id": self.source_site_id,
                        "raw_hash": post["_hash"],
                        "raw_data": {"title": post.get("title"), "url": post.get("source_url")},
                        "status": "processed"
                    },
                    headers=SB_HEADERS
                )

                slug = slugify(post["title"]) + "-" + post["_hash"][:5]
                desc = post.get("description") or f"Official notification from {self.name}."
                seo_title = f"{post['title']} — Apply Online"[:80]

                # Use post's own status or scraper default
                status = post.get("_status", self.post_status)
                src_type = post.get("source_type", self.source_type)

                payload = {
                    "slug": slug,
                    "title": post["title"],
                    "post_type": post.get("post_type", "job"),
                    "status": status,
                    "source_type": src_type,
                    "source_url": post.get("source_url"),
                    "department_id": post.get("dept_id"),
                    "category_id": post.get("category_id"),
                    "description": desc,
                    "seo_title": seo_title,
                    "seo_description": desc[:155],
                    "is_featured": False,
                    "is_trending": False,
                    "published_at": datetime.utcnow().isoformat() if status == "published" else None,
                }

                if post.get("total_vacancies"):
                    payload["total_vacancies"] = post["total_vacancies"]
                if post.get("application_end"):
                    payload["application_end"] = post["application_end"] + "T00:00:00"
                if post.get("application_start"):
                    payload["application_start"] = post["application_start"] + "T00:00:00"
                if post.get("exam_date"):
                    payload["exam_date"] = post["exam_date"] + "T00:00:00"
                if post.get("pdf_urls"):
                    payload["pdf_urls"] = post["pdf_urls"]
                if post.get("salary_text"):
                    payload["salary_range"] = {"text": post["salary_text"]}

                r2 = await c.post(
                    f"{SUPABASE_URL}/rest/v1/posts",
                    json=payload,
                    headers=SB_HEADERS
                )
                if r2.status_code in (200, 201) and r2.json():
                    return r2.json()[0]
                else:
                    logger.error(f"{self.name}: insert failed — {r2.text[:200]}")
                    return None
        except Exception as e:
            logger.error(f"{self.name}: save error — {e}")
            return None

    async def send_telegram(self, post: dict):
        if not TELEGRAM_BOT_TOKEN or self.post_status == "pending_approval":
            return
        emoji = {"job":"💼","result":"📊","admit_card":"🎫","answer_key":"🔑","syllabus":"📚","admission":"🎓"}.get(post.get("post_type","job"),"🔔")
        slug = slugify(post["title"]) + "-" + post["_hash"][:5]
        caption = f"{emoji} *{post['title']}*\n\n"
        if post.get("total_vacancies"):
            caption += f"📋 *Posts:* {post['total_vacancies']:,}\n"
        if post.get("application_end"):
            caption += f"⏰ *Last Date:* {post['application_end']}\n"
        caption += f"\n🌐 [Full Details](https://rojgarresult.vercel.app/jobs/{slug})"
        if post.get("source_url"):
            caption += f"\n📎 [Official Site]({post['source_url']})"
        caption += f"\n\n#RojgarSchool #GovtJobs #{self.name.replace(' ','')}"
        try:
            async with httpx.AsyncClient(timeout=15) as c:
                await c.post(
                    f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                    json={"chat_id": TELEGRAM_CHANNEL_ID, "text": caption, "parse_mode": "Markdown"}
                )
        except Exception as e:
            logger.warning(f"Telegram failed: {e}")

    async def run(self) -> dict:
        stats = {"scraper": self.name, "found": 0, "new": 0, "errors": []}
        logger.info(f"Starting: {self.name}")
        try:
            dept_id = await self.get_dept_id()
            items = await self.scrape()
            stats["found"] = len(items)
            for item in items:
                item["dept_id"] = dept_id
                item["_hash"] = self.dedup_hash(item["title"], item.get("source_url", ""))
                try:
                    saved = await self.save_to_supabase(item)
                    if saved:
                        stats["new"] += 1
                        await self.send_telegram(item)
                        await asyncio.sleep(1)
                except Exception as e:
                    stats["errors"].append(str(e))
        except Exception as e:
            logger.error(f"{self.name} crashed: {e}")
            stats["errors"].append(str(e))
        logger.info(f"{self.name}: found={stats['found']}, new={stats['new']}")
        return stats
