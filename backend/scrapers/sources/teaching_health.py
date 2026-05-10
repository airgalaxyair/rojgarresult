"""
Teaching & Health Scrapers
KVS, NVS, DSSSB, AIIMS, ESIC
"""
from scrapers.base import BaseScraper, classify_post_type, extract_vacancies


class KVSScraper(BaseScraper):
    name = "KVS"
    dept_slug = "kvs"
    base_url = "https://kvsangathan.nic.in"
    source_site_id = 33

    async def scrape(self):
        items = []
        for url in ["https://kvsangathan.nic.in/RecruitmentNotices", "https://kvsangathan.nic.in"]:
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
            if not any(k in title.lower() for k in ["recruitment", "teacher", "tgt", "pgt", "prt", "principal", "result", "admit", "notification", "kvs", "vacancy"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 4,  # Teaching
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Kendriya Vidyalaya Sangathan (KVS).",
            })
        return items[:15]


class NVSScraper(BaseScraper):
    name = "NVS"
    dept_slug = "nvs"
    base_url = "https://navodaya.gov.in"
    source_site_id = 34

    async def scrape(self):
        items = []
        html = await self.fetch("https://navodaya.gov.in/nvs/en/Recruitment1/Notices/latest-news")
        if not html:
            html = await self.fetch("https://navodaya.gov.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "teacher", "principal", "staff", "result", "admit", "notification", "nvs", "vacancy", "caretaker"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 4,
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Navodaya Vidyalaya Samiti (NVS).",
            })
        return items[:15]


class DSSSBScraper(BaseScraper):
    name = "DSSSB"
    dept_slug = "dsssb"
    base_url = "https://dsssb.delhi.gov.in"
    source_site_id = 35

    async def scrape(self):
        items = []
        for url in ["https://dsssb.delhi.gov.in/RecruitmentNotice", "https://dsssb.delhi.gov.in"]:
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
            if not any(k in title.lower() for k in ["recruitment", "teacher", "tgt", "pgt", "prt", "result", "admit", "notification", "dsssb", "vacancy", "jr"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 4,
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Delhi Subordinate Services Selection Board (DSSSB).",
            })
        return items[:15]


class AIIMSScraper(BaseScraper):
    name = "AIIMS"
    dept_slug = "aiims"
    base_url = "https://www.aiims.edu"
    source_site_id = 36

    async def scrape(self):
        items = []
        for url in ["https://www.aiims.edu/en/notices/recruitment.html", "https://www.aiims.edu"]:
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
            if not any(k in title.lower() for k in ["recruitment", "nurse", "doctor", "staff", "faculty", "result", "admit", "notification", "aiims", "vacancy", "junior"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 7,  # Health
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from All India Institute of Medical Sciences (AIIMS).",
            })
        return items[:15]


class ESICScraper(BaseScraper):
    name = "ESIC"
    dept_slug = "esic"
    base_url = "https://esic.nic.in"
    source_site_id = 37

    async def scrape(self):
        items = []
        for url in ["https://esic.nic.in/recruitment", "https://esic.nic.in"]:
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
            if not any(k in title.lower() for k in ["recruitment", "nurse", "doctor", "staff", "result", "admit", "notification", "esic", "vacancy", "insurance"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 7,
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Employees' State Insurance Corporation (ESIC).",
            })
        return items[:15]
