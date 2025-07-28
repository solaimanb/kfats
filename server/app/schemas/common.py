from enum import Enum
from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel


# User Enums
class UserRole(str, Enum):
    USER = "user"
    STUDENT = "student"
    MENTOR = "mentor"
    SELLER = "seller"
    WRITER = "writer"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


# Course Enums
class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    SUSPENDED = "suspended"


# Article Enums
class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# Product Enums
class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"


class ProductCategory(str, Enum):
    PAINTING = "painting"
    SCULPTURE = "sculpture"
    DIGITAL_ART = "digital_art"
    PHOTOGRAPHY = "photography"
    CRAFTS = "crafts"
    OTHER = "other"


# Role Application Enums
class RoleApplicationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class RoleUpgradeType(str, Enum):
    AUTOMATIC = "automatic"     # System-triggered (user → student)
    APPLICATION = "application" # Admin-approved (mentor/seller/writer)


class ApplicationableRole(str, Enum):
    """Roles that require admin approval"""
    MENTOR = "mentor"
    SELLER = "seller"
    WRITER = "writer"


# Generic Response Models
T = TypeVar('T')


class SuccessResponse(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None
    success: bool = True


class ErrorResponse(BaseModel):
    message: str
    error: Optional[str] = None
    success: bool = False


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int


# Role Upgrade Request (for automatic upgrades)
class RoleUpgradeRequest(BaseModel):
    target_role: UserRole
    upgrade_type: RoleUpgradeType = RoleUpgradeType.AUTOMATIC
    trigger_reason: Optional[str] = None  # e.g., "course_enrollment"
