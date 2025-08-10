from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class MonthlyEnrollment(BaseModel):
    month: str  # e.g., "2025-08"
    count: int


class CoursePerformanceItem(BaseModel):
    course_id: int
    title: str
    enrolled_count: int
    avg_completion: float
    status: str
    created_at: datetime
    last_updated: datetime


class MentorOverview(BaseModel):
    total_courses: int
    total_students: int
    enrollments_last_30d: int
    avg_completion: float
    monthly_enrollments: List[MonthlyEnrollment]


class MentorOverviewResponse(BaseModel):
    overview: MentorOverview
    course_performance: List[CoursePerformanceItem]


class MentorStudentItem(BaseModel):
    user_id: int
    full_name: str
    email: str
    course_id: int
    course_title: str
    enrolled_at: datetime
    progress_percentage: float
    status: str


class MentorActivityItem(BaseModel):
    type: str  # "course_created" | "student_enrolled" | "course_completed"
    description: str
    timestamp: datetime
    course_id: int
    course_title: str
    user_id: Optional[int] = None
    student_name: Optional[str] = None
