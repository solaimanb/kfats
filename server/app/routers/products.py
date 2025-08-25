from typing import List, Optional
import math
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.models.product import Product as DBProduct
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.schemas.common import (
    ProductStatus,
    ProductCategory,
    UserRole,
    SuccessResponse,
    PaginatedResponse,
)
from app.schemas.user import User
from app.core.dependencies import get_seller_or_admin

router = APIRouter(prefix="/products", tags=["Products"])


def _slugify(value: str) -> str:
    return str(value).lower()


def _normalize_to_slug(text: str) -> str:
    """Return a URL-friendly, hyphen-separated slug.

    - lowercases
    - removes characters except a-z0-9, spaces and hyphens
    - collapses whitespace and hyphens to single '-'
    - strips leading/trailing hyphens
    """
    import re

    if not text:
        return ""
    s = text.lower()
    # remove characters we don't want
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    # replace whitespace with single hyphen
    s = re.sub(r"[\s]+", "-", s)
    # collapse multiple hyphens
    s = re.sub(r"-+", "-", s)
    s = s.strip("-")
    return s


async def _ensure_unique_slug(db: AsyncSession, base_slug: str) -> str:
    slug = base_slug
    ix = 1
    while True:
        stmt = select(DBProduct).where(DBProduct.slug == slug).limit(1)
        res = await db.execute(stmt)
        exists = res.scalars().first()
        if not exists:
            break
        ix += 1
        slug = f"{base_slug}-{ix}"
    return slug


@router.post("/", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_seller_or_admin),
    db: AsyncSession = Depends(get_async_db),
):
    """Create a new product (Seller/Admin only)."""

    payload = product_data.model_dump()
    # Generate or normalize slug server-side
    provided_slug = (payload.get("slug") or "").strip() if payload else ""
    if provided_slug:
        slug = _normalize_to_slug(provided_slug)
    else:
        slug = _normalize_to_slug(payload.get("name", ""))
    # Ensure uniqueness
    slug = await _ensure_unique_slug(db, slug)
    payload["slug"] = slug

    db_product = DBProduct(
        **payload, seller_id=current_user.id, status=ProductStatus.ACTIVE
    )

    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)

    return Product.model_validate(db_product)


@router.get("/", response_model=PaginatedResponse)
async def get_products(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: Optional[ProductCategory] = None,
    seller_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: AsyncSession = Depends(get_async_db),
):
    """Get list of products."""

    # Build base statement
    where_clauses = [DBProduct.status == ProductStatus.ACTIVE]
    if category:
        where_clauses.append(DBProduct.category == category)
    if seller_id:
        where_clauses.append(DBProduct.seller_id == seller_id)
    if min_price is not None:
        where_clauses.append(DBProduct.price >= min_price)
    if max_price is not None:
        where_clauses.append(DBProduct.price <= max_price)

    skip = (page - 1) * size
    limit = size

    # total count
    count_stmt = select(func.count()).select_from(DBProduct).where(*where_clauses)
    total = await db.scalar(count_stmt) or 0

    # fetch rows
    stmt = select(DBProduct).where(*where_clauses).offset(skip).limit(limit)
    res = await db.execute(stmt)
    products = res.scalars().all()

    pages = math.ceil(total / size) if size > 0 else 1

    return PaginatedResponse(
        items=[Product.model_validate(product) for product in products],
        total=int(total),
        page=page,
        size=size,
        pages=pages,
    )


@router.get("/my-products", response_model=List[Product])
async def get_my_products(
    current_user: User = Depends(get_seller_or_admin),
    db: AsyncSession = Depends(get_async_db),
):
    """Get products created by current seller."""

    stmt = select(DBProduct).where(DBProduct.seller_id == current_user.id)
    res = await db.execute(stmt)
    products = res.scalars().all()
    return [Product.model_validate(product) for product in products]


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: int, db: AsyncSession = Depends(get_async_db)):
    """Get product by ID."""

    stmt = select(DBProduct).where(
        DBProduct.id == product_id, DBProduct.status == ProductStatus.ACTIVE
    )
    res = await db.execute(stmt)
    product = res.scalars().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    return Product.model_validate(product)


@router.get("/slug/{slug}", response_model=Product)
async def get_product_by_slug(slug: str, db: AsyncSession = Depends(get_async_db)):
    """Get product by slug (slug is derived from product name)."""
    normalized = slug.lower()

    # Try to match a slugified name (replace spaces with '-') or match name directly
    stmt = select(DBProduct).where(
        DBProduct.status == ProductStatus.ACTIVE,
        func.lower(func.replace(DBProduct.name, " ", "-")) == normalized,
    )
    res = await db.execute(stmt)
    product = res.scalars().first()

    # fallback: try matching by exact lowercased name
    if not product:
        stmt = select(DBProduct).where(
            DBProduct.status == ProductStatus.ACTIVE,
            func.lower(DBProduct.name) == normalized.replace("-", " "),
        )
        res = await db.execute(stmt)
        product = res.scalars().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    return Product.model_validate(product)


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(get_seller_or_admin),
    db: AsyncSession = Depends(get_async_db),
):
    """Update product (only by product seller or admin)."""

    stmt = select(DBProduct).where(DBProduct.id == product_id)
    res = await db.execute(stmt)
    product = res.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    # Check ownership
    seller_id = getattr(product, "seller_id", None)
    if current_user.role != UserRole.ADMIN and seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own products",
        )

    # Update fields
    update_data = product_update.model_dump(exclude_unset=True)
    # If slug provided or name updated, regenerate/normalize and ensure uniqueness
    if "slug" in update_data or "name" in update_data:
        base = (
            update_data.get("slug")
            or update_data.get("name")
            or getattr(product, "name", "")
        )
        normalized = _normalize_to_slug(base)
        # if the normalized slug is same as current product.slug or empty, skip
        if normalized and normalized != getattr(product, "slug", None):
            unique = await _ensure_unique_slug(db, normalized)
            update_data["slug"] = unique
    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)

    return Product.model_validate(product)


@router.put("/{product_id}/stock", response_model=Product)
async def update_product_stock(
    product_id: int,
    stock_update: ProductUpdate,
    current_user: User = Depends(get_seller_or_admin),
    db: AsyncSession = Depends(get_async_db),
):
    """Update only the stock quantity of a product (seller or admin)."""
    stmt = select(DBProduct).where(DBProduct.id == product_id)
    res = await db.execute(stmt)
    product = res.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    # Check ownership
    seller_id = getattr(product, "seller_id", None)
    if current_user.role != UserRole.ADMIN and seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update stock for your own products",
        )

    if stock_update.stock_quantity is not None:
        setattr(product, "stock_quantity", stock_update.stock_quantity)

    await db.commit()
    await db.refresh(product)
    return Product.model_validate(product)


@router.delete("/{product_id}", response_model=SuccessResponse)
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_seller_or_admin),
    db: AsyncSession = Depends(get_async_db),
):
    """Delete product (only by product seller or admin)."""

    stmt = select(DBProduct).where(DBProduct.id == product_id)
    res = await db.execute(stmt)
    product = res.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    # Check ownership
    seller_id = getattr(product, "seller_id", None)
    if current_user.role != UserRole.ADMIN and seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own products",
        )

    await db.delete(product)
    await db.commit()

    return SuccessResponse(
        message="Product deleted successfully", data={"product_id": product_id}
    )


@router.get("/category/{category}", response_model=List[Product])
async def get_products_by_category(
    category: ProductCategory, db: AsyncSession = Depends(get_async_db)
):
    """Get products by category."""
    stmt = select(DBProduct).where(
        DBProduct.category == category, DBProduct.status == ProductStatus.ACTIVE
    )
    res = await db.execute(stmt)
    products = res.scalars().all()
    return [Product.model_validate(product) for product in products]
