from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, TypedDict

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.core.dependencies import get_mentor_or_admin
from app.models.course import Course as DBCourse, Enrollment as DBEnrollment
from app.models.user import User as DBUser
from app.schemas.mentor import (
    CoursePerformanceItem,
    MentorActivityItem,
    MentorOverview,
    MentorOverviewResponse,
    MentorStudentItem,
    MonthlyEnrollment,
)
from app.schemas.user import User


class CoursePerformanceData(TypedDict):
    """Type definition for course performance data."""
    enrolled: int
    avg_completion: float

router = APIRouter(prefix="/mentors", tags=["Mentors"])


@router.get("/me/overview", response_model=MentorOverviewResponse)
async def get_mentor_overview(
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
) -> MentorOverviewResponse:
    """Get comprehensive overview statistics for a mentor.

    Returns total courses, students, enrollments, completion rates,
    and monthly enrollment trends for the authenticated mentor.
    """
    # Total courses count
    courses_count_result = await db.execute(
        select(func.count(DBCourse.id)).where(
            DBCourse.mentor_id == current_user.id
        )
    )
    total_courses = courses_count_result.scalar()

    # Total unique students across all mentor's courses
    students_result = await db.execute(
        select(func.count(distinct(DBEnrollment.student_id)))
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .where(DBCourse.mentor_id == current_user.id)
    )
    total_students = students_result.scalar() or 0

    # Enrollments in the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_enrollments_result = await db.execute(
        select(func.count(DBEnrollment.id))
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .where(
            and_(
                DBCourse.mentor_id == current_user.id,
                DBEnrollment.enrolled_at >= thirty_days_ago,
            )
        )
    )
    enrollments_last_30d = recent_enrollments_result.scalar() or 0

    # Average completion rate across mentor's courses
    completion_result = await db.execute(
        select(func.avg(DBEnrollment.progress_percentage))
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .where(DBCourse.mentor_id == current_user.id)
    )
    avg_completion_raw = completion_result.scalar()
    avg_completion = (
        float(avg_completion_raw) if avg_completion_raw is not None else 0.0
    )

    # Monthly enrollment trends for the last 6 months
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    monthly_enrollments_map: dict[str, int] = {}

    enrollment_dates_result = await db.execute(
        select(DBEnrollment.enrolled_at)
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .where(
            and_(
                DBCourse.mentor_id == current_user.id,
                DBEnrollment.enrolled_at >= six_months_ago,
            )
        )
    )
    enrollment_dates = enrollment_dates_result.all()

    for (enrolled_at,) in enrollment_dates:
        if not enrolled_at:
            continue
        month_key = enrolled_at.strftime("%Y-%m")
        monthly_enrollments_map[month_key] = (
            monthly_enrollments_map.get(month_key, 0) + 1
        )

    # Sort by month and create MonthlyEnrollment objects
    monthly_enrollments: List[MonthlyEnrollment] = [
        MonthlyEnrollment(month=month_key, count=count)
        for month_key, count in sorted(monthly_enrollments_map.items())
    ]

    # Get course performance data
    courses_result = await db.execute(
        select(DBCourse).where(DBCourse.mentor_id == current_user.id)
    )
    courses = courses_result.scalars().all()
    course_ids = [course.id for course in courses]

    # Initialize performance map with proper int keys
    performance_map: Dict[int, CoursePerformanceData] = {}
    for course in courses:
        course_id = int(getattr(course, 'id', 0))
        performance_map[course_id] = {"enrolled": 0, "avg_completion": 0.0}

    if course_ids:
        enrollment_stats_result = await db.execute(
            select(
                DBEnrollment.course_id,
                func.count(DBEnrollment.id),
                func.avg(DBEnrollment.progress_percentage)
            )
            .where(DBEnrollment.course_id.in_(course_ids))
            .group_by(DBEnrollment.course_id)
        )
        enrollment_stats = enrollment_stats_result.all()

        for course_id, count, avg_progress in enrollment_stats:
            performance_map[int(course_id)] = {
                "enrolled": int(count or 0),
                "avg_completion": float(avg_progress or 0.0)
            }

    # Build course performance items
    course_performance: List[CoursePerformanceItem] = []
    for course in courses:
        course_id = int(getattr(course, 'id', 0))
        title = str(getattr(course, 'title', ''))
        created_at = getattr(course, 'created_at')
        updated_at = getattr(course, 'updated_at')

        # Get performance data for this course
        perf_data = performance_map.get(course_id, {"enrolled": 0, "avg_completion": 0.0})

        course_performance.append(
            CoursePerformanceItem(
                course_id=course_id,
                title=title,
                enrolled_count=perf_data["enrolled"],
                avg_completion=perf_data["avg_completion"],
                status=str(
                    course.status.value
                    if hasattr(course.status, 'value')
                    else course.status
                ),
                created_at=created_at,
                last_updated=updated_at,
            )
        )

    return MentorOverviewResponse(
        overview=MentorOverview(
            total_courses=int(total_courses or 0),
            total_students=total_students,
            enrollments_last_30d=enrollments_last_30d,
            avg_completion=avg_completion,
            monthly_enrollments=monthly_enrollments,
        ),
        course_performance=course_performance,
    )


@router.get("/me/students")
async def get_mentor_students(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    course_id: Optional[int] = None,
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """Get paginated list of students enrolled in mentor's courses.

    Args:
        page: Page number (1-based)
        size: Number of items per page (max 100)
        course_id: Optional filter by specific course
        current_user: Authenticated mentor user
        db: Database session

    Returns:
        Paginated response with student enrollment data
    """
    # Get total count for pagination
    count_query = (
        select(func.count(DBEnrollment.id))
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .join(DBUser, DBEnrollment.student_id == DBUser.id)
        .where(DBCourse.mentor_id == current_user.id)
    )
    if course_id:
        count_query = count_query.where(DBEnrollment.course_id == course_id)
    
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Apply pagination at database level
    query = (
        select(DBEnrollment, DBUser, DBCourse)
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .join(DBUser, DBEnrollment.student_id == DBUser.id)
        .where(DBCourse.mentor_id == current_user.id)
    )

    if course_id:
        query = query.where(DBEnrollment.course_id == course_id)

    # Apply database-level pagination
    result = await db.execute(
        query.order_by(DBEnrollment.enrolled_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    items = result.all()

    results: List[MentorStudentItem] = []
    for enrollment, student, course in items:
        try:
            status_value = (
                enrollment.status.value if hasattr(enrollment.status, 'value') else str(enrollment.status)
            )
        except Exception:
            status_value = str(enrollment.status)
        results.append(
            MentorStudentItem(
                user_id=int(getattr(student, 'id', 0)),
                full_name=str(getattr(student, 'full_name', '')),
                email=str(getattr(student, 'email', '')),
                course_id=int(getattr(course, 'id', 0)),
                course_title=str(getattr(course, 'title', '')),
                enrolled_at=getattr(enrollment, 'enrolled_at'),
                progress_percentage=float(enrollment.progress_percentage or 0.0),
                status=status_value,
            )
        )

    pages = (int(total or 0) + size - 1) // size
    return {
        "items": results,
        "total": int(total or 0),
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.get("/me/activity")
async def get_mentor_activity(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
) -> Dict[str, List[MentorActivityItem]]:
    """Get recent activity for mentor's courses.

    Returns course creation and student enrollment activities,
    sorted by timestamp in descending order.

    Args:
        limit: Maximum number of activities to return (1-200)
        current_user: Authenticated mentor user
        db: Database session

    Returns:
        Dictionary containing list of activity items
    """
    activities: List[MentorActivityItem] = []

    # Recent course creations
    result = await db.execute(
        select(DBCourse)
        .where(DBCourse.mentor_id == current_user.id)
        .order_by(DBCourse.created_at.desc())
        .limit(min(10, limit))
    )
    recent_courses = result.scalars().all()
    for c in recent_courses:
        activities.append(
            MentorActivityItem(
                type="course_created",
                description=str(getattr(c, 'title', '')),
                timestamp=getattr(c, 'created_at'),
                course_id=int(getattr(c, 'id', 0)),
                course_title=str(getattr(c, 'title', '')),
            )
        )

    # Recent enrollments into mentor courses
    result = await db.execute(
        select(DBEnrollment, DBUser, DBCourse)
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .join(DBUser, DBEnrollment.student_id == DBUser.id)
        .where(DBCourse.mentor_id == current_user.id)
        .order_by(DBEnrollment.enrolled_at.desc())
        .limit(min(20, limit))
    )
    recent_enrollments = result.all()
    for e, student, course in recent_enrollments:
        activities.append(
            MentorActivityItem(
                type="student_enrolled",
                description=f"{getattr(student, 'full_name', '')} enrolled in {getattr(course, 'title', '')}",
                timestamp=getattr(e, 'enrolled_at'),
                course_id=int(getattr(course, 'id', 0)),
                course_title=str(getattr(course, 'title', '')),
                user_id=int(getattr(student, 'id', 0)),
                student_name=str(getattr(student, 'full_name', '')),
            )
        )

    # Sort and return top N
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return {"activities": activities[:limit]}
