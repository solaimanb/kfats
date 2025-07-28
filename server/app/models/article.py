from sqlalchemy import Column, String, Text, Enum as SQLEnum, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel
from ..schemas.common import ArticleStatus


class Article(BaseModel):
    """Article database model."""
    __tablename__ = "articles"
    
    title = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(String, nullable=True)
    featured_image_url = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)  # Store as JSON array
    status = Column(SQLEnum(ArticleStatus), default=ArticleStatus.DRAFT, nullable=False)
    author_id = Column(ForeignKey("users.id"), nullable=False)
    views_count = Column(Integer, default=0)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    author = relationship("User", back_populates="articles")
