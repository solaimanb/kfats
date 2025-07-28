from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_db
from app.models.product import Product as DBProduct
from app.models.user import User as DBUser
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.schemas.common import ProductStatus, ProductCategory, UserRole, SuccessResponse
from app.schemas.user import User
from app.core.dependencies import get_current_active_user, get_seller_or_admin

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_seller_or_admin),
    db: Session = Depends(get_db)
):
    """Create a new product (Seller/Admin only)."""
    
    db_product = DBProduct(
        **product_data.model_dump(),
        seller_id=current_user.id,
        status=ProductStatus.ACTIVE
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return Product.model_validate(db_product)


@router.get("/", response_model=List[Product])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[ProductCategory] = None,
    seller_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get list of products."""
    
    query = db.query(DBProduct).filter(DBProduct.status == ProductStatus.ACTIVE)
    
    if category:
        query = query.filter(DBProduct.category == category)
    
    if seller_id:
        query = query.filter(DBProduct.seller_id == seller_id)
    
    if min_price is not None:
        query = query.filter(DBProduct.price >= min_price)
    
    if max_price is not None:
        query = query.filter(DBProduct.price <= max_price)
    
    products = query.offset(skip).limit(limit).all()
    return [Product.model_validate(product) for product in products]


@router.get("/my-products", response_model=List[Product])
async def get_my_products(
    current_user: User = Depends(get_seller_or_admin),
    db: Session = Depends(get_db)
):
    """Get products created by current seller."""
    
    products = db.query(DBProduct).filter(DBProduct.seller_id == current_user.id).all()
    return [Product.model_validate(product) for product in products]


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID."""
    
    product = db.query(DBProduct).filter(
        DBProduct.id == product_id,
        DBProduct.status == ProductStatus.ACTIVE
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return Product.model_validate(product)


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(get_seller_or_admin),
    db: Session = Depends(get_db)
):
    """Update product (only by product seller or admin)."""
    
    product = db.query(DBProduct).filter(DBProduct.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership
    if current_user.role != UserRole.ADMIN and product.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own products"
        )
    
    # Update fields
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    
    return Product.model_validate(product)


@router.delete("/{product_id}", response_model=SuccessResponse)
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_seller_or_admin),
    db: Session = Depends(get_db)
):
    """Delete product (only by product seller or admin)."""
    
    product = db.query(DBProduct).filter(DBProduct.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership
    if current_user.role != UserRole.ADMIN and product.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own products"
        )
    
    db.delete(product)
    db.commit()
    
    return SuccessResponse(
        message="Product deleted successfully",
        data={"product_id": product_id}
    )
