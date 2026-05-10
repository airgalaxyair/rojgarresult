import hashlib
import asyncio
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional
import httpx
from bs4 import BeautifulSoup
from core.config import settings

logger = logging.getLogger(__name__)


class ScrapedItem:
    """Represents a single scraped notification."""
    def __init__(
        self,
        title: str,
        source_url: str,
        post_type: str = "job",
        department_name: str = "",
        total_vacancies: Optional[int] = None,
        application_start: Optional[str] = None,
        application_end: Optional[str] = None,
        exam_date: Optional[str] = None,
        description: str = "",
        pdf_urls: Optional[list] = None,
        important_dates: Optional[list] = None,
        eligibility: Optional[list] = None,
        salary_text: Optional[str] = None,
        raw_data: Optional[dict] = None,
    ):
        self.title = title.strip()
        self.source_url = source_url
        self.post_type = post_type
        self.department_name = department_name
        self.total_vacancies = total_vacancies
        self.application_start = application_start
        self.application_end = application_end
        self.exam_date = exam_date
        self.description = description
        self.pdf_urls = pdf_urls or []
        self.important_dates = important_dates or []
        self.eligibility = eligibility or []
        self.salary_text = salary_text
        self.raw_data = raw_data or {}

    @property
    def dedup_hash(self) -> str:
        """Unique hash for deduplication — based on title + end date."""
        key = f"{self.title.lower().strip()}|{self.application_end or ''}|{self.source_url}"
        return hashlib.sha256(key.encode()).hexdigest()

    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "source_url": self.source_url,
            "post_type": self.post_type,
            "department_name": self.department_name,
            "total_vacancies": self.total_vacancies,
            "application_start": self.application_start,
            "application_end": self.application_end,
            "exam_date": self.exam_date,
            "description": self.description,
            "pdf_urls": self.pdf_urls,
            "important_dates": self.important_dates,
            "eligibility": self.eligibility,
            "salary_text": self.salary_text,
        }


class BaseScraper(ABC):
    """Base class for all source scrapers."""

    source_site_id: int
    source_name: str
    base_url: str
    scrape_urls: list[str] = []
    request_delay: float = settings.SCRAPER_REQUEST_DELAY
    max_retries: int = settings.SCRAPER_MAX_RETRIES

    def __init__(self):
        self.session = None
        self.logger = logging.getLogger(self.__class__.__name__)

    async def _get_html(self, url: str, attempt: int = 0) -> Optional[str]:
        """Fetch HTML with retry logic and rate limiting."""
        headers = {
            "User-Agent": settings.SCRAPER_USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-IN,en;q=0.9",
        }
        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                await asyncio.sleep(self.request_delay)
                return response.text
        except Exception as e:
            if attempt < self.max_retries:
                wait = 2 ** attempt  # exponential backoff
                self.logger.warning(f"Retry {attempt + 1} for {url} after {wait}s: {e}")
                await asyncio.sleep(wait)
                return await self._get_html(url, attempt + 1)
            self.logger.error(f"Failed to fetch {url} after {self.max_retries} retries: {e}")
            return None

    def _soup(self, html: str) -> BeautifulSoup:
        return BeautifulSoup(html, "html.parser")

    def _page_hash(self, html: str) -> str:
        return hashlib.sha256(html.encode()).hexdigest()

    @abstractmethod
    async def scrape(self) -> list[ScrapedItem]:
        """Scrape the source and return list of ScrapedItems."""
        pass

    async def run(self) -> dict:
        """Run the full scrape cycle. Returns stats."""
        stats = {
            "source": self.source_name,
            "started_at": datetime.utcnow().isoformat(),
            "found": 0,
            "new": 0,
            "errors": [],
        }
        try:
            items = await self.scrape()
            stats["found"] = len(items)
            await self._process_items(items, stats)
        except Exception as e:
            self.logger.error(f"Scraper {self.source_name} failed: {e}")
            stats["errors"].append(str(e))
        stats["completed_at"] = datetime.utcnow().isoformat()
        return stats

    async def _process_items(self, items: list[ScrapedItem], stats: dict):
        """Check for duplicates and store new items."""
        from db.database import AsyncSessionLocal
        from sqlalchemy import select
        from models.models import ScraperRawItem, Post

        async with AsyncSessionLocal() as db:
            for item in items:
                try:
                    # Check if already exists
                    existing = (
                        await db.execute(
                            select(ScraperRawItem).where(ScraperRawItem.raw_hash == item.dedup_hash)
                        )
                    ).scalar_one_or_none()

                    if existing:
                        continue  # Already processed

                    # Store raw item
                    raw = ScraperRawItem(
                        source_site_id=self.source_site_id,
                        raw_hash=item.dedup_hash,
                        raw_data=item.raw_data,
                        extracted_data=item.to_dict(),
                        status="pending",
                    )
                    db.add(raw)
                    await db.flush()

                    # Auto-create post draft (official sources only)
                    await self._create_post_draft(db, item)
                    stats["new"] += 1

                except Exception as e:
                    stats["errors"].append(f"{item.title}: {e}")

            await db.commit()

    async def _create_post_draft(self, db, item: ScrapedItem):
        """Convert scraped item to a Post draft ready for publishing."""
        import re
        from models.models import Post, PostType, PostStatus, SourceType, Department

        # Find or create department
        dept = (
            await db.execute(
                __import__("sqlalchemy", fromlist=["select"]).select(Department)
                .where(Department.name == item.department_name)
            )
        ).scalar_one_or_none()

        slug_base = re.sub(r"[^\w\s-]", "", item.title.lower())
        slug_base = re.sub(r"[\s_-]+", "-", slug_base).strip("-")[:200]

        # Auto-generate SEO title
        seo_title = f"{item.title} — Apply Online, Notification PDF"
        if len(seo_title) > 80:
            seo_title = item.title[:77] + "..."

        # Auto-generate SEO description
        seo_desc = f"{item.title}. "
        if item.total_vacancies:
            seo_desc += f"Total {item.total_vacancies} vacancies. "
        if item.application_end:
            seo_desc += f"Last date: {item.application_end}. "
        seo_desc += "Official notification and PDF download."
        seo_desc = seo_desc[:155]

        post = Post(
            slug=slug_base,
            title=item.title,
            post_type=item.post_type,
            status=PostStatus.published,  # official source → auto-publish
            source_type=SourceType.official,
            source_url=item.source_url,
            source_site_id=self.source_site_id,
            department_id=dept.id if dept else None,
            total_vacancies=item.total_vacancies,
            description=item.description,
            important_dates=item.important_dates,
            eligibility=item.eligibility,
            salary_range={"text": item.salary_text} if item.salary_text else None,
            pdf_urls=item.pdf_urls,
            seo_title=seo_title,
            seo_description=seo_desc,
            published_at=datetime.utcnow(),
        )

        # Parse dates
        if item.application_start:
            post.application_start = _parse_date(item.application_start)
        if item.application_end:
            post.application_end = _parse_date(item.application_end)
        if item.exam_date:
            post.exam_date = _parse_date(item.exam_date)

        db.add(post)


def _parse_date(date_str: str) -> Optional[datetime]:
    """Try parsing common Indian date formats."""
    formats = [
        "%d-%m-%Y", "%d/%m/%Y", "%d %b %Y", "%d %B %Y",
        "%Y-%m-%d", "%d.%m.%Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None
