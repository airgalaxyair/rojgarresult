"""
Central Exam Body Scrapers
SSC, UPSC, IBPS, RRB, RBI, NTA
"""
from scrapers.base import BaseScraper, classify_post_type, extract_vacancies, extract_last_date, parse_date
import re


class SSCScraper(BaseScraper):
    name = "SSC"
    dept_slug = "ssc"
    base_url = "https://ssc.nic.in"
    source_site_id = 1

    async def scrape(self):
        items = []
        html = await self.fetch("https://ssc.nic.in/Portal/LatestNews")
        if not html:
            html = await self.fetch("https://ssc.nic.in")
        if not html:
            return items
        soup = self.soup(html)
        links = soup.select("a[href]")
        seen = set()
        for a in links:
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "result", "admit", "answer", "syllabus", "vacancy", "notification", "examination", "post", "cgl", "chsl", "mts", "cpo", "je", "selection"]):
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
                "application_end": extract_last_date(title),
                "description": f"Official notification from Staff Selection Commission (SSC). Visit ssc.nic.in for complete details.",
            })
        return items[:25]


class UPSCScraper(BaseScraper):
    name = "UPSC"
    dept_slug = "upsc"
    base_url = "https://upsc.gov.in"
    source_site_id = 2

    async def scrape(self):
        items = []
        for url in ["https://upsc.gov.in/notifications", "https://upsc.gov.in"]:
            html = await self.fetch(url)
            if html:
                break
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "result", "admit", "answer", "exam", "civil", "ias", "ips", "notification", "vacancy", "interview", "selection"]):
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
                "description": "Official notification from Union Public Service Commission (UPSC). Visit upsc.gov.in for details.",
            })
        return items[:20]


class IBPSScraper(BaseScraper):
    name = "IBPS"
    dept_slug = "ibps"
    base_url = "https://www.ibps.in"
    source_site_id = 3

    async def scrape(self):
        items = []
        html = await self.fetch("https://www.ibps.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["po", "clerk", "so", "rrb", "result", "admit", "answer", "recruitment", "notification", "vacancy", "officer", "ibps"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 1,  # Banking
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Institute of Banking Personnel Selection (IBPS).",
            })
        return items[:20]


class RRBScraper(BaseScraper):
    name = "RRB"
    dept_slug = "rrb"
    base_url = "https://www.rrbcdg.gov.in"
    source_site_id = 4

    RRB_SITES = [
        "https://www.rrbcdg.gov.in",
        "https://rrbmumbai.gov.in",
        "https://rrbald.gov.in",
        "https://rrbahmedabad.gov.in",
        "https://rrbbhopal.gov.in",
    ]

    async def scrape(self):
        items = []
        seen = set()
        for site in self.RRB_SITES[:2]:  # Limit to 2 to avoid rate limiting
            html = await self.fetch(site)
            if not html:
                continue
            soup = self.soup(html)
            for a in soup.select("a[href]"):
                title = a.get_text(strip=True)
                if len(title) < 15 or title in seen:
                    continue
                if not any(k in title.lower() for k in ["recruitment", "result", "admit", "answer", "ntpc", "group d", "rrb", "railway", "alp", "je", "notification", "vacancy"]):
                    continue
                seen.add(title)
                href = a.get("href", "")
                if href and not href.startswith("http"):
                    href = site + href
                items.append({
                    "title": title,
                    "post_type": classify_post_type(title),
                    "source_url": href or site,
                    "category_id": 3,  # Railways
                    "total_vacancies": extract_vacancies(title),
                    "description": "Official railway recruitment notification from Railway Recruitment Board (RRB).",
                })
        return items[:25]


class RBIScraper(BaseScraper):
    name = "RBI"
    dept_slug = "rbi"
    base_url = "https://www.rbi.org.in"
    source_site_id = 5

    async def scrape(self):
        items = []
        html = await self.fetch("https://www.rbi.org.in/Scripts/NotificationsView.aspx")
        if not html:
            html = await self.fetch("https://www.rbi.org.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 15 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "officer", "grade", "result", "admit", "notification", "assistant", "manager"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 1,  # Banking
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
        html = await self.fetch("https://nta.ac.in/AnnounNTA")
        if not html:
            html = await self.fetch("https://nta.ac.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 10 or title in seen:
                continue
            if not any(k in title.lower() for k in ["neet", "jee", "cuet", "net", "result", "admit", "notification", "exam", "schedule", "answer"]):
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
