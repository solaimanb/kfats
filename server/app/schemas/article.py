from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from .common import ArticleStatus


# Article Models
class ArticleBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    featured_image_url: Optional[str] = None
    tags: Optional[List[str]] = None


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[ArticleStatus] = None


class Article(ArticleBase):
    id: int
    slug: str
    author_id: int
    status: ArticleStatus
    views_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True
