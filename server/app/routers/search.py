from typing import List, Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_
from app.core.database import get_async_db
from app.models.article import Article as DBArticle
from app.models.course import Course as DBCourse
from app.models.product import Product as DBProduct

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("/", response_model=List[dict])
async def global_search(
    query: str = Query(..., min_length=2),
    type: Optional[str] = Query(None, regex="^(user|article|course|product|all)$"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Global search across users, articles, courses, and products.
    Returns a unified list of results with type, id, title/name, and snippet.
    """
    results = []
    search_term = f"%{query}%"

    # Articles
    if type in (None, "all", "article"):
        article_result = await db.execute(
            db.query(DBArticle).filter(
                or_(
                    DBArticle.title.ilike(search_term),
                    DBArticle.content.ilike(search_term),
                    DBArticle.excerpt.ilike(search_term)
                )
            ).limit(limit)
        )
        articles = article_result.scalars().all()
        for article in articles:
            results.append({
                "type": "article",
                "id": article.id,
                "title": article.title,
                "snippet": (article.excerpt or article.content[:100]) if article.content else ""
            })

    # Courses
    if type in (None, "all", "course"):
        course_result = await db.execute(
            db.query(DBCourse).filter(
                or_(
                    DBCourse.title.ilike(search_term),
                    DBCourse.description.ilike(search_term)
                )
            ).limit(limit)
        )
        courses = course_result.scalars().all()
        for course in courses:
            results.append({
                "type": "course",
                "id": course.id,
                "title": course.title,
                "snippet": course.description[:100] if course.description else ""
            })

    # Products
    if type in (None, "all", "product"):
        product_result = await db.execute(
            db.query(DBProduct).filter(
                or_(
                    DBProduct.name.ilike(search_term),
                    DBProduct.description.ilike(search_term)
                )
            ).limit(limit)
        )
        products = product_result.scalars().all()
        for product in products:
            results.append({
                "type": "product",
                "id": product.id,
                "title": product.name,
                "snippet": product.description[:100] if product.description else ""
            })

    # Optionally sort or deduplicate results here
    return results[:limit]
