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
    
    courses_created = relationship(
        "Course",
        back_populates="mentor",
        primaryjoin="Course.mentor_id==User.id",
    )
    enrollments = relationship("Enrollment", back_populates="student")
    articles = relationship(
        "Article",
        back_populates="author",
        primaryjoin="Article.author_id==User.id",
    )
    products = relationship(
        "Product",
        back_populates="seller",
        primaryjoin="Product.seller_id==User.id",
    )
    role_applications = relationship(
        "RoleApplication",
        back_populates="applicant",
        primaryjoin="RoleApplication.user_id==User.id",
    )
    reviewed_applications = relationship(
        "RoleApplication",
        back_populates="reviewer",
        primaryjoin="RoleApplication.reviewed_by==User.id",
    )
    # orders: orders where this user is the seller
    orders = relationship(
        "Order",
        back_populates="seller",
        primaryjoin="Order.seller_id==User.id",
    )
    # purchases: orders where this user is the buyer
    purchases = relationship(
        "Order",
        back_populates="buyer",
        primaryjoin="Order.buyer_id==User.id",
    )


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
