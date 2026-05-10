"""
Banking Sector Scrapers
SBI, Bank of Baroda, PNB, Canara Bank, Union Bank, NABARD, SIDBI
"""
from scrapers.base import BaseScraper, classify_post_type, extract_vacancies, extract_last_date


class SBIScraper(BaseScraper):
    name = "SBI"
    dept_slug = "sbi"
    base_url = "https://bank.sbi"
    source_site_id = 7
    CAREERS_URL = "https://bank.sbi/web/careers/current-openings"

    async def scrape(self):
        items = []
        for url in [self.CAREERS_URL, "https://sbi.co.in/web/careers/current-openings", "https://bank.sbi"]:
            html = await self.fetch(url)
            if html:
                break
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "officer", "clerk", "apprentice", "result", "admit", "notification", "po", "so", "manager", "sbi"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = "https://bank.sbi" + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.CAREERS_URL,
                "category_id": 1,
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from State Bank of India (SBI).",
            })
        return items[:20]


class BankOfBarodaScraper(BaseScraper):
    name = "Bank of Baroda"
    dept_slug = "bank-of-baroda"
    base_url = "https://www.bankofbaroda.in"
    source_site_id = 8

    async def scrape(self):
        items = []
        html = await self.fetch("https://www.bankofbaroda.in/career")
        if not html:
            html = await self.fetch("https://www.bankofbaroda.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "officer", "result", "admit", "notification", "bob", "bank"]):
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
                "description": "Official recruitment notification from Bank of Baroda.",
            })
        return items[:15]


class PNBScraper(BaseScraper):
    name = "Punjab National Bank"
    dept_slug = "punjab-national-bank"
    base_url = "https://www.pnbindia.in"
    source_site_id = 9

    async def scrape(self):
        items = []
        html = await self.fetch("https://www.pnbindia.in/careers.html")
        if not html:
            html = await self.fetch("https://www.pnbindia.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "officer", "result", "admit", "notification", "pnb"]):
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
                "description": "Official recruitment notification from Punjab National Bank (PNB).",
            })
        return items[:15]


class NABARDScraper(BaseScraper):
    name = "NABARD"
    dept_slug = "nabard"
    base_url = "https://www.nabard.org"
    source_site_id = 10

    async def scrape(self):
        items = []
        html = await self.fetch("https://www.nabard.org/careers.aspx")
        if not html:
            html = await self.fetch("https://www.nabard.org")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "vacancy", "officer", "assistant", "result", "notification", "nabard"]):
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
                "description": "Official recruitment notification from NABARD.",
            })
        return items[:10]
