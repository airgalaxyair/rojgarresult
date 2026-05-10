"""
Scraper trigger API — allows running scrapers via HTTP endpoints.
Protected by a secret key to prevent unauthorized triggering.
"""
import os
import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks, Header
from typing import Optional

router = APIRouter(prefix="/scrapers", tags=["Scrapers"])

SCRAPER_SECRET = os.getenv("SCRAPER_SECRET", "rojgar-scraper-secret-2025")


def verify_secret(x_scraper_secret: Optional[str] = Header(None)):
    if x_scraper_secret != SCRAPER_SECRET:
        raise HTTPException(status_code=401, detail="Invalid scraper secret")


@router.post("/run/all")
async def run_all_scrapers(background_tasks: BackgroundTasks, x_scraper_secret: Optional[str] = Header(None)):
    """Run all scrapers in background."""
    verify_secret(x_scraper_secret)
    background_tasks.add_task(_run_all)
    return {"message": "All scrapers started in background", "count": 35}


@router.post("/run/critical")
async def run_critical_scrapers(background_tasks: BackgroundTasks, x_scraper_secret: Optional[str] = Header(None)):
    """Run only critical scrapers (SSC, UPSC, IBPS, RRB)."""
    verify_secret(x_scraper_secret)
    background_tasks.add_task(_run_critical)
    return {"message": "Critical scrapers started (SSC, UPSC, IBPS, RRB)"}


@router.post("/run/{scraper_name}")
async def run_single_scraper(scraper_name: str, background_tasks: BackgroundTasks, x_scraper_secret: Optional[str] = Header(None)):
    """Run a single named scraper."""
    verify_secret(x_scraper_secret)
    SCRAPER_MAP = {
        "ssc":         "scrapers.sources.central_exams.SSCScraper",
        "upsc":        "scrapers.sources.central_exams.UPSCScraper",
        "ibps":        "scrapers.sources.central_exams.IBPSScraper",
        "rrb":         "scrapers.sources.central_exams.RRBScraper",
        "rbi":         "scrapers.sources.central_exams.RBIScraper",
        "nta":         "scrapers.sources.central_exams.NTAScraper",
        "sbi":         "scrapers.sources.banking.SBIScraper",
        "bob":         "scrapers.sources.banking.BankOfBarodaScraper",
        "drdo":        "scrapers.sources.defence.DRDOScraper",
        "isro":        "scrapers.sources.defence.ISROScraper",
        "army":        "scrapers.sources.defence.IndianArmyScraper",
        "navy":        "scrapers.sources.defence.IndianNavyScraper",
        "airforce":    "scrapers.sources.defence.IndianAirForceScraper",
        "crpf":        "scrapers.sources.defence.CRPFScraper",
        "bsf":         "scrapers.sources.defence.BSFScraper",
        "ntpc":        "scrapers.sources.psu.NTPCScraper",
        "ongc":        "scrapers.sources.psu.ONGCScraper",
        "iocl":        "scrapers.sources.psu.IOCLScraper",
        "fci":         "scrapers.sources.psu.FCIScraper",
        "dmrc":        "scrapers.sources.psu.DMRCScraper",
        "kvs":         "scrapers.sources.teaching_health.KVSScraper",
        "nvs":         "scrapers.sources.teaching_health.NVSScraper",
        "dsssb":       "scrapers.sources.teaching_health.DSSSBScraper",
        "aiims":       "scrapers.sources.teaching_health.AIIMSScraper",
        "esic":        "scrapers.sources.teaching_health.ESICScraper",
    }
    class_path = SCRAPER_MAP.get(scraper_name.lower())
    if not class_path:
        raise HTTPException(status_code=404, detail=f"Scraper '{scraper_name}' not found. Available: {list(SCRAPER_MAP.keys())}")
    background_tasks.add_task(_run_single, class_path)
    return {"message": f"Scraper '{scraper_name}' started in background"}


@router.get("/status")
async def scraper_status():
    """Get list of all available scrapers."""
    return {
        "scrapers": [
            {"name": "SSC", "priority": "critical", "interval_hours": 2},
            {"name": "UPSC", "priority": "critical", "interval_hours": 2},
            {"name": "IBPS", "priority": "critical", "interval_hours": 2},
            {"name": "RRB", "priority": "critical", "interval_hours": 2},
            {"name": "RBI", "priority": "high", "interval_hours": 4},
            {"name": "SBI", "priority": "high", "interval_hours": 4},
            {"name": "DRDO", "priority": "high", "interval_hours": 4},
            {"name": "ISRO", "priority": "high", "interval_hours": 4},
            {"name": "Indian Army", "priority": "medium", "interval_hours": 6},
            {"name": "Indian Navy", "priority": "medium", "interval_hours": 6},
            {"name": "Indian Air Force", "priority": "medium", "interval_hours": 6},
            {"name": "CRPF", "priority": "medium", "interval_hours": 6},
            {"name": "BSF", "priority": "medium", "interval_hours": 6},
            {"name": "NTPC", "priority": "medium", "interval_hours": 6},
            {"name": "ONGC", "priority": "medium", "interval_hours": 6},
            {"name": "IOCL", "priority": "medium", "interval_hours": 6},
            {"name": "FCI", "priority": "medium", "interval_hours": 6},
            {"name": "DMRC", "priority": "medium", "interval_hours": 6},
            {"name": "BHEL", "priority": "low", "interval_hours": 12},
            {"name": "HAL", "priority": "low", "interval_hours": 12},
            {"name": "SAIL", "priority": "low", "interval_hours": 12},
            {"name": "KVS", "priority": "low", "interval_hours": 12},
            {"name": "NVS", "priority": "low", "interval_hours": 12},
            {"name": "DSSSB", "priority": "low", "interval_hours": 12},
            {"name": "AIIMS", "priority": "low", "interval_hours": 12},
            {"name": "ESIC", "priority": "low", "interval_hours": 12},
        ],
        "total": 26
    }


async def _run_all():
    from scheduler.scheduler import run_all
    await run_all()


async def _run_critical():
    from scheduler.scheduler import run_critical
    await run_critical()


async def _run_single(class_path: str):
    from scheduler.scheduler import run_one
    await run_one(class_path)
