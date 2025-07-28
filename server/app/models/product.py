from sqlalchemy import Column, String, Text, Enum as SQLEnum, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel
from ..schemas.common import ProductStatus, ProductCategory


class Product(BaseModel):
    """Product database model."""
    __tablename__ = "products"
    
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(SQLEnum(ProductCategory), nullable=False)
    image_urls = Column(JSON, nullable=True)  # Store as JSON array
    stock_quantity = Column(Integer, nullable=True)
    status = Column(SQLEnum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False)
    seller_id = Column(ForeignKey("users.id"), nullable=False)
    
    # Relationships
    seller = relationship("User", back_populates="products")
