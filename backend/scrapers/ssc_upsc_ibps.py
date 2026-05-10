"""
SSC Scraper — Staff Selection Commission
Official site: https://ssc.nic.in
Scrapes: Latest Notifications, Results, Admit Cards
"""

import re
from scrapers.base import BaseScraper, ScrapedItem
from typing import Optional


class SSCScraper(BaseScraper):
    source_site_id = 1
    source_name = "SSC (Staff Selection Commission)"
    base_url = "https://ssc.nic.in"

    SCRAPE_URLS = {
        "notifications": "https://ssc.nic.in/SSCFileServer/PortalManagement/UploadedFiles/latest_news_16_10_2024.html",
        "results": "https://ssc.nic.in/Portal/Result",
        "admit_cards": "https://ssc.nic.in/Portal/AdmitCard",
    }

    def _classify_post_type(self, title: str) -> str:
        title_lower = title.lower()
        if any(kw in title_lower for kw in ["result", "marks", "merit", "cut-off", "cutoff"]):
            return "result"
        if any(kw in title_lower for kw in ["admit card", "call letter", "hall ticket", "e-admit"]):
            return "admit_card"
        if any(kw in title_lower for kw in ["answer key", "answer sheet", "provisional answer"]):
            return "answer_key"
        if any(kw in title_lower for kw in ["syllabus", "curriculum", "exam pattern"]):
            return "syllabus"
        return "job"

    def _extract_vacancies(self, title: str) -> Optional[int]:
        """Try to extract vacancy count from title."""
        patterns = [
            r"(\d[\d,]+)\s*(?:posts?|vacancies|seats?|positions?)",
            r"(?:posts?|vacancies)\s*[:\-–]\s*(\d[\d,]+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                num_str = match.group(1).replace(",", "")
                try:
                    return int(num_str)
                except ValueError:
                    pass
        return None

    async def scrape(self) -> list[ScrapedItem]:
        items = []
        html = await self._get_html(self.base_url)
        if not html:
            return items

        soup = self._soup(html)

        # SSC homepage has a "Latest" section with announcements
        # Adjust selectors based on actual SSC site structure
        notification_divs = soup.select(".latest-news li, .notifications li, .news-list li, table tr")

        for div in notification_divs[:30]:
            try:
                link = div.find("a")
                if not link:
                    continue

                title = link.get_text(strip=True)
                if len(title) < 10:
                    continue

                href = link.get("href", "")
                if href and not href.startswith("http"):
                    href = self.base_url + href

                post_type = self._classify_post_type(title)
                vacancies = self._extract_vacancies(title)

                item = ScrapedItem(
                    title=title,
                    source_url=href or self.base_url,
                    post_type=post_type,
                    department_name="SSC",
                    total_vacancies=vacancies,
                    description=f"Official {post_type.replace('_', ' ').title()} notification from Staff Selection Commission. "
                                f"Candidates can check full details and apply online at the official SSC website.",
                    pdf_urls=[href] if href and href.endswith(".pdf") else [],
                    raw_data={"source_url": href, "raw_title": title},
                )
                items.append(item)

            except Exception as e:
                self.logger.warning(f"SSC: Failed to parse item: {e}")
                continue

        self.logger.info(f"SSC: Found {len(items)} items")
        return items


class UPSCScraper(BaseScraper):
    source_site_id = 2
    source_name = "UPSC (Union Public Service Commission)"
    base_url = "https://upsc.gov.in"

    def _classify_post_type(self, title: str) -> str:
        title_lower = title.lower()
        if "result" in title_lower or "final result" in title_lower:
            return "result"
        if "admit card" in title_lower or "e-admit" in title_lower:
            return "admit_card"
        if "answer key" in title_lower:
            return "answer_key"
        return "job"

    async def scrape(self) -> list[ScrapedItem]:
        items = []
        html = await self._get_html(self.base_url)
        if not html:
            return items

        soup = self._soup(html)
        # UPSC homepage typically has a "What's New" section
        news_items = soup.select(".whats-new a, .latest-news a, .news a, .notification a")

        for link in news_items[:25]:
            try:
                title = link.get_text(strip=True)
                if len(title) < 10:
                    continue

                href = link.get("href", "")
                if href and not href.startswith("http"):
                    href = "https://upsc.gov.in" + href

                post_type = self._classify_post_type(title)

                item = ScrapedItem(
                    title=title,
                    source_url=href or self.base_url,
                    post_type=post_type,
                    department_name="UPSC",
                    description=f"Official notification from Union Public Service Commission. "
                                f"Visit upsc.gov.in for complete details and online application.",
                    pdf_urls=[href] if href and href.lower().endswith(".pdf") else [],
                    raw_data={"source_url": href, "raw_title": title},
                )
                items.append(item)
            except Exception as e:
                self.logger.warning(f"UPSC: Failed to parse item: {e}")

        self.logger.info(f"UPSC: Found {len(items)} items")
        return items


class IBPSScraper(BaseScraper):
    source_site_id = 3
    source_name = "IBPS (Institute of Banking Personnel Selection)"
    base_url = "https://www.ibps.in"

    async def scrape(self) -> list[ScrapedItem]:
        items = []
        html = await self._get_html(self.base_url)
        if not html:
            return items

        soup = self._soup(html)
        # IBPS has a news section on homepage
        news = soup.select(".news-update a, .latest-news a, .notification a, .box-content a")

        for link in news[:20]:
            try:
                title = link.get_text(strip=True)
                if len(title) < 10:
                    continue

                href = link.get("href", "")
                if href and not href.startswith("http"):
                    href = self.base_url + href

                post_type = "job"
                if "result" in title.lower():
                    post_type = "result"
                elif "admit" in title.lower():
                    post_type = "admit_card"
                elif "answer" in title.lower():
                    post_type = "answer_key"

                item = ScrapedItem(
                    title=title,
                    source_url=href or self.base_url,
                    post_type=post_type,
                    department_name="IBPS",
                    description="Official notification from Institute of Banking Personnel Selection. "
                                "Check ibps.in for eligibility, exam dates and online application.",
                    pdf_urls=[href] if href and href.endswith(".pdf") else [],
                    raw_data={"raw_title": title, "source_url": href},
                )
                items.append(item)
            except Exception as e:
                self.logger.warning(f"IBPS: Failed to parse: {e}")

        self.logger.info(f"IBPS: Found {len(items)} items")
        return items
