#!/usr/bin/env python3
"""
cron_trigger.py — Called by Railway Cron every 2 hours.
Triggers critical scrapers directly (no HTTP needed).
Usage: python cron_trigger.py [all|critical|ssc|upsc|...]
"""
import asyncio
import sys
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger("cron")

async def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "critical"
    logger.info(f"Cron triggered: mode={mode}")

    from scheduler.scheduler import run_all, run_critical, run_one, SCRAPERS

    if mode == "all":
        results = await run_all()
    elif mode == "critical":
        results = await run_critical()
    else:
        # Run single scraper by name e.g. "ssc"
        name_map = {s[0].split(".")[-1].lower().replace("scraper", ""): s[0] for s in SCRAPERS}
        class_path = name_map.get(mode.lower())
        if not class_path:
            logger.error(f"Unknown scraper: {mode}")
            return
        results = [await run_one(class_path)]

    total_new = sum(r.get("new", 0) for r in results) if isinstance(results, list) else 0
    logger.info(f"Cron complete. New posts added: {total_new}")

if __name__ == "__main__":
    asyncio.run(main())
