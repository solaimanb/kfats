from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


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


# User Models
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.USER


class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserInDB(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    hashed_password: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# Authentication Models
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: User


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(UserCreate):
    confirm_password: str


# Course Models
class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CourseBase(BaseModel):
    title: str
    description: str
    short_description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    level: CourseLevel
    price: float
    duration_hours: Optional[int] = None
    max_students: Optional[int] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    level: Optional[CourseLevel] = None
    price: Optional[float] = None
    duration_hours: Optional[int] = None
    max_students: Optional[int] = None
    status: Optional[CourseStatus] = None


class Course(CourseBase):
    id: int
    mentor_id: int
    status: CourseStatus
    enrolled_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Enrollment Models
class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"
    SUSPENDED = "suspended"


class EnrollmentCreate(BaseModel):
    course_id: int


class Enrollment(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: EnrollmentStatus
    progress_percentage: float
    enrolled_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Blog/Article Models
class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


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
    author_id: int
    status: ArticleStatus
    views_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Product Models (for sellers)
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


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: ProductCategory
    image_urls: Optional[List[str]] = None
    stock_quantity: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[ProductCategory] = None
    image_urls: Optional[List[str]] = None
    stock_quantity: Optional[int] = None
    status: Optional[ProductStatus] = None


class Product(ProductBase):
    id: int
    seller_id: int
    status: ProductStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Response Models
class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[dict] = None
