"""
Seed script — run once after initial migration to populate reference data.
Usage: python -m db.seed
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import AsyncSessionLocal
from models.models import Department, Category, State, Qualification, SourceSite, Admin
from core.security import hash_password


DEPARTMENTS = [
    ("UPSC", "upsc", "https://upsc.gov.in"),
    ("SSC", "ssc", "https://ssc.nic.in"),
    ("IBPS", "ibps", "https://ibps.in"),
    ("RRB", "rrb", "https://indianrailways.gov.in"),
    ("SBI", "sbi", "https://bank.sbi"),
    ("RBI", "rbi", "https://rbi.org.in"),
    ("DRDO", "drdo", "https://drdo.gov.in"),
    ("ISRO", "isro", "https://isro.gov.in"),
    ("NTPC", "ntpc", "https://ntpc.co.in"),
    ("ONGC", "ongc", "https://ongcindia.com"),
    ("IOCL", "iocl", "https://iocl.com"),
    ("BHEL", "bhel", "https://bhel.com"),
    ("HAL", "hal", "https://hal-india.co.in"),
    ("SAIL", "sail", "https://sail.co.in"),
    ("GAIL", "gail", "https://gail.nic.in"),
    ("BEL", "bel", "https://bel-india.in"),
    ("FCI", "fci", "https://fci.gov.in"),
    ("DSSSB", "dsssb", "https://dsssb.delhi.gov.in"),
    ("KVS", "kvs", "https://kvsangathan.nic.in"),
    ("NVS", "nvs", "https://navodaya.gov.in"),
    ("AIIMS", "aiims", "https://aiims.edu"),
    ("ESIC", "esic", "https://esic.nic.in"),
    ("NTA", "nta", "https://nta.ac.in"),
    ("CRPF", "crpf", "https://crpf.gov.in"),
    ("BSF", "bsf", "https://bsf.nic.in"),
]

CATEGORIES = [
    ("Banking", "banking", "#1d4ed8"),
    ("Defence", "defence", "#15803d"),
    ("Railways", "railways", "#7e22ce"),
    ("Teaching", "teaching", "#be123c"),
    ("PSU", "psu", "#0369a1"),
    ("Police", "police", "#a16207"),
    ("Health", "health", "#16a34a"),
    ("State PSC", "state-psc", "#c2410c"),
    ("Engineering", "engineering", "#0891b2"),
    ("IT/Tech", "it-tech", "#7c3aed"),
]

STATES = [
    ("Andhra Pradesh", "andhra-pradesh", "AP"),
    ("Arunachal Pradesh", "arunachal-pradesh", "AR"),
    ("Assam", "assam", "AS"),
    ("Bihar", "bihar", "BR"),
    ("Chhattisgarh", "chhattisgarh", "CG"),
    ("Goa", "goa", "GA"),
    ("Gujarat", "gujarat", "GJ"),
    ("Haryana", "haryana", "HR"),
    ("Himachal Pradesh", "himachal-pradesh", "HP"),
    ("Jharkhand", "jharkhand", "JH"),
    ("Karnataka", "karnataka", "KA"),
    ("Kerala", "kerala", "KL"),
    ("Madhya Pradesh", "madhya-pradesh", "MP"),
    ("Maharashtra", "maharashtra", "MH"),
    ("Manipur", "manipur", "MN"),
    ("Meghalaya", "meghalaya", "ML"),
    ("Mizoram", "mizoram", "MZ"),
    ("Nagaland", "nagaland", "NL"),
    ("Odisha", "odisha", "OD"),
    ("Punjab", "punjab", "PB"),
    ("Rajasthan", "rajasthan", "RJ"),
    ("Sikkim", "sikkim", "SK"),
    ("Tamil Nadu", "tamil-nadu", "TN"),
    ("Telangana", "telangana", "TS"),
    ("Tripura", "tripura", "TR"),
    ("Uttar Pradesh", "uttar-pradesh", "UP"),
    ("Uttarakhand", "uttarakhand", "UK"),
    ("West Bengal", "west-bengal", "WB"),
    ("Delhi", "delhi", "DL"),
    ("Jammu & Kashmir", "jammu-kashmir", "JK"),
    ("Ladakh", "ladakh", "LA"),
    ("Puducherry", "puducherry", "PY"),
]

QUALIFICATIONS = [
    ("8th Pass", "8th-pass", 1),
    ("10th Pass", "10th-pass", 2),
    ("12th Pass", "12th-pass", 3),
    ("ITI", "iti", 4),
    ("Diploma", "diploma", 5),
    ("Graduation", "graduation", 6),
    ("Post Graduation", "post-graduation", 7),
    ("Engineering", "engineering", 8),
    ("Medical (MBBS)", "mbbs", 9),
    ("CA/ICWA", "ca-icwa", 7),
    ("LLB", "llb", 7),
    ("PhD", "phd", 9),
]

SOURCE_SITES = [
    ("SSC Official", "https://ssc.nic.in", 1, "scrapers.sources.ssc_upsc_ibps.SSCScraper", "static", 120),
    ("UPSC Official", "https://upsc.gov.in", 2, "scrapers.sources.ssc_upsc_ibps.UPSCScraper", "static", 120),
    ("IBPS Official", "https://ibps.in", 3, "scrapers.sources.ssc_upsc_ibps.IBPSScraper", "static", 120),
]


async def seed():
    print("🌱 Starting database seed...")

    async with AsyncSessionLocal() as db:
        # Departments
        print("Adding departments...")
        for name, slug, site in DEPARTMENTS:
            existing = await db.get(Department, None)
            dept = Department(name=name, slug=slug, official_site=site)
            db.add(dept)

        await db.flush()

        # Categories
        print("Adding categories...")
        for name, slug, color in CATEGORIES:
            db.add(Category(name=name, slug=slug, color=color))

        # States
        print("Adding states...")
        for name, slug, code in STATES:
            db.add(State(name=name, slug=slug, code=code))

        # Qualifications
        print("Adding qualifications...")
        for name, slug, level in QUALIFICATIONS:
            db.add(Qualification(name=name, slug=slug, level=level))

        await db.flush()

        # Source sites (scrapers)
        print("Adding source sites...")
        for name, url, dept_id, module, stype, interval in SOURCE_SITES:
            db.add(SourceSite(
                name=name, url=url, department_id=dept_id,
                scraper_module=module, scraper_type=stype,
                scrape_interval_minutes=interval,
            ))

        # Default superadmin
        print("Creating default superadmin...")
        db.add(Admin(
            email="admin@sarkarischool.in",
            name="Super Admin",
            hashed_password=hash_password("ChangeThis@2025!"),
            role="superadmin",
        ))

        await db.commit()
        print("✅ Seed complete!")
        print("\n⚠️  Change the default admin password immediately after first login.")


if __name__ == "__main__":
    asyncio.run(seed())
