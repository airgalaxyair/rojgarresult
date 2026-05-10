"""
Third-Party Job Portal Scrapers
Posts saved as 'pending_approval' — admin must review before publishing.
No Telegram alerts sent (handled after admin approval).
"""
from scrapers.base import BaseScraper, classify_post_type, extract_vacancies
from scrapers.sources.central_exams import is_valid_title


class ThirdPartyBase(BaseScraper):
    """Base for all third-party scrapers."""
    post_status = "pending_approval"
    source_type = "third_party"
    request_delay = 3.0  # Be polite to third-party sites


class SarkariResultScraper(ThirdPartyBase):
    name = "SarkariResult"
    dept_slug = "ssc"
    base_url = "https://www.sarkariresult.com"
    source_site_id = 50

    SECTIONS = [
        ("https://www.sarkariresult.com", "job"),
    ]

    async def scrape(self):
        items = []
        seen = set()
        for url, default_type in self.SECTIONS:
            html = await self.fetch(url)
            if not html:
                continue
            soup = self.soup(html)
            for a in soup.select("td a[href], table a[href]"):
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
                    "source_url": href or url,
                    "total_vacancies": extract_vacancies(title),
                    "description": f"Notification from SarkariResult.com. Always verify and apply at the official department website.",
                })
        return items[:30]


class FreeJobAlertScraper(ThirdPartyBase):
    name = "FreeJobAlert"
    dept_slug = "ssc"
    base_url = "https://www.freejobalert.com"
    source_site_id = 51

    async def scrape(self):
        items = []
        seen = set()
        for url in [
            "https://www.freejobalert.com/government-jobs/",
            "https://www.freejobalert.com/admit-card/",
            "https://www.freejobalert.com/results/",
        ]:
            html = await self.fetch(url)
            if not html:
                continue
            soup = self.soup(html)
            for a in soup.select("h2 a, h3 a, .entry-title a, article a"):
                title = a.get_text(strip=True)
                if not is_valid_title(title) or title in seen:
                    continue
                seen.add(title)
                href = a.get("href", "")
                items.append({
                    "title": title,
                    "post_type": classify_post_type(title),
                    "source_url": href or url,
                    "total_vacancies": extract_vacancies(title),
                    "description": "Notification from FreeJobAlert.com. Always verify at official source before applying.",
                })
        return items[:25]


class IndGovtJobsScraper(ThirdPartyBase):
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
        for a in soup.select("h3 a, h2 a, .post-title a"):
            title = a.get_text(strip=True)
            if not is_valid_title(title) or title in seen:
                continue
            seen.add(title)
            href = a.get("href", "")
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "total_vacancies": extract_vacancies(title),
                "description": "Notification from IndGovtJobs.in. Verify at official source.",
            })
        return items[:20]


class SarkariJobNetScraper(ThirdPartyBase):
    name = "SarkariJobNet"
    dept_slug = "ssc"
    base_url = "https://sarkarijob.net"
    source_site_id = 53

    async def scrape(self):
        items = []
        seen = set()
        for url in [
            "https://sarkarijob.net/notifications/",
            "https://sarkarijob.net/results/",
            "https://sarkarijob.net/admit-card/",
        ]:
            html = await self.fetch(url)
            if not html:
                continue
            soup = self.soup(html)
            for a in soup.select("h2 a, h3 a, .entry-title a"):
                title = a.get_text(strip=True)
                if not is_valid_title(title) or title in seen:
                    continue
                seen.add(title)
                href = a.get("href", "")
                items.append({
                    "title": title,
                    "post_type": classify_post_type(title),
                    "source_url": href or url,
                    "total_vacancies": extract_vacancies(title),
                    "description": "Notification from SarkariJob.net. Verify at official source.",
                })
        return items[:25]


class LinkingSkyScraper(ThirdPartyBase):
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
        for a in soup.select("h2 a, h3 a, .post-title a"):
            title = a.get_text(strip=True)
            if not is_valid_title(title) or title in seen:
                continue
            seen.add(title)
            href = a.get("href", "")
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "total_vacancies": extract_vacancies(title),
                "description": "Notification from LinkingSky.com. Verify at official source.",
            })
        return items[:20]


class MySarkariNaukriScraper(ThirdPartyBase):
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
        for a in soup.select("h2 a, h3 a, .job-title a"):
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
                "total_vacancies": extract_vacancies(title),
                "description": "Notification from MySarkariNaukri.com. Verify at official source.",
            })
        return items[:20]


class SarkariJobFindScraper(ThirdPartyBase):
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
        for a in soup.select("h2 a, h3 a, td a"):
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
                "total_vacancies": extract_vacancies(title),
                "description": "Notification from SarkariJobFind.com. Verify at official source.",
            })
        return items[:20]


class SarkariRojgarScraper(ThirdPartyBase):
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
        for a in soup.select("h2 a, h3 a, .entry-title a"):
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
                "total_vacancies": extract_vacancies(title),
                "description": "Notification from SarkariRojgar.com.in. Verify at official source.",
            })
        return items[:20]


class GovtJobsPortalScraper(ThirdPartyBase):
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
        for a in soup.select("h2 a, h3 a, .post-title a"):
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
                "total_vacancies": extract_vacancies(title),
                "description": "Notification from GovtJobsPortal.in. Verify at official source.",
            })
        return items[:20]


class Adda247Scraper(ThirdPartyBase):
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
        for a in soup.select("h2 a, h3 a, .job-card a, .post-title a"):
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
                "total_vacancies": extract_vacancies(title),
                "description": "Notification from Adda247.com. Verify at official source.",
            })
        return items[:20]


class EmploymentNewsScraper(BaseScraper):
    """Official Govt of India — auto-publish."""
    name = "Employment News"
    dept_slug = "upsc"
    base_url = "https://www.employmentnews.gov.in"
    source_site_id = 60
    post_status = "published"
    source_type = "official"

    async def scrape(self):
        items = []
        seen = set()
        for url in ["https://www.employmentnews.gov.in/NewEmp/Home.aspx", "https://www.employmentnews.gov.in"]:
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
                href = self.base_url + "/" + href.lstrip("/")
            items.append({
                "title": title,
                "post_type": classify_post_type(title),
                "source_url": href or self.base_url,
                "total_vacancies": extract_vacancies(title),
                "description": "Official notification from Employment News, Government of India weekly publication.",
            })
        return items[:20]
