# Import all models for easy access
from .base import Base, BaseModel
from .user import User, RoleApplication
from .course import Course, Enrollment
from .article import Article
from .product import Product

# Export all models
__all__ = [
    "Base",
    "BaseModel", 
    "User",
    "RoleApplication",
    "Course", 
    "Enrollment",
    "Article",
    "Product"
]
