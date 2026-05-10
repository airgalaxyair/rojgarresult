from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from core.config import settings
from api.v1.posts import router as posts_router
from api.v1.admin.routes import router as admin_router

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Sarkari School API...")
    # DB connection pool is created lazily by SQLAlchemy
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
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

# ─── Rate limiting middleware (basic) ────────────────────────────────────────
from collections import defaultdict
from time import time

_request_counts: dict = defaultdict(list)


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    ip = request.client.host if request.client else "unknown"
    now = time()
    window = 60  # 1 minute
    max_requests = 100

    # Clean old entries
    _request_counts[ip] = [t for t in _request_counts[ip] if now - t < window]

    if len(_request_counts[ip]) >= max_requests:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

    _request_counts[ip].append(now)
    return await call_next(request)


# ─── Security headers ────────────────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(posts_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}


@app.get("/api/v1/categories")
async def categories():
    # Served from DB in production; mock here for completeness
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
