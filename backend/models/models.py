from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String, Integer, Text, Boolean, DateTime, Float,
    ForeignKey, Enum, JSON, ARRAY, BigInteger, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum
from db.database import Base


class PostType(str, enum.Enum):
    job = "job"
    result = "result"
    admit_card = "admit_card"
    answer_key = "answer_key"
    syllabus = "syllabus"
    admission = "admission"


class PostStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    pending_approval = "pending_approval"
    archived = "archived"


class SourceType(str, enum.Enum):
    official = "official"
    third_party = "third_party"


class ScraperStatus(str, enum.Enum):
    running = "running"
    success = "success"
    failed = "failed"
    partial = "partial"


class AdminRole(str, enum.Enum):
    superadmin = "superadmin"
    editor = "editor"
    moderator = "moderator"


# ─── Reference Tables ───────────────────────────────────────────────────────

class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500))
    official_site: Mapped[Optional[str]] = mapped_column(String(500))
    scraper_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    posts: Mapped[list["Post"]] = relationship("Post", back_populates="department")
    source_sites: Mapped[list["SourceSite"]] = relationship("SourceSite", back_populates="department")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    parent_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.id"))
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    color: Mapped[Optional[str]] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class State(Base):
    __tablename__ = "states"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    code: Mapped[str] = mapped_column(String(5), nullable=False, unique=True)


class Qualification(Base):
    __tablename__ = "qualifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    level: Mapped[int] = mapped_column(Integer, default=0)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)


# ─── Source Sites ────────────────────────────────────────────────────────────

class SourceSite(Base):
    __tablename__ = "source_sites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("departments.id"))
    scraper_module: Mapped[str] = mapped_column(String(100))  # e.g. "scrapers.sources.ssc"
    scraper_type: Mapped[str] = mapped_column(String(30), default="static")  # static/dynamic/rss
    scrape_interval_minutes: Mapped[int] = mapped_column(Integer, default=240)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_official: Mapped[bool] = mapped_column(Boolean, default=True)
    last_scraped_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    failure_count: Mapped[int] = mapped_column(Integer, default=0)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64))  # SHA-256 for change detection
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="source_sites")
    scraper_logs: Mapped[list["ScraperLog"]] = relationship("ScraperLog", back_populates="source_site")
    raw_items: Mapped[list["ScraperRawItem"]] = relationship("ScraperRawItem", back_populates="source_site")


# ─── Main Content ─────────────────────────────────────────────────────────────

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    slug: Mapped[str] = mapped_column(String(300), nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    title_hi: Mapped[Optional[str]] = mapped_column(String(500))  # Hindi title

    post_type: Mapped[PostType] = mapped_column(Enum(PostType), nullable=False, index=True)
    status: Mapped[PostStatus] = mapped_column(Enum(PostStatus), default=PostStatus.draft, index=True)
    source_type: Mapped[SourceType] = mapped_column(Enum(SourceType), default=SourceType.official)

    source_url: Mapped[Optional[str]] = mapped_column(String(1000))
    source_site_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("source_sites.id"))

    department_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("departments.id"), index=True)
    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.id"), index=True)

    # Vacancy & dates
    total_vacancies: Mapped[Optional[int]] = mapped_column(Integer)
    application_start: Mapped[Optional[datetime]] = mapped_column(DateTime)
    application_end: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True)
    exam_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    result_date: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Content
    description: Mapped[Optional[str]] = mapped_column(Text)
    description_hi: Mapped[Optional[str]] = mapped_column(Text)
    important_dates: Mapped[Optional[dict]] = mapped_column(JSON)    # [{label, date}]
    eligibility: Mapped[Optional[dict]] = mapped_column(JSON)        # [{label, value}]
    salary_range: Mapped[Optional[dict]] = mapped_column(JSON)       # {min, max, text}
    selection_process: Mapped[Optional[str]] = mapped_column(Text)

    # Media
    pdf_urls: Mapped[Optional[list]] = mapped_column(JSON)           # [url, ...]
    featured_image_url: Mapped[Optional[str]] = mapped_column(String(1000))

    # Flags
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_trending: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    # SEO
    seo_title: Mapped[Optional[str]] = mapped_column(String(80))
    seo_description: Mapped[Optional[str]] = mapped_column(String(200))
    seo_keywords: Mapped[Optional[list]] = mapped_column(JSON)
    schema_markup: Mapped[Optional[dict]] = mapped_column(JSON)

    # Stats
    view_count: Mapped[int] = mapped_column(BigInteger, default=0)
    share_count: Mapped[int] = mapped_column(Integer, default=0)

    # Telegram
    telegram_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Timestamps
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="posts")
    category: Mapped[Optional["Category"]] = relationship("Category")
    source_site: Mapped[Optional["SourceSite"]] = relationship("SourceSite")
    telegram_logs: Mapped[list["TelegramLog"]] = relationship("TelegramLog", back_populates="post")

    __table_args__ = (
        Index("ix_posts_type_status_published", "post_type", "status", "published_at"),
        Index("ix_posts_status_featured", "status", "is_featured"),
    )


# ─── Scraper Tracking ────────────────────────────────────────────────────────

class ScraperLog(Base):
    __tablename__ = "scraper_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_site_id: Mapped[int] = mapped_column(Integer, ForeignKey("source_sites.id"), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    status: Mapped[ScraperStatus] = mapped_column(Enum(ScraperStatus), nullable=False)
    posts_found: Mapped[int] = mapped_column(Integer, default=0)
    posts_new: Mapped[int] = mapped_column(Integer, default=0)
    posts_updated: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    log_text: Mapped[Optional[str]] = mapped_column(Text)

    source_site: Mapped["SourceSite"] = relationship("SourceSite", back_populates="scraper_logs")


class ScraperRawItem(Base):
    __tablename__ = "scraper_raw_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_site_id: Mapped[int] = mapped_column(Integer, ForeignKey("source_sites.id"), index=True)
    raw_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    raw_data: Mapped[dict] = mapped_column(JSON)
    extracted_data: Mapped[Optional[dict]] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    source_site: Mapped["SourceSite"] = relationship("SourceSite", back_populates="raw_items")


# ─── Telegram ────────────────────────────────────────────────────────────────

class TelegramLog(Base):
    __tablename__ = "telegram_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    post_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("posts.id"), index=True)
    channel_id: Mapped[str] = mapped_column(String(100))
    message_id: Mapped[Optional[int]] = mapped_column(BigInteger)
    sent_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    status: Mapped[str] = mapped_column(String(30), default="sent")
    error_message: Mapped[Optional[str]] = mapped_column(Text)

    post: Mapped[Optional["Post"]] = relationship("Post", back_populates="telegram_logs")


# ─── Users & Admins ──────────────────────────────────────────────────────────

class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[AdminRole] = mapped_column(Enum(AdminRole), default=AdminRole.editor)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    admin_id: Mapped[int] = mapped_column(Integer, ForeignKey("admins.id"), index=True)
    action: Mapped[str] = mapped_column(String(100))     # e.g. "post.publish", "post.delete"
    entity_type: Mapped[str] = mapped_column(String(50)) # e.g. "post", "scraper"
    entity_id: Mapped[Optional[str]] = mapped_column(String(50))
    details: Mapped[Optional[dict]] = mapped_column(JSON)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# ─── Advertisements ──────────────────────────────────────────────────────────

class Advertisement(Base):
    __tablename__ = "advertisements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    ad_type: Mapped[str] = mapped_column(String(30))       # banner, native, sponsored
    placement: Mapped[str] = mapped_column(String(50))     # header, sidebar, in-feed
    html_code: Mapped[Optional[str]] = mapped_column(Text)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
