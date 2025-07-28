from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import RoleApplication as DBRoleApplication, User as DBUser
from app.schemas import RoleApplication, RoleApplicationCreate, RoleApplicationUpdate, UserRole


class RoleService:
    """Service layer for role management operations."""
    
    @staticmethod
    def get_application_by_id(db: Session, app_id: int) -> Optional[DBRoleApplication]:
        """Get role application by ID."""
        return db.query(DBRoleApplication).filter(DBRoleApplication.id == app_id).first()
    
    @staticmethod
    def get_user_applications(db: Session, user_id: int) -> List[DBRoleApplication]:
        """Get all applications for a user."""
        return db.query(DBRoleApplication).filter(DBRoleApplication.user_id == user_id).all()
    
    @staticmethod
    def get_pending_applications(db: Session) -> List[DBRoleApplication]:
        """Get all pending applications."""
        return db.query(DBRoleApplication).filter(DBRoleApplication.status == "pending").all()
    
    @staticmethod
    def create_application(db: Session, app_data: RoleApplicationCreate, user_id: int) -> DBRoleApplication:
        """Create a new role application."""
        # Check if user already has the requested role
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.role == app_data.requested_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User already has {app_data.requested_role} role"
            )
        
        # Check for existing pending application for the same role
        existing_app = db.query(DBRoleApplication).filter(
            DBRoleApplication.user_id == user_id,
            DBRoleApplication.requested_role == app_data.requested_role,
            DBRoleApplication.status == "pending"
        ).first()
        
        if existing_app:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Pending application for {app_data.requested_role} role already exists"
            )
        
        # Check for recent rejection (30-day cooldown)
        recent_rejection = db.query(DBRoleApplication).filter(
            DBRoleApplication.user_id == user_id,
            DBRoleApplication.requested_role == app_data.requested_role,
            DBRoleApplication.status == "rejected",
            DBRoleApplication.reviewed_at >= datetime.utcnow() - timedelta(days=30)
        ).first()
        
        if recent_rejection:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must wait 30 days after rejection to reapply"
            )
        
        # Create application
        db_application = DBRoleApplication(
            user_id=user_id,
            requested_role=app_data.requested_role,
            reason=app_data.reason,
            application_data=app_data.application_data
        )
        
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        return db_application
    
    @staticmethod
    def review_application(
        db: Session, 
        app_id: int, 
        review_data: RoleApplicationUpdate, 
        reviewer_id: int
    ) -> DBRoleApplication:
        """Review a role application."""
        application = RoleService.get_application_by_id(db, app_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        if application.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application has already been reviewed"
            )
        
        # Update application
        application.status = review_data.status
        application.admin_notes = review_data.admin_notes
        application.reviewed_by = reviewer_id
        application.reviewed_at = datetime.utcnow()
        
        # If approved, upgrade user role
        if review_data.status == "approved":
            user = db.query(DBUser).filter(DBUser.id == application.user_id).first()
            if user:
                user.role = UserRole(application.requested_role)
        
        db.commit()
        db.refresh(application)
        return application
