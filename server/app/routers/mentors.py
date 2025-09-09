from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_, distinct, select

from app.core.database import get_async_db
from app.core.dependencies import get_mentor_or_admin
from app.models.user import User as DBUser
from app.models.course import Course as DBCourse, Enrollment as DBEnrollment
from app.schemas.mentor import (
    MentorOverviewResponse,
    MentorOverview,
    MonthlyEnrollment,
    CoursePerformanceItem,
    MentorStudentItem,
    MentorActivityItem,
)
from app.schemas.user import User

router = APIRouter(prefix="/mentors", tags=["Mentors"])


@router.get("/me/overview", response_model=MentorOverviewResponse)
async def get_mentor_overview(
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    # Total courses
    count_result = await db.execute(
        select(func.count(DBCourse.id)).where(DBCourse.mentor_id == current_user.id)
    )
    total_courses = count_result.scalar()

    # Total students (distinct across mentor's courses)
    result = await db.execute(
        select(func.count(distinct(DBEnrollment.student_id)))
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .where(DBCourse.mentor_id == current_user.id)
    )
    total_students = result.scalar() or 0

    # Enrollments last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    result = await db.execute(
        select(func.count(DBEnrollment.id))
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .where(
            and_(
                DBCourse.mentor_id == current_user.id,
                DBEnrollment.enrolled_at >= thirty_days_ago,
            )
        )
    )
    enrollments_last_30d = result.scalar() or 0

    # Average completion across mentor's enrollments
    result = await db.execute(
        select(func.avg(DBEnrollment.progress_percentage))
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .where(DBCourse.mentor_id == current_user.id)
    )
    avg_completion = result.scalar()
    avg_completion = float(avg_completion) if avg_completion is not None else 0.0

    # Monthly enrollments (last 6 months) - DB-agnostic grouping in Python
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    monthly_enrollments_map: dict[str, int] = {}
    result = await db.execute(
        select(DBEnrollment.enrolled_at)
        .join(DBCourse, DBEnrollment.course_id == DBCourse.id)
        .where(
            and_(
                DBCourse.mentor_id == current_user.id,
                DBEnrollment.enrolled_at >= six_months_ago,
            )
        )
    )
    enroll_dates = result.all()
    for (enrolled_at,) in enroll_dates:
        if not enrolled_at:
            continue
        key = enrolled_at.strftime("%Y-%m")
        monthly_enrollments_map[key] = monthly_enrollments_map.get(key, 0) + 1
    # Sort by month key
    monthly_enrollments: List[MonthlyEnrollment] = [
        MonthlyEnrollment(month=k, count=v)
        for k, v in sorted(monthly_enrollments_map.items())
    ]

    # Course performance for mentor's courses
    result = await db.execute(
        select(DBCourse).where(DBCourse.mentor_id == current_user.id)
    )
    courses = result.scalars().all()
    course_ids = [c.id for c in courses]

    perf_map = {cid: {"enrolled": 0, "avg": 0.0} for cid in course_ids}
    if course_ids:
        result = await db.execute(
            select(
                DBEnrollment.course_id,
                func.count(DBEnrollment.id),
                func.avg(DBEnrollment.progress_percentage)
            )
            .where(DBEnrollment.course_id.in_(course_ids))
            .group_by(DBEnrollment.course_id)
        )
        enrollment_stats = result.all()
        for cid, cnt, avgp in enrollment_stats:
            perf_map[cid] = {"enrolled": int(cnt or 0), "avg": float(avgp or 0.0)}

    course_performance: List[CoursePerformanceItem] = [
        CoursePerformanceItem(
            course_id=c.id,
            title=c.title,
            enrolled_count=perf_map.get(c.id, {}).get("enrolled", 0),
            avg_completion=perf_map.get(c.id, {}).get("avg", 0.0),
            status=str(c.status.value if hasattr(c.status, 'value') else c.status),
            created_at=c.created_at,
            last_updated=c.updated_at,
        )
        for c in courses
    ]

    return MentorOverviewResponse(
        overview=MentorOverview(
            total_courses=total_courses,
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
):
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
                user_id=student.id,
                full_name=student.full_name,
                email=student.email,
                course_id=course.id,
                course_title=course.title,
                enrolled_at=enrollment.enrolled_at,
                progress_percentage=float(enrollment.progress_percentage or 0.0),
                status=status_value,
            )
        )

    pages = (total + size - 1) // size
    return {
        "items": results,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.get("/me/activity")
async def get_mentor_activity(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
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
                description=f"Course created: {c.title}",
                timestamp=c.created_at,
                course_id=c.id,
                course_title=c.title,
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
                description=f"{student.full_name} enrolled in {course.title}",
                timestamp=e.enrolled_at,
                course_id=course.id,
                course_title=course.title,
                user_id=student.id,
                student_name=student.full_name,
            )
        )

    # Sort and return top N
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return {"activities": activities[:limit]}
