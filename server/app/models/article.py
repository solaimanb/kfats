from sqlalchemy import Column, String, Text, Enum as SQLEnum, Integer, DateTime, JSON, Boolean
from sqlalchemy.schema import ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from ..schemas.common import ArticleStatus
import re
import unicodedata


def generate_slug(title: str) -> str:
    """Generate a URL-friendly slug from title."""
    # Normalize unicode characters
    slug = unicodedata.normalize('NFKD', title.lower())
    # Remove non-ascii characters
    slug = slug.encode('ascii', 'ignore').decode('ascii')
    # Replace spaces and special characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Remove leading/trailing hyphens and multiple consecutive hyphens
    slug = re.sub(r'^-|-$', '', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug


class Article(BaseModel):
    """Article database model."""
    __tablename__ = "articles"
    
    title = Column(String, nullable=False, index=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(String, index=True, nullable=True)
    featured_image_url = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)
    status = Column(SQLEnum(ArticleStatus), default=ArticleStatus.DRAFT, nullable=False)
    author_id = Column(ForeignKey("users.id"), nullable=False)
    views_count = Column(Integer, default=0)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Admin oversight fields
    admin_notes = Column(Text, nullable=True)
    admin_action_by = Column(ForeignKey("users.id"), nullable=True)
    admin_action_at = Column(DateTime(timezone=True), nullable=True)
    is_featured = Column(Boolean, default=False)
    
    # Relationships
    author = relationship("User", back_populates="articles", foreign_keys=[author_id])
    admin_reviewer = relationship("User", foreign_keys=[admin_action_by])
