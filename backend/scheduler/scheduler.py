"""
Rojgar School — Master Scraper Scheduler
Runs all scrapers on a schedule. Triggered via API or cron.
"""
import asyncio
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("scheduler")

# ── Scraper registry ──────────────────────────────────────────────────────────
# (scraper_class, interval_hours, priority)
SCRAPERS = [
    # Critical — every 2 hours
    ("scrapers.sources.central_exams.SSCScraper",       2),
    ("scrapers.sources.central_exams.UPSCScraper",      2),
    ("scrapers.sources.central_exams.IBPSScraper",      2),
    ("scrapers.sources.central_exams.RRBScraper",       2),
    # High — every 4 hours
    ("scrapers.sources.central_exams.RBIScraper",       4),
    ("scrapers.sources.central_exams.NTAScraper",       4),
    ("scrapers.sources.banking.SBIScraper",             4),
    ("scrapers.sources.banking.BankOfBarodaScraper",    4),
    ("scrapers.sources.banking.PNBScraper",             4),
    ("scrapers.sources.banking.NABARDScraper",          4),
    ("scrapers.sources.defence.DRDOScraper",            4),
    ("scrapers.sources.defence.ISROScraper",            4),
    # Medium — every 6 hours
    ("scrapers.sources.defence.IndianArmyScraper",      6),
    ("scrapers.sources.defence.IndianNavyScraper",      6),
    ("scrapers.sources.defence.IndianAirForceScraper",  6),
    ("scrapers.sources.defence.CRPFScraper",            6),
    ("scrapers.sources.defence.BSFScraper",             6),
    ("scrapers.sources.psu.NTPCScraper",                6),
    ("scrapers.sources.psu.ONGCScraper",                6),
    ("scrapers.sources.psu.IOCLScraper",                6),
    ("scrapers.sources.psu.FCIScraper",                 6),
    ("scrapers.sources.psu.DMRCScraper",                6),
    # Low — every 12 hours
    ("scrapers.sources.psu.BHELScraper",               12),
    ("scrapers.sources.psu.HALScraper",                12),
    ("scrapers.sources.psu.SAILScraper",               12),
    ("scrapers.sources.psu.GAILScraper",               12),
    ("scrapers.sources.psu.BELScraper",                12),
    ("scrapers.sources.psu.NHAIScraper",               12),
    ("scrapers.sources.psu.ECILScraper",               12),
    ("scrapers.sources.psu.NALCOScraper",              12),
    ("scrapers.sources.psu.DFCCILScraper",             12),
    ("scrapers.sources.psu.AAIScraper",                12),
    ("scrapers.sources.teaching_health.KVSScraper",    12),
    ("scrapers.sources.teaching_health.NVSScraper",    12),
    ("scrapers.sources.teaching_health.DSSSBScraper",  12),
    ("scrapers.sources.teaching_health.AIIMSScraper",  12),
    ("scrapers.sources.teaching_health.ESICScraper",   12),
]


async def run_one(class_path: str) -> dict:
    module_path, class_name = class_path.rsplit(".", 1)
    try:
        import importlib
        module = importlib.import_module(module_path)
        cls = getattr(module, class_name)
        scraper = cls()
        return await scraper.run()
    except Exception as e:
        logger.error(f"Scraper {class_name} failed: {e}")
        return {"scraper": class_name, "found": 0, "new": 0, "errors": [str(e)]}


async def run_all(priority_hours: int = None):
    """Run all scrapers (optionally filtered by priority)."""
    to_run = SCRAPERS if priority_hours is None else [s for s in SCRAPERS if s[1] <= priority_hours]
    logger.info(f"Running {len(to_run)} scrapers...")
    results = []
    for class_path, _ in to_run:
        result = await run_one(class_path)
        results.append(result)
        await asyncio.sleep(3)  # Pause between scrapers
    total_new = sum(r.get("new", 0) for r in results)
    logger.info(f"Done. Total new posts: {total_new}")
    return results


async def run_critical():
    """Run only critical scrapers (SSC, UPSC, IBPS, RRB)."""
    critical = [s for s in SCRAPERS if s[1] <= 2]
    logger.info(f"Running {len(critical)} critical scrapers...")
    results = []
    for class_path, _ in critical:
        result = await run_one(class_path)
        results.append(result)
        await asyncio.sleep(2)
    return results


if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    if mode == "critical":
        asyncio.run(run_critical())
    elif mode == "all":
        asyncio.run(run_all())
    else:
        asyncio.run(run_one(mode))

# Third-party scrapers (pending_approval)
THIRD_PARTY_SCRAPERS = [
    ("scrapers.sources.third_party.SarkariResultScraper",   3),
    ("scrapers.sources.third_party.FreeJobAlertScraper",    3),
    ("scrapers.sources.third_party.IndGovtJobsScraper",     4),
    ("scrapers.sources.third_party.SarkariJobNetScraper",   4),
    ("scrapers.sources.third_party.LinkingSkyScraper",      6),
    ("scrapers.sources.third_party.MySarkariNaukriScraper", 6),
    ("scrapers.sources.third_party.SarkariJobFindScraper",  6),
    ("scrapers.sources.third_party.SarkariRojgarScraper",   6),
    ("scrapers.sources.third_party.GovtJobsPortalScraper",  8),
    ("scrapers.sources.third_party.Adda247Scraper",         8),
    ("scrapers.sources.third_party.EmploymentNewsScraper",  4),  # Official
]

ALL_SCRAPERS = SCRAPERS + THIRD_PARTY_SCRAPERS


async def run_third_party():
    """Run only third-party scrapers."""
    logger.info(f"Running {len(THIRD_PARTY_SCRAPERS)} third-party scrapers...")
    results = []
    for class_path, _ in THIRD_PARTY_SCRAPERS:
        result = await run_one(class_path)
        results.append(result)
        await asyncio.sleep(3)
    return results
