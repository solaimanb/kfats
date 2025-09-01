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
    DRAFT = "draft"           # Seller working on it
    ACTIVE = "active"         # Available for purchase (published)
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


class ErrorDetail(BaseModel):
    """Detailed error information"""
    field: Optional[str] = None
    message: str
    type: Optional[str] = None


class ErrorResponse(BaseModel):
    """Enhanced error response with detailed information"""
    success: bool = False
    error: dict


class ValidationErrorResponse(BaseModel):
    """Response for validation errors"""
    success: bool = False
    error: dict


class DatabaseErrorResponse(BaseModel):
    """Response for database errors"""
    success: bool = False
    error: dict


class AuthenticationErrorResponse(BaseModel):
    """Response for authentication errors"""
    success: bool = False
    error: dict


class AuthorizationErrorResponse(BaseModel):
    """Response for authorization errors"""
    success: bool = False
    error: dict


class NotFoundErrorResponse(BaseModel):
    """Response for resource not found errors"""
    success: bool = False
    error: dict


class BusinessLogicErrorResponse(BaseModel):
    """Response for business logic errors"""
    success: bool = False
    error: dict


class RateLimitErrorResponse(BaseModel):
    """Response for rate limiting errors"""
    success: bool = False
    error: dict


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
