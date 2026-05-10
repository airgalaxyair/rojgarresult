"""
cron_trigger.py — Called by cron-job.org every 2 hours via Railway API.
Also run directly: python cron_trigger.py [critical|all|third-party|single_name]
"""
import asyncio
import sys
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")
logger = logging.getLogger("cron")


async def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "critical"
    logger.info(f"Cron triggered: mode={mode}")

    from scheduler.scheduler import run_all, run_critical, run_third_party, run_one, ALL_SCRAPERS

    if mode == "all":
        results = await run_all()
    elif mode == "critical":
        results = await run_critical()
    elif mode == "third-party":
        results = await run_third_party()
    else:
        name_map = {
            s[0].split(".")[-1].lower().replace("scraper", ""): s[0]
            for s in ALL_SCRAPERS
        }
        class_path = name_map.get(mode.lower())
        if not class_path:
            logger.error(f"Unknown: {mode}. Available: {list(name_map.keys())}")
            return
        results = [await run_one(class_path)]

    if isinstance(results, list):
        total = sum(r.get("new", 0) for r in results)
        logger.info(f"Done. New posts: {total}")


if __name__ == "__main__":
    asyncio.run(main())
