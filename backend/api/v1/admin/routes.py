from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from db.database import get_db
from models.models import Post, PostStatus, SourceType, ScraperLog, SourceSite, Admin, AuditLog, TelegramLog
from schemas.schemas import PostCreate, PostUpdate, PostDetail, DashboardSummary, AdminOut, ScraperLogOut
from core.security import get_current_admin, require_role
from core.cache import cache_delete_pattern, cache_key, cache_delete
from telegram.publisher import send_post_to_telegram
import hashlib
import re

router = APIRouter(prefix="/admin", tags=["Admin"])

AdminRequired = Depends(get_current_admin)
SuperadminRequired = Depends(require_role("superadmin", "editor"))


def slugify(text: str) -> str:
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')


# ─── Dashboard ───────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardSummary, dependencies=[AdminRequired])
async def dashboard(db: AsyncSession = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total = (await db.execute(select(func.count()).where(Post.status == PostStatus.published))).scalar()
    pending = (await db.execute(select(func.count()).where(Post.status == PostStatus.pending_approval))).scalar()
    jobs_today = (await db.execute(
        select(func.count()).where(and_(Post.created_at >= today, Post.post_type == 'job'))
    )).scalar()
    active_scrapers = (await db.execute(
        select(func.count()).where(SourceSite.is_active == True)
    )).scalar()
    failed_scrapers = (await db.execute(
        select(func.count()).where(and_(SourceSite.is_active == True, SourceSite.failure_count >= 3))
    )).scalar()
    tg_today = (await db.execute(
        select(func.count()).where(TelegramLog.sent_at >= today)
    )).scalar()

    return DashboardSummary(
        total_posts=total or 0,
        published_posts=total or 0,
        pending_approval=pending or 0,
        jobs_today=jobs_today or 0,
        active_scrapers=active_scrapers or 0,
        failed_scrapers=failed_scrapers or 0,
        telegram_sent_today=tg_today or 0,
    )


# ─── Posts ───────────────────────────────────────────────────────────────────

@router.get("/posts", dependencies=[AdminRequired])
async def admin_list_posts(
    status: PostStatus = None,
    post_type: str = None,
    source_type: SourceType = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Post)
    if status:
        query = query.where(Post.status == status)
    if post_type:
        query = query.where(Post.post_type == post_type)
    if source_type:
        query = query.where(Post.source_type == source_type)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(desc(Post.created_at)).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    posts = result.scalars().all()

    return {"items": posts, "total": total, "page": page, "per_page": per_page}


@router.post("/posts", dependencies=[Depends(require_role("superadmin", "editor"))])
async def create_post(
    data: PostCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    slug = slugify(data.title)
    # Ensure unique slug
    existing = (await db.execute(select(Post).where(Post.slug == slug))).scalar_one_or_none()
    if existing:
        slug = f"{slug}-{hashlib.md5(data.title.encode()).hexdigest()[:6]}"

    post = Post(**data.model_dump(), slug=slug, status=PostStatus.draft)
    db.add(post)
    await db.commit()
    await db.refresh(post)

    await _audit(db, admin["sub"], "post.create", "post", str(post.id))
    return post


@router.put("/posts/{post_id}", dependencies=[Depends(require_role("superadmin", "editor"))])
async def update_post(
    post_id: int,
    data: PostUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

    for k, v in data.model_dump(exclude_none=True).items():
        setattr(post, k, v)

    await db.commit()
    await cache_delete(cache_key("post", post.slug))
    await cache_delete_pattern(cache_key("posts", "*"))
    await _audit(db, admin["sub"], "post.update", "post", str(post_id))
    return post


@router.delete("/posts/{post_id}", dependencies=[Depends(require_role("superadmin"))])
async def delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    post.status = PostStatus.archived
    await db.commit()
    await cache_delete(cache_key("post", post.slug))
    await _audit(db, admin["sub"], "post.archive", "post", str(post_id))
    return {"message": "Post archived"}


@router.post("/posts/{post_id}/publish", dependencies=[Depends(require_role("superadmin", "editor"))])
async def publish_post(
    post_id: int,
    send_telegram: bool = True,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")

    post.status = PostStatus.published
    post.published_at = datetime.utcnow()
    await db.commit()

    # Send Telegram
    if send_telegram and not post.telegram_sent_at:
        try:
            await send_post_to_telegram(post)
            post.telegram_sent_at = datetime.utcnow()
            await db.commit()
        except Exception as e:
            print(f"Telegram send failed: {e}")

    await cache_delete_pattern(cache_key("posts", "*"))
    await cache_delete_pattern(cache_key("trending", "*"))
    await _audit(db, admin["sub"], "post.publish", "post", str(post_id))
    return {"message": "Post published", "telegram_sent": send_telegram}


@router.post("/posts/{post_id}/approve", dependencies=[Depends(require_role("superadmin", "editor", "moderator"))])
async def approve_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    """Approve a third-party sourced post for publishing."""
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    if post.status != PostStatus.pending_approval:
        raise HTTPException(400, "Post is not pending approval")

    post.status = PostStatus.draft  # Now editor can review and publish
    await db.commit()
    await _audit(db, admin["sub"], "post.approve", "post", str(post_id))
    return {"message": "Post approved — ready to publish"}


@router.post("/posts/{post_id}/reject", dependencies=[Depends(require_role("superadmin", "editor", "moderator"))])
async def reject_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    post.status = PostStatus.archived
    await db.commit()
    await _audit(db, admin["sub"], "post.reject", "post", str(post_id))
    return {"message": "Post rejected and archived"}


# ─── Scrapers ────────────────────────────────────────────────────────────────

@router.get("/scrapers", dependencies=[AdminRequired])
async def list_scrapers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SourceSite).order_by(SourceSite.name))
    return result.scalars().all()


@router.post("/scrapers/{site_id}/run", dependencies=[Depends(require_role("superadmin", "editor"))])
async def run_scraper(site_id: int, db: AsyncSession = Depends(get_db)):
    """Manually trigger a scraper for a specific source site."""
    site = (await db.execute(select(SourceSite).where(SourceSite.id == site_id))).scalar_one_or_none()
    if not site:
        raise HTTPException(404, "Source site not found")

    # Import and run the scraper module dynamically
    import importlib
    try:
        module = importlib.import_module(site.scraper_module)
        await module.run(site_id)
        return {"message": f"Scraper for {site.name} triggered successfully"}
    except Exception as e:
        raise HTTPException(500, f"Scraper failed: {str(e)}")


@router.post("/scrapers/{site_id}/toggle", dependencies=[Depends(require_role("superadmin"))])
async def toggle_scraper(site_id: int, db: AsyncSession = Depends(get_db)):
    site = (await db.execute(select(SourceSite).where(SourceSite.id == site_id))).scalar_one_or_none()
    if not site:
        raise HTTPException(404, "Source site not found")
    site.is_active = not site.is_active
    await db.commit()
    return {"message": f"Scraper {'enabled' if site.is_active else 'disabled'}"}


@router.get("/scrapers/logs", dependencies=[AdminRequired])
async def scraper_logs(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ScraperLog).order_by(desc(ScraperLog.started_at)).limit(limit)
    )
    return result.scalars().all()


# ─── Telegram ────────────────────────────────────────────────────────────────

@router.get("/telegram/logs", dependencies=[AdminRequired])
async def telegram_logs(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TelegramLog).order_by(desc(TelegramLog.sent_at)).limit(limit)
    )
    return result.scalars().all()


@router.post("/telegram/send/{post_id}", dependencies=[Depends(require_role("superadmin", "editor"))])
async def manual_telegram_send(post_id: int, db: AsyncSession = Depends(get_db)):
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    try:
        await send_post_to_telegram(post)
        return {"message": "Telegram message sent"}
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")


# ─── Auth ────────────────────────────────────────────────────────────────────

@router.post("/auth/login")
async def login(
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db),
):
    from core.security import verify_password, create_access_token, create_refresh_token
    result = await db.execute(select(Admin).where(Admin.email == email, Admin.is_active == True))
    admin = result.scalar_one_or_none()

    if not admin or not verify_password(password, admin.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    admin.last_login = datetime.utcnow()
    await db.commit()

    token_data = {"sub": str(admin.id), "email": admin.email, "role": admin.role}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
        "admin": AdminOut.model_validate(admin),
    }


@router.get("/auth/me", dependencies=[AdminRequired])
async def me(admin: dict = Depends(get_current_admin)):
    return admin


# ─── Internal helpers ────────────────────────────────────────────────────────

async def _audit(db: AsyncSession, admin_id: str, action: str, entity_type: str, entity_id: str = None):
    log = AuditLog(admin_id=int(admin_id), action=action, entity_type=entity_type, entity_id=entity_id)
    db.add(log)
    await db.commit()
