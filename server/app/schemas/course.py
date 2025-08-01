from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from .common import CourseStatus, CourseLevel, EnrollmentStatus


# Course Models
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
    status: Optional[CourseStatus] = CourseStatus.DRAFT


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
class EnrollmentBase(BaseModel):
    course_id: int


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    status: Optional[EnrollmentStatus] = None
    progress_percentage: Optional[float] = None


class Enrollment(EnrollmentBase):
    id: int
    student_id: int
    status: EnrollmentStatus
    progress_percentage: float
    enrolled_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
