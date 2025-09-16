from sqlalchemy import Column, String, Text, Enum as SQLEnum, Float, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel, Base
from ..schemas.common import CourseStatus, CourseLevel, EnrollmentStatus


class Course(BaseModel):
    """Course database model."""
    __tablename__ = "courses"
    
    title = Column(String, nullable=False, index=True)
    slug = Column(String, nullable=True, unique=True, index=True)
    description = Column(Text, index=True, nullable=False)
    short_description = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    level = Column(SQLEnum(CourseLevel), nullable=False)
    price = Column(Float, nullable=False)
    duration_hours = Column(Float, nullable=True, default=None)  # Calculated from content
    max_students = Column(Integer, nullable=True)
    status = Column(SQLEnum(CourseStatus), default=CourseStatus.DRAFT, nullable=False)
    mentor_id = Column(ForeignKey("users.id"), nullable=False)
    enrolled_count = Column(Integer, default=0)
    
    # Admin oversight fields
    admin_notes = Column(Text, nullable=True)
    admin_action_by = Column(ForeignKey("users.id"), nullable=True)
    admin_action_at = Column(DateTime(timezone=True), nullable=True)
    is_featured = Column(Boolean, default=False)
    
    # Relationships
    mentor = relationship("User", back_populates="courses_created", foreign_keys=[mentor_id])
    enrollments = relationship("Enrollment", back_populates="course")
    admin_reviewer = relationship("User", foreign_keys=[admin_action_by])


class Enrollment(Base):
    """Course enrollment database model."""
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(ForeignKey("users.id"), index=True, nullable=False)
    course_id = Column(ForeignKey("courses.id"), index=True, nullable=False)
    status = Column(SQLEnum(EnrollmentStatus), index=True, default=EnrollmentStatus.ACTIVE, nullable=False)
    progress_percentage = Column(Float, default=0.0)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
