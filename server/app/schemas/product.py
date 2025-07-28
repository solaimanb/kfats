from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from .common import ProductStatus, ProductCategory


# Product Models
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: ProductCategory
    image_urls: Optional[List[str]] = None
    stock_quantity: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[ProductCategory] = None
    image_urls: Optional[List[str]] = None
    stock_quantity: Optional[int] = None
    status: Optional[ProductStatus] = None


class Product(ProductBase):
    id: int
    seller_id: int
    status: ProductStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
