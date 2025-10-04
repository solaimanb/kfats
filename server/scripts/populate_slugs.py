import asyncio
import re
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import AsyncSessionLocal
from app.models.article import Article, generate_slug
from app.models.course import Course
from app.models.product import Product


def normalize_slug(text: str) -> str:
    """Generate a URL-friendly slug from text."""
    if not text:
        return ""
    # Normalize unicode characters
    import unicodedata
    slug = unicodedata.normalize('NFKD', text.lower())
    # Remove non-ascii characters
    slug = slug.encode('ascii', 'ignore').decode('ascii')
    # Replace spaces and special characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Remove leading/trailing hyphens and multiple consecutive hyphens
    slug = re.sub(r'^-|-$', '', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug


async def ensure_unique_slug(db: AsyncSession, model_class, base_slug: str, exclude_id: Optional[int] = None) -> str:
    """Ensure slug is unique for the given model."""
    slug = base_slug
    counter = 1
    while True:
        query = select(model_class).where(model_class.slug == slug)
        if exclude_id:
            query = query.where(model_class.id != exclude_id)
        result = await db.execute(query)
        existing = result.scalars().first()
        if not existing:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


async def populate_article_slugs(db: AsyncSession):
    """Populate missing slugs for articles."""
    print("🔄 Populating article slugs...")
    result = await db.execute(select(Article).where(Article.slug.is_(None)))
    articles = result.scalars().all()

    for article in articles:
        base_slug = generate_slug(str(article.title))
        unique_slug = await ensure_unique_slug(db, Article, base_slug)
        await db.execute(
            update(Article).where(Article.id == article.id).values(slug=unique_slug)
        )
        print(f"  ✅ Updated article {article.id}: '{article.title}' -> '{unique_slug}'")

    await db.commit()
    print(f"📝 Updated {len(articles)} articles with slugs")


async def populate_course_slugs(db: AsyncSession):
    """Populate missing slugs for courses."""
    print("🔄 Populating course slugs...")
    result = await db.execute(select(Course).where(Course.slug.is_(None)))
    courses = result.scalars().all()

    for course in courses:
        base_slug = normalize_slug(str(course.title))
        unique_slug = await ensure_unique_slug(db, Course, base_slug)
        await db.execute(
            update(Course).where(Course.id == course.id).values(slug=unique_slug)
        )
        print(f"  ✅ Updated course {course.id}: '{course.title}' -> '{unique_slug}'")

    await db.commit()
    print(f"📚 Updated {len(courses)} courses with slugs")


async def populate_product_slugs(db: AsyncSession):
    """Populate missing slugs for products."""
    print("🔄 Populating product slugs...")
    result = await db.execute(select(Product).where(Product.slug.is_(None)))
    products = result.scalars().all()

    for product in products:
        base_slug = normalize_slug(str(product.name))
        unique_slug = await ensure_unique_slug(db, Product, base_slug)
        await db.execute(
            update(Product).where(Product.id == product.id).values(slug=unique_slug)
        )
        print(f"  ✅ Updated product {product.id}: '{product.name}' -> '{unique_slug}'")

    await db.commit()
    print(f"🛍️  Updated {len(products)} products with slugs")


async def main():
    """Main function to populate all missing slugs."""
    print("🚀 Starting slug population script...")

    async with AsyncSessionLocal() as db:
        try:
            await populate_article_slugs(db)
            await populate_course_slugs(db)
            await populate_product_slugs(db)
            print("🎉 Slug population completed successfully!")
        except Exception as e:
            print(f"❌ Error during slug population: {e}")
            await db.rollback()
        finally:
            await db.close()


if __name__ == "__main__":
    asyncio.run(main())