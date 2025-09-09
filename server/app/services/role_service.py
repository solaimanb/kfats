from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models import RoleApplication as DBRoleApplication, User as DBUser
from app.schemas import RoleApplication, RoleApplicationCreate, RoleApplicationUpdate, UserRole


class RoleService:
    """Service layer for role management operations."""
    
    @staticmethod
    async def get_application_by_id(db: AsyncSession, app_id: int) -> Optional[DBRoleApplication]:
        """Get role application by ID."""
        result = await db.execute(
            select(DBRoleApplication).where(DBRoleApplication.id == app_id)
        )
        return result.scalars().first()
    
    @staticmethod
    async def get_user_applications(db: AsyncSession, user_id: int) -> List[DBRoleApplication]:
        """Get all applications for a user."""
        result = await db.execute(
            select(DBRoleApplication).where(DBRoleApplication.user_id == user_id)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_pending_applications(db: AsyncSession) -> List[DBRoleApplication]:
        """Get all pending applications."""
        result = await db.execute(
            select(DBRoleApplication).where(DBRoleApplication.status == "pending")
        )
        return result.scalars().all()
    
    @staticmethod
    async def create_application(db: AsyncSession, app_data: RoleApplicationCreate, user_id: int) -> DBRoleApplication:
        """Create a new role application."""
        # Check if user already has the requested role
        result = await db.execute(
            select(DBUser).where(DBUser.id == user_id)
        )
        user = result.scalars().first()
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
        result = await db.execute(
            select(DBRoleApplication).where(
                DBRoleApplication.user_id == user_id,
                DBRoleApplication.requested_role == app_data.requested_role,
                DBRoleApplication.status == "pending"
            )
        )
        existing_app = result.scalars().first()
        
        if existing_app:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Pending application for {app_data.requested_role} role already exists"
            )
        
        # Check for recent rejection (30-day cooldown)
        result = await db.execute(
            select(DBRoleApplication).where(
                DBRoleApplication.user_id == user_id,
                DBRoleApplication.requested_role == app_data.requested_role,
                DBRoleApplication.status == "rejected",
                DBRoleApplication.reviewed_at >= datetime.utcnow() - timedelta(days=30)
            )
        )
        recent_rejection = result.scalars().first()
        
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
        await db.commit()
        await db.refresh(db_application)
        return db_application
    
    @staticmethod
    async def review_application(
        db: AsyncSession, 
        app_id: int, 
        review_data: RoleApplicationUpdate, 
        reviewer_id: int
    ) -> DBRoleApplication:
        """Review a role application."""
        application = await RoleService.get_application_by_id(db, app_id)
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
            result = await db.execute(
                select(DBUser).where(DBUser.id == application.user_id)
            )
            user = result.scalars().first()
            if user:
                user.role = UserRole(application.requested_role)
        
        await db.commit()
        await db.refresh(application)
        return application
