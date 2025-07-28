from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.models import UserRole, UserStatus, CourseStatus, CourseLevel, EnrollmentStatus, ArticleStatus, ProductStatus, ProductCategory
from app.config import settings

# PostgreSQL connection configuration with best practices
engine = create_engine(
    settings.database_url,
    # Connection pool settings for PostgreSQL
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600,
    # PostgreSQL specific settings
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
        "application_name": "KFATS_LMS_API",
    },
    echo=settings.debug  # Log SQL queries in debug mode
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    courses_created = relationship("Course", back_populates="mentor", foreign_keys="Course.mentor_id")
    enrollments = relationship("Enrollment", back_populates="student")
    articles = relationship("Article", back_populates="author")
    products = relationship("Product", back_populates="seller")


class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    short_description = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    level = Column(SQLEnum(CourseLevel), nullable=False)
    price = Column(Float, nullable=False)
    duration_hours = Column(Integer, nullable=True)
    max_students = Column(Integer, nullable=True)
    status = Column(SQLEnum(CourseStatus), default=CourseStatus.DRAFT, nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    enrolled_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    mentor = relationship("User", back_populates="courses_created", foreign_keys=[mentor_id])
    enrollments = relationship("Enrollment", back_populates="course")


class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    status = Column(SQLEnum(EnrollmentStatus), default=EnrollmentStatus.ACTIVE, nullable=False)
    progress_percentage = Column(Float, default=0.0)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(String, nullable=True)
    featured_image_url = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)  # Store as JSON array
    status = Column(SQLEnum(ArticleStatus), default=ArticleStatus.DRAFT, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    author = relationship("User", back_populates="articles")


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(SQLEnum(ProductCategory), nullable=False)
    image_urls = Column(JSON, nullable=True)  # Store as JSON array
    stock_quantity = Column(Integer, nullable=True)
    status = Column(SQLEnum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    seller = relationship("User", back_populates="products")


# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)
