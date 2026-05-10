from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import os

from core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Rojgar School API...")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url=None,
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ─── Security headers ────────────────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response

# ─── Routes ──────────────────────────────────────────────────────────────────
try:
    from api.v1.posts import router as posts_router
    app.include_router(posts_router, prefix="/api/v1")
    logger.info("Posts router loaded")
except Exception as e:
    logger.warning(f"Posts router not loaded: {e}")

try:
    from api.v1.admin.routes import router as admin_router
    app.include_router(admin_router, prefix="/api/v1")
    logger.info("Admin router loaded")
except Exception as e:
    logger.warning(f"Admin router not loaded: {e}")


@app.get("/")
async def root():
    return {"name": "Rojgar School API", "version": settings.APP_VERSION, "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}


@app.get("/api/v1/categories")
async def categories():
    return [
        {"id": 1, "name": "Banking", "slug": "banking"},
        {"id": 2, "name": "Defence", "slug": "defence"},
        {"id": 3, "name": "Railways", "slug": "railways"},
        {"id": 4, "name": "Teaching", "slug": "teaching"},
        {"id": 5, "name": "PSU", "slug": "psu"},
        {"id": 6, "name": "Police", "slug": "police"},
        {"id": 7, "name": "Health", "slug": "health"},
        {"id": 8, "name": "State PSC", "slug": "state-psc"},
    ]


@app.get("/api/v1/states")
async def states():
    return [
        {"id": 1, "name": "Uttar Pradesh", "slug": "uttar-pradesh", "code": "UP"},
        {"id": 2, "name": "Rajasthan", "slug": "rajasthan", "code": "RJ"},
        {"id": 3, "name": "Bihar", "slug": "bihar", "code": "BR"},
        {"id": 4, "name": "Maharashtra", "slug": "maharashtra", "code": "MH"},
        {"id": 5, "name": "Madhya Pradesh", "slug": "madhya-pradesh", "code": "MP"},
        {"id": 6, "name": "Gujarat", "slug": "gujarat", "code": "GJ"},
        {"id": 7, "name": "Tamil Nadu", "slug": "tamil-nadu", "code": "TN"},
        {"id": 8, "name": "Karnataka", "slug": "karnataka", "code": "KA"},
        {"id": 9, "name": "West Bengal", "slug": "west-bengal", "code": "WB"},
        {"id": 10, "name": "Haryana", "slug": "haryana", "code": "HR"},
        {"id": 11, "name": "Delhi", "slug": "delhi", "code": "DL"},
        {"id": 12, "name": "Punjab", "slug": "punjab", "code": "PB"},
    ]
