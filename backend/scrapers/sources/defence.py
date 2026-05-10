"""
Defence Scrapers
DRDO, ISRO, Indian Army, Indian Navy, Indian Air Force, CRPF, BSF, CISF, ITBP, Coast Guard
"""
from scrapers.base import BaseScraper, classify_post_type, extract_vacancies


class DRDOScraper(BaseScraper):
    name = "DRDO"
    dept_slug = "drdo"
    base_url = "https://www.drdo.gov.in"
    source_site_id = 11

    async def scrape(self):
        items = []
        for url in ["https://www.drdo.gov.in/careers", "https://www.drdo.gov.in/whats-new", "https://www.drdo.gov.in"]:
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
            if not any(k in title.lower() for k in ["recruitment", "ceptam", "scientist", "technician", "vacancy", "result", "admit", "notification", "drdo", "junior research"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 5,  # PSU
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Defence Research and Development Organisation (DRDO).",
            })
        return items[:15]


class ISROScraper(BaseScraper):
    name = "ISRO"
    dept_slug = "isro"
    base_url = "https://www.isro.gov.in"
    source_site_id = 12

    async def scrape(self):
        items = []
        for url in ["https://www.isro.gov.in/Careers.html", "https://www.isro.gov.in"]:
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
            if not any(k in title.lower() for k in ["recruitment", "scientist", "engineer", "technician", "vacancy", "result", "admit", "isro", "notification"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 5,
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Indian Space Research Organisation (ISRO).",
            })
        return items[:15]


class IndianArmyScraper(BaseScraper):
    name = "Indian Army"
    dept_slug = "indian-army"
    base_url = "https://joinindianarmy.nic.in"
    source_site_id = 13

    async def scrape(self):
        items = []
        html = await self.fetch("https://joinindianarmy.nic.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "rally", "soldier", "officer", "admit", "result", "notification", "agniveer", "tes", "ncc"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 2,  # Defence
                "total_vacancies": extract_vacancies(title),
                "description": "Official recruitment notification from Indian Army.",
            })
        return items[:15]


class IndianNavyScraper(BaseScraper):
    name = "Indian Navy"
    dept_slug = "indian-navy"
    base_url = "https://www.joinindiannavy.gov.in"
    source_site_id = 14

    async def scrape(self):
        items = []
        html = await self.fetch("https://www.joinindiannavy.gov.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "sailor", "officer", "admit", "result", "notification", "agniveer", "navy", "ssr", "aa", "mr"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 2,
                "description": "Official recruitment notification from Indian Navy.",
            })
        return items[:15]


class IndianAirForceScraper(BaseScraper):
    name = "Indian Air Force"
    dept_slug = "indian-air-force"
    base_url = "https://careerairforce.nic.in"
    source_site_id = 15

    async def scrape(self):
        items = []
        html = await self.fetch("https://careerairforce.nic.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "airman", "officer", "admit", "result", "notification", "agniveer", "air force", "afcat"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 2,
                "description": "Official recruitment notification from Indian Air Force.",
            })
        return items[:15]


class CRPFScraper(BaseScraper):
    name = "CRPF"
    dept_slug = "crpf"
    base_url = "https://crpf.gov.in"
    source_site_id = 16

    async def scrape(self):
        items = []
        html = await self.fetch("https://crpf.gov.in/recruitment.htm")
        if not html:
            html = await self.fetch("https://crpf.gov.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "constable", "sub-inspector", "si", "hc", "result", "admit", "notification", "crpf"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 6,  # Police
                "description": "Official recruitment notification from Central Reserve Police Force (CRPF).",
            })
        return items[:15]


class BSFScraper(BaseScraper):
    name = "BSF"
    dept_slug = "bsf"
    base_url = "https://bsf.nic.in"
    source_site_id = 17

    async def scrape(self):
        items = []
        html = await self.fetch("https://bsf.nic.in/recruitment/")
        if not html:
            html = await self.fetch("https://bsf.nic.in")
        if not html:
            return items
        soup = self.soup(html)
        seen = set()
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            if len(title) < 12 or title in seen:
                continue
            if not any(k in title.lower() for k in ["recruitment", "constable", "si", "hc", "result", "admit", "notification", "bsf"]):
                continue
            seen.add(title)
            href = a.get("href", "")
            if href and not href.startswith("http"):
                href = self.base_url + href
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "category_id": 6,
                "description": "Official recruitment notification from Border Security Force (BSF).",
            })
        return items[:12]
