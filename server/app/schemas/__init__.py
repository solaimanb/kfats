# Import all schemas for easy access
from .common import *
from .user import *
from .auth import *
from .course import *
from .article import *
from .product import *
from .content_management import *

# Export commonly used items
__all__ = [
    # Enums
    "UserRole", "UserStatus", "CourseStatus", "CourseLevel", "EnrollmentStatus",
    "ArticleStatus", "ProductStatus", "ProductCategory", "RoleApplicationStatus",
    "RoleUpgradeType", "ApplicationableRole",
    
    # Common schemas
    "SuccessResponse", "ErrorResponse", "PaginatedResponse", "RoleUpgradeRequest",
    
    # Auth schemas
    "Token", "TokenData", "LoginRequest", "RegisterRequest",
    
    # User schemas
    "User", "UserBase", "UserCreate", "UserUpdate", "UserInDB",
    "RoleApplication", "RoleApplicationBase", "RoleApplicationCreate", 
    "RoleApplicationUpdate", "RoleApplicationInDB",
    
    # Course schemas
    "Course", "CourseBase", "CourseCreate", "CourseUpdate",
    "Enrollment", "EnrollmentBase", "EnrollmentCreate", "EnrollmentUpdate",
    
    # Article schemas
    "Article", "ArticleBase", "ArticleCreate", "ArticleUpdate",
    
    # Product schemas  
    "Product", "ProductBase", "ProductCreate", "ProductUpdate",
    
    # Content Management schemas
    "ContentActionRequest", "AdminNotesRequest", "ContentOverviewItem", 
    "ContentStats", "ContentActivityItem",
]
