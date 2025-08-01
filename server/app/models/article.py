from sqlalchemy import Column, String, Text, Enum as SQLEnum, Integer, ForeignKey, DateTime, JSON, Boolean
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
