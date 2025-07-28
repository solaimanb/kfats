from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_db
from app.models.course import Course as DBCourse, Enrollment as DBEnrollment
from app.models.user import User as DBUser
from app.schemas.course import Course, CourseCreate, CourseUpdate, Enrollment, EnrollmentCreate
from app.schemas.common import CourseStatus, UserRole, SuccessResponse
from app.schemas.user import User
from app.core.dependencies import get_current_active_user, get_mentor_or_admin

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("/", response_model=Course)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_mentor_or_admin),
    db: Session = Depends(get_db)
):
    """Create a new course (Mentor/Admin only)."""
    
    db_course = DBCourse(
        **course_data.model_dump(),
        mentor_id=current_user.id
    )
    
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    return Course.model_validate(db_course)


@router.get("/", response_model=List[Course])
async def get_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[CourseStatus] = None,
    mentor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get list of courses."""
    
    query = db.query(DBCourse)
    
    # Only show published courses to regular users
    # Mentors and admins can see all their courses
    query = query.filter(DBCourse.status == CourseStatus.PUBLISHED)
    
    if mentor_id:
        query = query.filter(DBCourse.mentor_id == mentor_id)
    
    courses = query.offset(skip).limit(limit).all()
    return [Course.model_validate(course) for course in courses]


@router.get("/my-courses", response_model=List[Course])
async def get_my_courses(
    current_user: User = Depends(get_mentor_or_admin),
    db: Session = Depends(get_db)
):
    """Get courses created by current mentor."""
    
    courses = db.query(DBCourse).filter(DBCourse.mentor_id == current_user.id).all()
    return [Course.model_validate(course) for course in courses]


@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get course by ID."""
    
    course = db.query(DBCourse).filter(DBCourse.id == course_id).first()
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
    db: Session = Depends(get_db)
):
    """Update course (only by course mentor or admin)."""
    
    course = db.query(DBCourse).filter(DBCourse.id == course_id).first()
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
    
    db.commit()
    db.refresh(course)
    
    return Course.model_validate(course)


@router.delete("/{course_id}", response_model=SuccessResponse)
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_mentor_or_admin),
    db: Session = Depends(get_db)
):
    """Delete course (only by course mentor or admin)."""
    
    course = db.query(DBCourse).filter(DBCourse.id == course_id).first()
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
    
    db.delete(course)
    db.commit()
    
    return SuccessResponse(
        message="Course deleted successfully",
        data={"course_id": course_id}
    )


@router.post("/{course_id}/enroll", response_model=SuccessResponse)
async def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Enroll in a course."""
    
    # Check if course exists and is published
    course = db.query(DBCourse).filter(
        DBCourse.id == course_id,
        DBCourse.status == CourseStatus.PUBLISHED
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or not available"
        )
    
    # Check if already enrolled
    existing_enrollment = db.query(DBEnrollment).filter(
        DBEnrollment.student_id == current_user.id,
        DBEnrollment.course_id == course_id
    ).first()
    
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
        db.flush()  # Flush to get the ID
        
        # Update enrolled count
        course.enrolled_count += 1
        
        db.commit()
        
        return SuccessResponse(
            message="Successfully enrolled in course",
            data={"course_id": course_id, "enrollment_id": enrollment.id}
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Enrollment failed: {str(e)}"
        )


@router.get("/{course_id}/enrollments", response_model=List[Enrollment])
async def get_course_enrollments(
    course_id: int,
    current_user: User = Depends(get_mentor_or_admin),
    db: Session = Depends(get_db)
):
    """Get course enrollments (Mentor/Admin only)."""
    
    # Check if course exists and user has access
    course = db.query(DBCourse).filter(DBCourse.id == course_id).first()
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
    
    enrollments = db.query(DBEnrollment).filter(DBEnrollment.course_id == course_id).all()
    return [Enrollment.model_validate(enrollment) for enrollment in enrollments]
