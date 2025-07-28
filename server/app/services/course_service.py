from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Course as DBCourse, Enrollment as DBEnrollment, User as DBUser
from app.schemas import Course, CourseCreate, CourseUpdate, Enrollment, UserRole


class CourseService:
    """Service layer for course operations."""
    
    @staticmethod
    def get_course_by_id(db: Session, course_id: int) -> Optional[DBCourse]:
        """Get course by ID."""
        return db.query(DBCourse).filter(DBCourse.id == course_id).first()
    
    @staticmethod
    def get_courses(db: Session, skip: int = 0, limit: int = 20) -> List[DBCourse]:
        """Get list of courses."""
        return db.query(DBCourse).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_course(db: Session, course_data: CourseCreate, mentor_id: int) -> DBCourse:
        """Create a new course."""
        db_course = DBCourse(
            **course_data.model_dump(),
            mentor_id=mentor_id
        )
        
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course
    
    @staticmethod
    def update_course(db: Session, course_id: int, course_update: CourseUpdate, user_id: int) -> DBCourse:
        """Update course information."""
        db_course = CourseService.get_course_by_id(db, course_id)
        if not db_course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check if user is the mentor of the course or admin
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if db_course.mentor_id != user_id and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this course"
            )
        
        # Update course fields
        update_data = course_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_course, field, value)
        
        db.commit()
        db.refresh(db_course)
        return db_course
    
    @staticmethod
    def enroll_student(db: Session, course_id: int, student_id: int) -> DBEnrollment:
        """Enroll a student in a course."""
        # Check if course exists
        course = CourseService.get_course_by_id(db, course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check if already enrolled
        existing_enrollment = db.query(DBEnrollment).filter(
            DBEnrollment.course_id == course_id,
            DBEnrollment.student_id == student_id
        ).first()
        
        if existing_enrollment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already enrolled in this course"
            )
        
        # Create enrollment
        enrollment = DBEnrollment(
            course_id=course_id,
            student_id=student_id
        )
        
        db.add(enrollment)
        
        # Update enrolled count
        course.enrolled_count += 1
        
        # Auto-upgrade user to student role if they're just a user
        student = db.query(DBUser).filter(DBUser.id == student_id).first()
        if student and student.role == UserRole.USER:
            student.role = UserRole.STUDENT
        
        db.commit()
        db.refresh(enrollment)
        return enrollment
