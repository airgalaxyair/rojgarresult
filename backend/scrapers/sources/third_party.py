"""
Third-Party Job Portal Scrapers
All posts saved as 'pending_approval' — must be reviewed by admin before publishing.

Portals covered:
- SarkariResult.com
- FreeJobAlert.com
- IndGovtJobs.in
- SarkariJob.net
- LinkingSky.com
- MySarkariNaukri.com
- SarkariJobFind.com
- SarkariRojgar.com.in
- GovtJobsPortal.in
- Adda247.com Jobs
- EmploymentNews.gov.in (Official — auto-publish)
"""
from scrapers.base import BaseScraper, classify_post_type, extract_vacancies, extract_last_date
import re


class ThirdPartyBaseScraper(BaseScraper):
    """All third-party scrapers save as pending_approval."""
    source_type = "third_party"

    async def save_to_supabase(self, post: dict):
        # Override status to pending_approval for all third-party sources
        post["_status"] = "pending_approval"
        return await super().save_to_supabase(post)

    async def send_telegram(self, post: dict):
        # Never send Telegram for third-party — only after admin approval
        pass


# Patch base save_to_supabase to support _status override
import scrapers.base as _base
_orig_save = _base.BaseScraper.save_to_supabase

async def _patched_save(self, post: dict):
    import httpx
    from scrapers.base import SUPABASE_URL, SB_HEADERS
    from datetime import datetime
    from scrapers.base import slugify

    check = await httpx.AsyncClient(timeout=15).__aenter__()
    try:
        r = await check.get(
            f"{SUPABASE_URL}/rest/v1/scraper_raw_items?raw_hash=eq.{post['_hash']}&select=id&limit=1",
            headers=SB_HEADERS
        )
        if r.json():
            return None

        await check.post(
            f"{SUPABASE_URL}/rest/v1/scraper_raw_items",
            json={
                "source_site_id": getattr(self, 'source_site_id', 99),
                "raw_hash": post["_hash"],
                "raw_data": {"title": post.get("title"), "url": post.get("source_url")},
                "status": "processed"
            },
            headers=SB_HEADERS
        )

        slug = slugify(post["title"]) + "-" + post["_hash"][:5]
        seo_title = f"{post['title']} — Official Notification"[:80]
        desc = post.get("description") or f"Notification from {getattr(self, 'name', 'Unknown')}. Visit the official source for complete details."

        status = post.get("_status", "published")

        payload = {
            "slug": slug,
            "title": post["title"],
            "post_type": post.get("post_type", "job"),
            "status": status,
            "source_type": post.get("source_type", "official"),
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
        if post.get("important_dates"):
            payload["important_dates"] = post["important_dates"]
        if post.get("salary_text"):
            payload["salary_range"] = {"text": post["salary_text"]}

        r2 = await check.post(
            f"{SUPABASE_URL}/rest/v1/posts",
            json=payload,
            headers=SB_HEADERS
        )
        if r2.status_code in (200, 201):
            return r2.json()[0] if r2.json() else {}
        return None
    finally:
        await check.aclose()

_base.BaseScraper.save_to_supabase = _patched_save


# ── SarkariResult.com ─────────────────────────────────────────────────────────

class SarkariResultScraper(ThirdPartyBaseScraper):
    name = "SarkariResult"
    dept_slug = "ssc"  # fallback
    base_url = "https://www.sarkariresult.com"
    source_site_id = 50

    SECTIONS = [
        ("https://www.sarkariresult.com/latestjob/", "job"),
        ("https://www.sarkariresult.com/result/",    "result"),
        ("https://www.sarkariresult.com/admitcard/", "admit_card"),
        ("https://www.sarkariresult.com/answerkey/", "answer_key"),
    ]

    async def scrape(self):
        items = []
        seen = set()
        for url, post_type in self.SECTIONS:
            html = await self.fetch(url)
            if not html:
                continue
            soup = self.soup(html)
            # SarkariResult uses <td> rows with links
            for a in soup.select("td a[href], .tablesorter a[href], table a[href]"):
                title = a.get_text(strip=True)
                if len(title) < 15 or title in seen:
                    continue
                if any(k in title.lower() for k in ["home", "contact", "about", "more", "view"]):
                    continue
                seen.add(title)
                href = a.get("href", "")
                if not href.startswith("http"):
                    href = self.base_url + href
                items.append({
                    "title": title,
                    "post_type": post_type,
                    "source_url": href,
                    "source_type": "third_party",
                    "_status": "pending_approval",
                    "total_vacancies": extract_vacancies(title),
                    "description": f"Notification posted on SarkariResult.com. Verify details at the official department website before applying.",
                })
        return items[:40]


# ── FreeJobAlert.com ──────────────────────────────────────────────────────────

class FreeJobAlertScraper(ThirdPartyBaseScraper):
    name = "FreeJobAlert"
    dept_slug = "ssc"
    base_url = "https://www.freejobalert.com"
    source_site_id = 51

    async def scrape(self):
        items = []
        seen = set()
        for url in [
            "https://www.freejobalert.com/government-jobs/",
            "https://www.freejobalert.com/sarkari-result/",
            "https://www.freejobalert.com/admit-card/",
        ]:
            html = await self.fetch(url)
            if not html:
                continue
            soup = self.soup(html)
            for a in soup.select("h2 a, h3 a, .entry-title a, article a"):
                title = a.get_text(strip=True)
                if len(title) < 15 or title in seen:
                    continue
                seen.add(title)
                href = a.get("href", "")
                if not href.startswith("http"):
                    href = self.base_url + href
                items.append({
                    "title": title,
                    "post_type": classify_post_type(title),
                    "source_url": href,
                    "source_type": "third_party",
                    "_status": "pending_approval",
                    "total_vacancies": extract_vacancies(title),
                    "description": "Notification listed on FreeJobAlert.com. Always verify and apply through the official department website.",
                })
        return items[:30]


# ── IndGovtJobs.in ────────────────────────────────────────────────────────────

class IndGovtJobsScraper(ThirdPartyBaseScraper):
    name = "IndGovtJobs"
    dept_slug = "ssc"
    base_url = "https://www.indgovtjobs.in"
    source_site_id = 52

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://www.indgovtjobs.in")
        if not html:
            return items
        soup = self.soup(html)
        # Blogger-based — posts are in h3/h2 tags
        for a in soup.select("h3 a, h2 a, .post-title a"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in [
                "recruitment", "vacancy", "result", "admit", "answer", "notification",
                "apply", "post", "jobs", "exam", "selection"
            ]):
                continue
            seen.add(title)
            href = a.get("href", "")
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "source_type": "third_party",
                "_status": "pending_approval",
                "total_vacancies": extract_vacancies(title),
                "description": "Notification listed on IndGovtJobs.in. Verify details at the official department website.",
            })
        return items[:25]


# ── SarkariJob.net ────────────────────────────────────────────────────────────

class SarkariJobNetScraper(ThirdPartyBaseScraper):
    name = "SarkariJobNet"
    dept_slug = "ssc"
    base_url = "https://sarkarijob.net"
    source_site_id = 53

    SECTIONS = [
        "https://sarkarijob.net/notifications/",
        "https://sarkarijob.net/results/",
        "https://sarkarijob.net/admit-card/",
        "https://sarkarijob.net/all-govt-jobs/",
    ]

    async def scrape(self):
        items = []
        seen = set()
        for url in self.SECTIONS:
            html = await self.fetch(url)
            if not html:
                continue
            soup = self.soup(html)
            for a in soup.select("h2 a, h3 a, .entry-title a, article h2 a"):
                title = a.get_text(strip=True)
                if len(title) < 15 or title in seen:
                    continue
                seen.add(title)
                href = a.get("href", "")
                items.append({
                    "title": title,
                    "post_type": classify_post_type(title),
                    "source_url": href or url,
                    "source_type": "third_party",
                    "_status": "pending_approval",
                    "total_vacancies": extract_vacancies(title),
                    "description": "Notification listed on SarkariJob.net. Verify at official source before applying.",
                })
        return items[:30]


# ── LinkingSky.com ────────────────────────────────────────────────────────────

class LinkingSkyScraper(ThirdPartyBaseScraper):
    name = "LinkingSky"
    dept_slug = "ssc"
    base_url = "https://linkingsky.com"
    source_site_id = 54

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://linkingsky.com/govt-jobs/")
        if not html:
            html = await self.fetch("https://linkingsky.com")
        if not html:
            return items
        soup = self.soup(html)
        for a in soup.select("h2 a, h3 a, .post-title a, article a"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "result", "admit", "notification", "jobs"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "source_type": "third_party",
                "_status": "pending_approval",
                "total_vacancies": extract_vacancies(title),
                "description": "Notification listed on LinkingSky.com. Always verify at the official department website.",
            })
        return items[:20]


# ── MySarkariNaukri.com ───────────────────────────────────────────────────────

class MySarkariNaukriScraper(ThirdPartyBaseScraper):
    name = "MySarkariNaukri"
    dept_slug = "ssc"
    base_url = "https://www.mysarkarinaukri.com"
    source_site_id = 55

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://www.mysarkarinaukri.com")
        if not html:
            return items
        soup = self.soup(html)
        for a in soup.select("h2 a, h3 a, .job-title a, article a"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "result", "admit", "notification", "jobs", "exam"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "source_type": "third_party",
                "_status": "pending_approval",
                "total_vacancies": extract_vacancies(title),
                "description": "Notification listed on MySarkariNaukri.com. Verify at official source before applying.",
            })
        return items[:20]


# ── SarkariJobFind.com ────────────────────────────────────────────────────────

class SarkariJobFindScraper(ThirdPartyBaseScraper):
    name = "SarkariJobFind"
    dept_slug = "ssc"
    base_url = "https://sarkarijobfind.com"
    source_site_id = 56

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://sarkarijobfind.com")
        if not html:
            return items
        soup = self.soup(html)
        for a in soup.select("h2 a, h3 a, td a, .post-title a"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "result", "admit", "notification", "jobs", "exam", "online form"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "source_type": "third_party",
                "_status": "pending_approval",
                "total_vacancies": extract_vacancies(title),
                "description": "Notification listed on SarkariJobFind.com. Verify at official source before applying.",
            })
        return items[:25]


# ── SarkariRojgar.com.in ──────────────────────────────────────────────────────

class SarkariRojgarScraper(ThirdPartyBaseScraper):
    name = "SarkariRojgar"
    dept_slug = "ssc"
    base_url = "https://sarkarirojgar.com.in"
    source_site_id = 57

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://sarkarirojgar.com.in")
        if not html:
            return items
        soup = self.soup(html)
        for a in soup.select("h2 a, h3 a, .entry-title a, article a"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "result", "admit", "notification", "jobs"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "source_type": "third_party",
                "_status": "pending_approval",
                "total_vacancies": extract_vacancies(title),
                "description": "Notification listed on SarkariRojgar.com.in. Verify at official source.",
            })
        return items[:20]


# ── GovtJobsPortal.in ─────────────────────────────────────────────────────────

class GovtJobsPortalScraper(ThirdPartyBaseScraper):
    name = "GovtJobsPortal"
    dept_slug = "ssc"
    base_url = "https://www.govtjobsportal.in"
    source_site_id = 58

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://www.govtjobsportal.in")
        if not html:
            return items
        soup = self.soup(html)
        for a in soup.select("h2 a, h3 a, .post-title a, article a"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "result", "admit", "notification", "jobs"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "source_type": "third_party",
                "_status": "pending_approval",
                "total_vacancies": extract_vacancies(title),
                "description": "Notification listed on GovtJobsPortal.in. Verify at official source.",
            })
        return items[:20]


# ── Adda247 Jobs ──────────────────────────────────────────────────────────────

class Adda247Scraper(ThirdPartyBaseScraper):
    name = "Adda247"
    dept_slug = "ssc"
    base_url = "https://www.adda247.com"
    source_site_id = 59

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://www.adda247.com/jobs/")
        if not html:
            return items
        soup = self.soup(html)
        for a in soup.select("h2 a, h3 a, .job-card a, article a, .post-title a"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "result", "admit", "notification", "jobs", "exam"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "source_type": "third_party",
                "_status": "pending_approval",
                "total_vacancies": extract_vacancies(title),
                "description": "Notification listed on Adda247.com. Verify at official source before applying.",
            })
        return items[:20]


# ── EmploymentNews.gov.in (OFFICIAL — auto publish) ──────────────────────────

class EmploymentNewsScraper(BaseScraper):
    """Official Government of India weekly — auto-publish allowed."""
    name = "Employment News"
    dept_slug = "upsc"
    base_url = "https://www.employmentnews.gov.in"
    source_site_id = 60

    async def scrape(self):
        items = []
        seen = set()
        for url in [
            "https://www.employmentnews.gov.in/NewEmp/Home.aspx",
            "https://www.employmentnews.gov.in",
        ]:
            html = await self.fetch(url)
            if html:
                break
        if not html:
            return items
        soup = self.soup(html)
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "result", "admit", "notification", "jobs", "advertisement"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + "/" + href.lstrip("/")
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "total_vacancies": extract_vacancies(title),
                "description": "Official notification published in Employment News, Government of India weekly publication.",
            })
        return items[:20]
