from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from app.core.database import get_async_db
from app.models.course import Course as DBCourse, Enrollment as DBEnrollment
from app.models.user import User as DBUser
from app.schemas.course import Course, CourseCreate, CourseUpdate, Enrollment, EnrollmentCreate
from app.schemas.common import CourseStatus, UserRole, SuccessResponse, PaginatedResponse
from app.schemas.user import User
from app.core.dependencies import get_current_active_user, get_mentor_or_admin

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("/", response_model=Course)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Create a new course (Mentor/Admin only)."""
    
    # Default to published for approved mentors, unless explicitly set as draft
    course_dict = course_data.model_dump()
    if 'status' not in course_dict or course_dict['status'] is None:
        course_dict['status'] = CourseStatus.PUBLISHED
    
    db_course = DBCourse(
        **course_dict,
        mentor_id=current_user.id
    )
    
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    
    return Course.model_validate(db_course)


@router.get("/", response_model=PaginatedResponse[Course])
async def get_courses(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    mentor_id: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """Get paginated list of published courses."""
    query = db.query(DBCourse).filter(DBCourse.status == CourseStatus.PUBLISHED)
    if mentor_id:
        query = query.filter(DBCourse.mentor_id == mentor_id)
    
    result = await db.execute(query)
    items = result.scalars().all()
    total = len(items)
    
    return PaginatedResponse(
        items=[Course.model_validate(c) for c in items],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
    )


@router.get("/my-courses", response_model=List[Course])
async def get_my_courses(
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Get courses created by current mentor."""
    
    result = await db.execute(
        db.query(DBCourse).filter(DBCourse.mentor_id == current_user.id)
    )
    courses = result.scalars().all()
    return [Course.model_validate(course) for course in courses]


@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: int, db: AsyncSession = Depends(get_async_db)):
    """Get course by ID."""
    
    result = await db.execute(
        db.query(DBCourse).filter(DBCourse.id == course_id)
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return Course.model_validate(course)


@router.put("/{course_id}", response_model=Course)
async def update_course(
    course_id: int,
    course_update: CourseUpdate,
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Update course (only by course mentor or admin)."""
    
    result = await db.execute(
        db.query(DBCourse).filter(DBCourse.id == course_id)
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check ownership (mentor can only edit their own courses)
    if current_user.role != UserRole.ADMIN and course.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own courses"
        )
    
    # Update fields
    update_data = course_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    await db.commit()
    await db.refresh(course)
    
    return Course.model_validate(course)


@router.delete("/{course_id}", response_model=SuccessResponse)
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete course (only by course mentor or admin)."""
    
    result = await db.execute(
        db.query(DBCourse).filter(DBCourse.id == course_id)
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check ownership
    if current_user.role != UserRole.ADMIN and course.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own courses"
        )
    
    await db.delete(course)
    await db.commit()
    
    return SuccessResponse(
        message="Course deleted successfully",
        data={"course_id": course_id}
    )


@router.post("/{course_id}/enroll", response_model=SuccessResponse)
async def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Enroll in a course."""
    
    # Check if course exists and is published
    result = await db.execute(
        db.query(DBCourse).filter(
            DBCourse.id == course_id,
            DBCourse.status == CourseStatus.PUBLISHED
        )
    )
    course = result.scalars().first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or not available"
        )
    
    # Check if already enrolled
    result = await db.execute(
        db.query(DBEnrollment).filter(
            DBEnrollment.student_id == current_user.id,
            DBEnrollment.course_id == course_id
        )
    )
    existing_enrollment = result.scalars().first()
    
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    # Check capacity
    if course.max_students and course.enrolled_count >= course.max_students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course is full"
        )
    
    # Create enrollment with explicit field values to avoid any issues
    try:
        enrollment = DBEnrollment(
            student_id=current_user.id,
            course_id=course_id
        )
        
        db.add(enrollment)
        await db.flush()  # Flush to get the ID
        
        # Update enrolled count
        course.enrolled_count += 1
        
        await db.commit()
        
        return SuccessResponse(
            message="Successfully enrolled in course",
            data={"course_id": course_id, "enrollment_id": enrollment.id}
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Enrollment failed: {str(e)}"
        )


@router.get("/{course_id}/enrollments", response_model=List[Enrollment])
async def get_course_enrollments(
    course_id: int,
    current_user: User = Depends(get_mentor_or_admin),
    db: AsyncSession = Depends(get_async_db)
):
    """Get course enrollments (Mentor/Admin only)."""
    
    # Check if course exists and user has access
    result = await db.execute(
        db.query(DBCourse).filter(DBCourse.id == course_id)
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if current_user.role != UserRole.ADMIN and course.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    result = await db.execute(
        db.query(DBEnrollment).filter(DBEnrollment.course_id == course_id)
    )
    enrollments = result.scalars().all()
    return [Enrollment.model_validate(enrollment) for enrollment in enrollments]


@router.get("/my-enrollments", response_model=List[Enrollment])
async def get_my_enrollments(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get enrollments for the current student/user."""
    result = await db.execute(
        db.query(DBEnrollment).filter(DBEnrollment.student_id == current_user.id)
    )
    enrollments = result.scalars().all()
    return [Enrollment.model_validate(e) for e in enrollments]


class EnrollmentProgressUpdate(BaseModel):
    progress_percentage: float


@router.put("/enrollments/{enrollment_id}/progress", response_model=Enrollment)
async def update_enrollment_progress(
    enrollment_id: int,
    update: EnrollmentProgressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update progress for an enrollment owned by current user (or mentor/admin of the course)."""
    result = await db.execute(
        db.query(DBEnrollment).filter(DBEnrollment.id == enrollment_id)
    )
    enrollment = result.scalars().first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

    # Ownership: student can update own; mentor/admin can update if owns course
    if enrollment.student_id != current_user.id:
        # check mentor/admin
        result = await db.execute(
            db.query(DBCourse).filter(DBCourse.id == enrollment.course_id)
        )
        course = result.scalars().first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        if current_user.role != UserRole.ADMIN and course.mentor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if update.progress_percentage < 0 or update.progress_percentage > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Progress must be between 0 and 100")

    enrollment.progress_percentage = update.progress_percentage
    await db.commit()
    await db.refresh(enrollment)
    return Enrollment.model_validate(enrollment)
