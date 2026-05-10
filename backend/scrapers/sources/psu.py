"""
PSU Scrapers
NTPC, ONGC, IOCL, BHEL, HAL, SAIL, GAIL, BEL, FCI, NHAI, ECIL, NALCO, NPCIL, AAI, DMRC
"""
from scrapers.base import BaseScraper, classify_post_type, extract_vacancies


def make_scraper(cls_name, dept, slug, url, cat_id, site_id, careers_path=""):
    class S(BaseScraper):
        name = cls_name
        dept_slug = slug
        base_url = url
        source_site_id = site_id
        category_id = cat_id

        async def scrape(self):
            items = []
            for u in [url + careers_path, url]:
                html = await self.fetch(u)
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
                if not any(k in title.lower() for k in [
                    "recruitment", "vacancy", "engineer", "officer", "technician",
                    "apprentice", "result", "admit", "notification", "trainee",
                    "junior", "assistant", "manager", "executive"
                ]):
                    continue
                seen.add(title)
                href = a.get("href", "")
                if href and not href.startswith("http"):
                    href = url + href
                items.append({
                    "title": title,
                    "post_type": classify_post_type(title),
                    "source_url": href or url,
                    "category_id": cat_id,
                    "total_vacancies": extract_vacancies(title),
                    "description": f"Official recruitment notification from {cls_name}. Visit the official website for complete details.",
                })
            return items[:15]
    S.__name__ = cls_name.replace(" ", "") + "Scraper"
    return S


NTPCScraper = make_scraper("NTPC", "NTPC", "ntpc", "https://www.ntpc.co.in", 5, 18, "/careers")
ONGCScraper = make_scraper("ONGC", "ONGC", "ongc", "https://ongcindia.com", 5, 19, "/wps/portal/ongcindia/ongc/career")
IOCLScraper = make_scraper("IOCL", "IOCL", "iocl", "https://iocl.com", 5, 20, "/careers")
BHELScraper = make_scraper("BHEL", "BHEL", "bhel", "https://www.bhel.com", 5, 21, "/careers")
HALScraper  = make_scraper("HAL",  "HAL",  "hal",  "https://hal-india.co.in", 5, 22, "/careers")
SAILScraper = make_scraper("SAIL", "SAIL", "sail", "https://www.sail.co.in", 5, 23, "/careers")
GAILScraper = make_scraper("GAIL", "GAIL", "gail", "https://gail.nic.in",   5, 24, "/english/career-with-gail")
BELScraper  = make_scraper("BEL",  "BEL",  "bel",  "https://bel-india.in",   5, 25, "/careers")
FCIScraper  = make_scraper("FCI",  "FCI",  "fci",  "https://fci.gov.in",     5, 26, "/fci/recruitment")
NHAIScraper = make_scraper("NHAI", "NHAI", "nhai", "https://nhai.gov.in",    5, 27, "/careers")
ECILScraper = make_scraper("ECIL", "ECIL", "ecil", "https://ecil.co.in",     5, 28, "/careers")
NALCOScraper= make_scraper("NALCO","NALCO","nalco","https://nalcoindia.com",  5, 29, "/Careers")
DMRCScraper = make_scraper("DMRC", "DMRC", "dmrc", "https://delhimetrorail.com",3,30,"/careers")
DFCCILScraper=make_scraper("DFCCIL","DFCCIL","dfccil","https://dfccil.com",  3, 31, "/careers")
AAIScraper  = make_scraper("AAI",  "AAI",  "aai",  "https://aai.aero",       5, 32, "/content/aaienglish/homepage/careers")
