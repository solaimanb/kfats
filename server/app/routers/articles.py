from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_async_db
from app.models.article import Article as DBArticle
from app.models.user import User as DBUser
from app.schemas.article import Article, ArticleCreate, ArticleUpdate
from app.schemas.common import ArticleStatus, UserRole, SuccessResponse, PaginatedResponse
from app.schemas.user import User
from app.core.dependencies import get_current_active_user, get_writer_or_admin

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.post("/", response_model=Article)
async def create_article(
    article_data: ArticleCreate,
    current_user: User = Depends(get_writer_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Create a new article (Writer/Admin only)."""
    
    # Default to published for approved writers, unless explicitly set as draft
    default_status = article_data.status if hasattr(article_data, 'status') and article_data.status else ArticleStatus.PUBLISHED
    
    db_article = DBArticle(
        **article_data.model_dump(exclude={'status'}),
        author_id=current_user.id,
        status=default_status,
        published_at=datetime.utcnow() if default_status == ArticleStatus.PUBLISHED else None
    )
    
    db.add(db_article)
    await db.commit()
    await db.refresh(db_article)
    
    return Article.model_validate(db_article)


@router.get("/", response_model=PaginatedResponse[Article])
async def get_articles(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[ArticleStatus] = None,
    author_id: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """Get paginated list of articles."""
    
    query = db.query(DBArticle)
    
    # Only show published articles to regular users
    query = query.filter(DBArticle.status == ArticleStatus.PUBLISHED)
    
    if author_id:
        query = query.filter(DBArticle.author_id == author_id)
    
    # Get total count
    count_query = query.with_entities(func.count(DBArticle.id))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    skip = (page - 1) * size
    result = await db.execute(query.offset(skip).limit(size))
    articles = result.scalars().all()
    
    return PaginatedResponse(
        items=[Article.model_validate(article) for article in articles],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
    )


@router.get("/my-articles", response_model=PaginatedResponse[Article])
async def get_my_articles(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_writer_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Get paginated articles created by current writer."""
    
    # Build base query
    query = db.query(DBArticle).filter(DBArticle.author_id == current_user.id)
    
    # Get total count
    count_query = query.with_entities(func.count(DBArticle.id))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    skip = (page - 1) * size
    result = await db.execute(query.offset(skip).limit(size))
    articles = result.scalars().all()
    
    return PaginatedResponse(
        items=[Article.model_validate(article) for article in articles],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
    )


@router.get("/{article_id}", response_model=Article)
async def get_article(article_id: int, db: AsyncSession = Depends(get_async_db)):
    """Get article by ID."""
    
    result = await db.execute(
        db.query(DBArticle).filter(DBArticle.id == article_id)
    )
    article = result.scalars().first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    # Increment view count
    article.views_count += 1
    await db.commit()
    
    return Article.model_validate(article)


@router.put("/{article_id}", response_model=Article)
async def update_article(
    article_id: int,
    article_update: ArticleUpdate,
    current_user: User = Depends(get_writer_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Update article (only by article author or admin)."""
    
    result = await db.execute(
        db.query(DBArticle).filter(DBArticle.id == article_id)
    )
    article = result.scalars().first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    # Check ownership
    if current_user.role != UserRole.ADMIN and article.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own articles"
        )
    
    # Update fields
    update_data = article_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(article, field, value)
    
    # Set published_at when status changes to published
    if article_update.status == ArticleStatus.PUBLISHED and article.published_at is None:
        from datetime import datetime
        article.published_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(article)
    
    return Article.model_validate(article)


@router.delete("/{article_id}", response_model=SuccessResponse)
async def delete_article(
    article_id: int,
    current_user: User = Depends(get_writer_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete article (only by article author or admin)."""
    
    result = await db.execute(
        db.query(DBArticle).filter(DBArticle.id == article_id)
    )
    article = result.scalars().first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    # Check ownership
    if current_user.role != UserRole.ADMIN and article.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own articles"
        )
    
    await db.delete(article)
    await db.commit()
    
    return SuccessResponse(
        message="Article deleted successfully",
        data={"article_id": article_id}
    )
