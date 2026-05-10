from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Rojgar School API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/rojgarschool"
    DATABASE_SYNC_URL: str = "postgresql://user:password@localhost/rojgarschool"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Auth
    SECRET_KEY: str = "change-this-to-a-long-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHANNEL_ID: str = ""
    TELEGRAM_BOT_USERNAME: str = "Rojgarschoolbot"

    # Storage (Cloudflare R2)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "rojgarschool-pdfs"
    R2_PUBLIC_URL: str = ""

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "https://rojgarschool.in",
        "https://www.rojgarschool.in",
        "http://localhost:3000",
    ]

    # Scraper
    SCRAPER_USER_AGENT: str = (
        "Mozilla/5.0 (compatible; RojgarSchoolBot/1.0; +https://rojgarschool.in/bot)"
    )
    SCRAPER_REQUEST_DELAY: float = 2.5  # seconds between requests per domain
    SCRAPER_MAX_RETRIES: int = 3

    # Cache TTLs (seconds)
    CACHE_TTL_HOMEPAGE: int = 1800       # 30 min
    CACHE_TTL_LISTING: int = 3600        # 1 hour
    CACHE_TTL_POST: int = 21600          # 6 hours
    CACHE_TTL_SEARCH: int = 900          # 15 min

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
