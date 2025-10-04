from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from .common import UserRole


class ContentActionRequest(BaseModel):
    action: str  # "publish", "unpublish", "archive"
    admin_notes: Optional[str] = None
    reason: Optional[str] = None


class AdminNotesRequest(BaseModel):
    notes: str
    is_private: bool = True  # Whether notes are visible to content creator


class ContentOverviewItem(BaseModel):
    id: int
    title: str
    slug: Optional[str] = None
    type: str  # "article", "course", "product"
    status: str
    author_id: int
    author_name: str
    author_role: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    views_count: int = 0
    is_featured: bool = False
    admin_notes: Optional[str] = None
    admin_action_by: Optional[int] = None
    admin_action_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContentStats(BaseModel):
    total_published: int
    total_unpublished: int
    total_drafts: int
    total_archived: int
    total_featured: int
    recent_activity: List[dict]
    by_type: dict  # {"articles": count, "courses": count, "products": count}
    by_author_role: dict  # {"writer": count, "mentor": count, "seller": count}


class ContentActivityItem(BaseModel):
    id: int
    content_type: str
    content_id: int
    content_title: str
    action: str  # "created", "published", "unpublished", "featured", etc.
    performed_by: int
    performed_by_name: str
    performed_by_role: str
    timestamp: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True
