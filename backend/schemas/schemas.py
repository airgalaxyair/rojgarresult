from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr
from models.models import PostType, PostStatus, SourceType, AdminRole


# ─── Shared ──────────────────────────────────────────────────────────────────

class DepartmentOut(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    official_site: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    color: Optional[str] = None

    class Config:
        from_attributes = True


class StateOut(BaseModel):
    id: int
    name: str
    slug: str
    code: str

    class Config:
        from_attributes = True


# ─── Posts ───────────────────────────────────────────────────────────────────

class PostListItem(BaseModel):
    id: int
    slug: str
    title: str
    post_type: PostType
    status: PostStatus
    department: DepartmentOut
    category: Optional[CategoryOut] = None
    total_vacancies: Optional[int] = None
    application_end: Optional[datetime] = None
    exam_date: Optional[datetime] = None
    is_featured: bool = False
    is_trending: bool = False
    view_count: int = 0
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PostDetail(PostListItem):
    title_hi: Optional[str] = None
    source_type: SourceType = SourceType.official
    source_url: Optional[str] = None
    application_start: Optional[datetime] = None
    result_date: Optional[datetime] = None
    description: Optional[str] = None
    description_hi: Optional[str] = None
    important_dates: Optional[list[dict]] = None
    eligibility: Optional[list[dict]] = None
    salary_range: Optional[dict] = None
    selection_process: Optional[str] = None
    pdf_urls: Optional[list[str]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    schema_markup: Optional[dict] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str
    post_type: PostType
    department_id: int
    category_id: Optional[int] = None
    total_vacancies: Optional[int] = None
    application_start: Optional[datetime] = None
    application_end: Optional[datetime] = None
    exam_date: Optional[datetime] = None
    description: Optional[str] = None
    important_dates: Optional[list[dict]] = None
    eligibility: Optional[list[dict]] = None
    salary_range: Optional[dict] = None
    pdf_urls: Optional[list[str]] = None
    source_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    is_featured: bool = False


class PostUpdate(PostCreate):
    title: Optional[str] = None
    post_type: Optional[PostType] = None
    department_id: Optional[int] = None
    status: Optional[PostStatus] = None


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AdminOut(BaseModel):
    id: int
    email: str
    name: str
    role: AdminRole
    is_active: bool
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Scrapers ────────────────────────────────────────────────────────────────

class SourceSiteOut(BaseModel):
    id: int
    name: str
    url: str
    scraper_module: str
    scraper_type: str
    scrape_interval_minutes: int
    is_active: bool
    is_official: bool
    last_scraped_at: Optional[datetime] = None
    failure_count: int = 0
    department: Optional[DepartmentOut] = None

    class Config:
        from_attributes = True


class ScraperLogOut(BaseModel):
    id: int
    source_site_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    posts_found: int
    posts_new: int
    posts_updated: int
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Pagination ──────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    per_page: int
    pages: int


# ─── Admin Dashboard ─────────────────────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_posts: int
    published_posts: int
    pending_approval: int
    jobs_today: int
    active_scrapers: int
    failed_scrapers: int
    telegram_sent_today: int
