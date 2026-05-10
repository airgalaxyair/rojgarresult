from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(title="Rojgar School API", version="1.0.0", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"name": "Rojgar School API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/v1/categories")
async def categories():
    return [
        {"id": 1, "name": "Banking",   "slug": "banking"},
        {"id": 2, "name": "Defence",   "slug": "defence"},
        {"id": 3, "name": "Railways",  "slug": "railways"},
        {"id": 4, "name": "Teaching",  "slug": "teaching"},
        {"id": 5, "name": "PSU",       "slug": "psu"},
        {"id": 6, "name": "Police",    "slug": "police"},
        {"id": 7, "name": "Health",    "slug": "health"},
        {"id": 8, "name": "State PSC", "slug": "state-psc"},
    ]

@app.get("/api/v1/states")
async def states():
    return [
        {"id":  1, "name": "Uttar Pradesh",  "slug": "uttar-pradesh",  "code": "UP"},
        {"id":  2, "name": "Rajasthan",       "slug": "rajasthan",      "code": "RJ"},
        {"id":  3, "name": "Bihar",           "slug": "bihar",          "code": "BR"},
        {"id":  4, "name": "Maharashtra",     "slug": "maharashtra",    "code": "MH"},
        {"id":  5, "name": "Madhya Pradesh",  "slug": "madhya-pradesh", "code": "MP"},
        {"id":  6, "name": "Gujarat",         "slug": "gujarat",        "code": "GJ"},
        {"id":  7, "name": "Tamil Nadu",      "slug": "tamil-nadu",     "code": "TN"},
        {"id":  8, "name": "Karnataka",       "slug": "karnataka",      "code": "KA"},
        {"id":  9, "name": "West Bengal",     "slug": "west-bengal",    "code": "WB"},
        {"id": 10, "name": "Haryana",         "slug": "haryana",        "code": "HR"},
        {"id": 11, "name": "Delhi",           "slug": "delhi",          "code": "DL"},
        {"id": 12, "name": "Punjab",          "slug": "punjab",         "code": "PB"},
    ]

# Telegram route — no DB needed, loads immediately
try:
    from api.v1.telegram import router as telegram_router
    app.include_router(telegram_router, prefix="/api/v1")
    logger.info("Telegram router loaded")
except Exception as e:
    logger.warning(f"Telegram router skipped: {e}")
