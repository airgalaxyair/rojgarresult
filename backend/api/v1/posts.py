from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, or_
from db.database import get_db
from models.models import Post, PostType, PostStatus
from schemas.schemas import PostListItem, PostDetail, PaginatedResponse
from core.cache import cache_get, cache_set, cache_key
from core.config import settings

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("", response_model=PaginatedResponse)
async def list_posts(
    post_type: Optional[PostType] = None,
    category_slug: Optional[str] = None,
    department_slug: Optional[str] = None,
    state_slug: Optional[str] = None,
    featured: Optional[bool] = None,
    trending: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    cache_k = cache_key("posts", str(post_type), str(category_slug), str(department_slug), str(page))
    cached = await cache_get(cache_k)
    if cached:
        return cached

    query = select(Post).where(Post.status == PostStatus.published)

    if post_type:
        query = query.where(Post.post_type == post_type)
    if featured is not None:
        query = query.where(Post.is_featured == featured)
    if trending is not None:
        query = query.where(Post.is_trending == trending)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = query.order_by(desc(Post.published_at)).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query.options())
    posts = result.scalars().all()

    response = {
        "items": [PostListItem.model_validate(p).model_dump() for p in posts],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }
    await cache_set(cache_k, response, settings.CACHE_TTL_LISTING)
    return response


@router.get("/trending", response_model=list[PostListItem])
async def get_trending(limit: int = 10, db: AsyncSession = Depends(get_db)):
    cache_k = cache_key("trending", str(limit))
    cached = await cache_get(cache_k)
    if cached:
        return cached

    query = (
        select(Post)
        .where(and_(Post.status == PostStatus.published, Post.is_trending == True))
        .order_by(desc(Post.view_count))
        .limit(limit)
    )
    result = await db.execute(query)
    posts = result.scalars().all()
    data = [PostListItem.model_validate(p).model_dump() for p in posts]
    await cache_set(cache_k, data, settings.CACHE_TTL_HOMEPAGE)
    return data


@router.get("/deadline-soon", response_model=list[PostListItem])
async def deadline_soon(days: int = 7, db: AsyncSession = Depends(get_db)):
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    deadline = now + timedelta(days=days)

    query = (
        select(Post)
        .where(
            and_(
                Post.status == PostStatus.published,
                Post.post_type == PostType.job,
                Post.application_end >= now,
                Post.application_end <= deadline,
            )
        )
        .order_by(Post.application_end)
        .limit(10)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/search", response_model=list[PostListItem])
async def search_posts(
    q: str = Query(..., min_length=2, max_length=100),
    post_type: Optional[PostType] = None,
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    search_term = f"%{q}%"
    query = select(Post).where(
        and_(
            Post.status == PostStatus.published,
            or_(Post.title.ilike(search_term), Post.description.ilike(search_term)),
        )
    )
    if post_type:
        query = query.where(Post.post_type == post_type)
    query = query.order_by(desc(Post.published_at)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{slug}", response_model=PostDetail)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    cache_k = cache_key("post", slug)
    cached = await cache_get(cache_k)
    if cached:
        return cached

    result = await db.execute(select(Post).where(Post.slug == slug))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.status != PostStatus.published:
        raise HTTPException(status_code=404, detail="Post not found")

    # Increment view count
    post.view_count += 1
    await db.commit()

    data = PostDetail.model_validate(post).model_dump()
    await cache_set(cache_k, data, settings.CACHE_TTL_POST)
    return data
