"""
Scraper Scheduler — runs all scrapers on configured intervals.
Run with: python -m scheduler.scheduler
Uses APScheduler for production-grade job scheduling.
"""

import asyncio
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("scheduler")


# ─── Scraper registry ────────────────────────────────────────────────────────
# Each entry: (scraper_class, interval_minutes, priority_label)

SCRAPERS = [
    # Critical — every 2 hours
    ("scrapers.sources.ssc_upsc_ibps.SSCScraper", 120, "critical"),
    ("scrapers.sources.ssc_upsc_ibps.UPSCScraper", 120, "critical"),
    ("scrapers.sources.ssc_upsc_ibps.IBPSScraper", 120, "critical"),
    # High — every 4 hours (add more scrapers here)
    # Medium — every 6 hours
    # Low — every 12 hours
]


async def run_scraper(class_path: str):
    """Dynamically load and run a scraper class."""
    module_path, class_name = class_path.rsplit(".", 1)
    try:
        import importlib
        module = importlib.import_module(module_path)
        cls = getattr(module, class_name)
        scraper = cls()
        stats = await scraper.run()
        logger.info(f"✅ {class_name}: found={stats['found']}, new={stats['new']}")
        if stats.get("errors"):
            logger.warning(f"⚠️  {class_name} errors: {stats['errors'][:3]}")
        return stats
    except Exception as e:
        logger.error(f"❌ {class_name} crashed: {e}")
        return {"errors": [str(e)], "found": 0, "new": 0}


def setup_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")

    for class_path, interval_minutes, priority in SCRAPERS:
        scheduler.add_job(
            func=run_scraper,
            trigger=IntervalTrigger(minutes=interval_minutes),
            args=[class_path],
            id=class_path,
            name=class_path.split(".")[-1],
            replace_existing=True,
            max_instances=1,           # Prevent overlapping runs
            coalesce=True,             # Skip missed runs
            misfire_grace_time=300,    # 5 min grace period
        )
        logger.info(f"Registered: {class_path} every {interval_minutes} min [{priority}]")

    return scheduler


async def main():
    logger.info("=" * 50)
    logger.info("Sarkari School Scraper Scheduler starting...")
    logger.info("=" * 50)

    scheduler = setup_scheduler()
    scheduler.start()

    # Run all scrapers once immediately on startup
    logger.info("Running initial scrape on startup...")
    for class_path, _, _ in SCRAPERS:
        await run_scraper(class_path)
        await asyncio.sleep(5)  # Stagger startup

    logger.info("Scheduler running. Press Ctrl+C to stop.")
    try:
        while True:
            await asyncio.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("Scheduler stopped.")


if __name__ == "__main__":
    asyncio.run(main())
