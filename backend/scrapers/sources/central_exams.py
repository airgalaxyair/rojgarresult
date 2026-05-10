"""
Central Exam Body Scrapers — SSC, UPSC, IBPS, RRB, RBI, NTA
Strict filters to avoid junk titles.
"""
from scrapers.base import BaseScraper, classify_post_type, extract_vacancies
import re


def is_valid_title(title: str) -> bool:
    """Strict check — must be a real job/result notification."""
    t = title.strip()
    # Too short or too long
    if len(t) < 20 or len(t) > 300:
        return False
    # Contains mostly Hindi/non-ASCII (scraper can't process these well)
    non_ascii = sum(1 for c in t if ord(c) > 127)
    if non_ascii > len(t) * 0.3:
        return False
    # Must contain at least one job-related keyword
    keywords = [
        "recruitment", "vacancy", "vacancies", "post", "notification",
        "result", "admit card", "answer key", "syllabus", "advertisement",
        "apply", "application", "examination", "selection", "merit",
        "interview", "cutoff", "cut-off", "marks", "score"
    ]
    t_lower = t.lower()
    if not any(k in t_lower for k in keywords):
        return False
    # Reject navigation/junk titles
    junk = [
        "home", "contact", "about us", "login", "register", "click here",
        "read more", "view more", "download", "calendar", "schedule",
        "railway colony", "ministry of", "मंत्रालय", "भर्ती बोर्ड",
        "near railway", "office", "helpdesk", "faq", "disclaimer",
        "privacy policy", "terms", "sitemap", "search", "menu"
    ]
    if any(j in t_lower for j in junk):
        return False
    return True


class SSCScraper(BaseScraper):
    name = "SSC"
    dept_slug = "ssc"
    base_url = "https://ssc.nic.in"
    source_site_id = 1

    async def scrape(self):
        items = []
        seen = set()
        for url in ["https://ssc.nic.in/Portal/LatestNews", "https://ssc.nic.in"]:
            html = await self.fetch(url)
            if html:
                break
        if not html:
            return items

        soup = self.soup(html)
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if not is_valid_title(title) or title in seen:
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "pdf_urls": [href] if href and href.lower().endswith(".pdf") else [],
                "total_vacancies": extract_vacancies(title),
                "description": f"Official notification from Staff Selection Commission (SSC). Visit ssc.nic.in for complete details and application link.",
            })
        return items[:20]


class UPSCScraper(BaseScraper):
    name = "UPSC"
    dept_slug = "upsc"
    base_url = "https://upsc.gov.in"
    source_site_id = 2

    async def scrape(self):
        items = []
        seen = set()
        for url in ["https://upsc.gov.in/notifications", "https://upsc.gov.in"]:
            html = await self.fetch(url)
            if html:
                break
        if not html:
            return items

        soup = self.soup(html)
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if not is_valid_title(title) or title in seen:
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = "https://upsc.gov.in" + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "pdf_urls": [href] if href and href.lower().endswith(".pdf") else [],
                "total_vacancies": extract_vacancies(title),
                "description": "Official notification from Union Public Service Commission (UPSC). Visit upsc.gov.in for eligibility and application details.",
            })
        return items[:20]


class IBPSScraper(BaseScraper):
    name = "IBPS"
    dept_slug = "ibps"
    base_url = "https://www.ibps.in"
    source_site_id = 3

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://www.ibps.in")
        if not html:
            return items

        soup = self.soup(html)
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if not is_valid_title(title) or title in seen:
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 1,
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Institute of Banking Personnel Selection (IBPS). Visit ibps.in for complete details.",
            })
        return items[:20]


class RRBScraper(BaseScraper):
    name = "RRB"
    dept_slug = "rrb"
    base_url = "https://www.rrbcdg.gov.in"
    source_site_id = 4

    # Only scrape the notifications page — not the full site
    NOTIFICATION_URL = "https://www.rrbcdg.gov.in/Notifications.aspx"

    async def scrape(self):
        items = []
        seen = set()
        for url in [self.NOTIFICATION_URL, "https://www.rrbald.gov.in/Notifications.aspx"]:
            html = await self.fetch(url)
            if not html:
                continue
            soup = self.soup(html)
            for a in soup.select("a[href]"):
                title = a.get_text(strip=True)
                if not is_valid_title(title) or title in seen:
                    continue
                # Extra strict for RRB — must have year
                if not re.search(r"20\d\d", title):
                    continue
                seen.add(title)
                href = a.get("href", "")
                if href and not href.startswith("http"):
                    href = "https://www.rrbcdg.gov.in/" + href.lstrip("/")
                items.append({
                    "title": title,
                    "post_type": classify_post_type(title),
                    "source_url": href or self.NOTIFICATION_URL,
                    "category_id": 3,
                    "total_vacancies": extract_vacancies(title),
                    "description": "Official railway recruitment notification from Railway Recruitment Board (RRB). Check eligibility and apply at indianrailways.gov.in.",
                })
        return items[:15]


class RBIScraper(BaseScraper):
    name = "RBI"
    dept_slug = "rbi"
    base_url = "https://www.rbi.org.in"
    source_site_id = 5

    async def scrape(self):
        items = []
        seen = set()
        html = await self.fetch("https://www.rbi.org.in/Scripts/Recruitments.aspx")
        if not html:
            html = await self.fetch("https://www.rbi.org.in")
        if not html:
            return items

        soup = self.soup(html)
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if not is_valid_title(title) or title in seen:
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 1,
                "description": "Official recruitment notification from Reserve Bank of India (RBI).",
            })
        return items[:15]


class NTAScraper(BaseScraper):
    name = "NTA"
    dept_slug = "nta"
    base_url = "https://nta.ac.in"
    source_site_id = 6

    async def scrape(self):
        items = []
        seen = set()
        for url in ["https://nta.ac.in/AnnounNTA", "https://nta.ac.in"]:
            html = await self.fetch(url)
            if html:
                break
        if not html:
            return items

        soup = self.soup(html)
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if not is_valid_title(title) or title in seen:
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "description": "Official notification from National Testing Agency (NTA).",
            })
        return items[:15]
