from sqlalchemy import Column, String, Text, Enum as SQLEnum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from ..schemas.common import UserRole, UserStatus


class User(BaseModel):
    """User database model."""
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    courses_created = relationship("Course", back_populates="mentor", foreign_keys="Course.mentor_id")
    enrollments = relationship("Enrollment", back_populates="student")
    articles = relationship("Article", back_populates="author", foreign_keys="Article.author_id")
    products = relationship("Product", back_populates="seller", foreign_keys="Product.seller_id")
    role_applications = relationship("RoleApplication", foreign_keys="RoleApplication.user_id", back_populates="applicant")
    reviewed_applications = relationship("RoleApplication", foreign_keys="RoleApplication.reviewed_by")


class RoleApplication(BaseModel):
    """Role application database model."""
    __tablename__ = "role_applications"
    
    user_id = Column(ForeignKey("users.id"), nullable=False)
    requested_role = Column(String, nullable=False)  # mentor, seller, writer
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    reason = Column(Text, nullable=False)  # User's application reason
    application_data = Column(String, nullable=True)  # JSON string for additional details
    admin_notes = Column(Text, nullable=True)  # Admin review notes
    reviewed_by = Column(ForeignKey("users.id"), nullable=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    applicant = relationship("User", foreign_keys=[user_id], back_populates="role_applications")
    reviewer = relationship("User", foreign_keys=[reviewed_by], back_populates="reviewed_applications")
