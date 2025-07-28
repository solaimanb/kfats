import json
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_db
from app.models.user import User as DBUser, RoleApplication as DBRoleApplication
from app.schemas.user import RoleApplication, RoleApplicationCreate, RoleApplicationUpdate, User
from app.schemas.common import (
    RoleApplicationStatus, ApplicationableRole, UserRole, SuccessResponse, ErrorResponse,
    PaginatedResponse
)
from app.core.dependencies import get_current_active_user, require_role
from app.core.config import settings

router = APIRouter(prefix="/role-applications", tags=["Role Applications"])


@router.post("/apply", response_model=SuccessResponse)
async def apply_for_role(
    application_data: RoleApplicationCreate,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Apply for a role (mentor, seller, writer).
    Only authenticated users can apply.
    """
    
    # Check if user already has the requested role or higher
    if current_user.role == application_data.requested_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have the {application_data.requested_role} role"
        )
    
    if current_user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot apply for other roles"
        )
    
    # Check if user has a pending application for this role
    existing_application = db.query(DBRoleApplication).filter(
        and_(
            DBRoleApplication.user_id == current_user.id,
            DBRoleApplication.requested_role == application_data.requested_role,
            DBRoleApplication.status == RoleApplicationStatus.PENDING
        )
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have a pending application for {application_data.requested_role} role"
        )
    
    # Check if user was recently rejected (within 30 days)
    recent_rejection = db.query(DBRoleApplication).filter(
        and_(
            DBRoleApplication.user_id == current_user.id,
            DBRoleApplication.requested_role == application_data.requested_role,
            DBRoleApplication.status == RoleApplicationStatus.REJECTED,
            DBRoleApplication.reviewed_at >= datetime.utcnow().date() - timedelta(days=30)
        )
    ).first()
    
    if recent_rejection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot reapply for this role within 30 days of rejection"
        )
    
    # Create new application
    new_application = DBRoleApplication(
        user_id=current_user.id,
        requested_role=application_data.requested_role,
        reason=application_data.reason,
        application_data=json.dumps(application_data.application_data) if application_data.application_data else None,
        status=RoleApplicationStatus.PENDING
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return SuccessResponse(
        message=f"Your application for {application_data.requested_role} role has been submitted successfully",
        data={"application_id": new_application.id}
    )


@router.get("/my-applications", response_model=List[RoleApplication])
async def get_my_applications(
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's role applications."""
    
    applications = db.query(DBRoleApplication).filter(
        DBRoleApplication.user_id == current_user.id
    ).order_by(DBRoleApplication.applied_at.desc()).all()
    
    return applications


@router.get("/", response_model=PaginatedResponse[RoleApplication])
async def get_all_applications(
    status: Optional[RoleApplicationStatus] = Query(None, description="Filter by status"),
    role: Optional[ApplicationableRole] = Query(None, description="Filter by requested role"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: DBUser = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get all role applications (Admin only).
    Supports filtering by status and role.
    """
    
    query = db.query(DBRoleApplication)
    
    # Apply filters
    if status:
        query = query.filter(DBRoleApplication.status == status)
    if role:
        query = query.filter(DBRoleApplication.requested_role == role)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    applications = query.order_by(
        DBRoleApplication.applied_at.desc()
    ).offset((page - 1) * size).limit(size).all()
    
    return PaginatedResponse(
        items=applications,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )


@router.put("/{application_id}/review", response_model=SuccessResponse)
async def review_application(
    application_id: int,
    review_data: RoleApplicationUpdate,
    current_user: DBUser = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Review a role application (Admin only).
    Approve or reject with optional notes.
    """
    
    # Get the application
    application = db.query(DBRoleApplication).filter(
        DBRoleApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status != RoleApplicationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This application has already been reviewed"
        )
    
    # Update application status
    application.status = review_data.status
    application.admin_notes = review_data.admin_notes
    application.reviewed_by = current_user.id
    application.reviewed_at = datetime.utcnow()
    
    # If approved, update user role
    if review_data.status == RoleApplicationStatus.APPROVED:
        user = db.query(DBUser).filter(DBUser.id == application.user_id).first()
        if user:
            user.role = UserRole(application.requested_role)
            user.updated_at = datetime.utcnow()
    
    db.commit()
    
    status_text = "approved" if review_data.status == RoleApplicationStatus.APPROVED else "rejected"
    return SuccessResponse(
        message=f"Application has been {status_text} successfully",
        data={
            "application_id": application.id,
            "new_status": application.status,
            "user_role_updated": review_data.status == RoleApplicationStatus.APPROVED
        }
    )


@router.get("/stats", response_model=dict)
async def get_application_stats(
    current_user: DBUser = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get role application statistics (Admin only)."""
    
    # Count applications by status
    pending_count = db.query(DBRoleApplication).filter(
        DBRoleApplication.status == RoleApplicationStatus.PENDING
    ).count()
    
    approved_count = db.query(DBRoleApplication).filter(
        DBRoleApplication.status == RoleApplicationStatus.APPROVED
    ).count()
    
    rejected_count = db.query(DBRoleApplication).filter(
        DBRoleApplication.status == RoleApplicationStatus.REJECTED
    ).count()
    
    # Count by role type
    mentor_applications = db.query(DBRoleApplication).filter(
        DBRoleApplication.requested_role == ApplicationableRole.MENTOR
    ).count()
    
    seller_applications = db.query(DBRoleApplication).filter(
        DBRoleApplication.requested_role == ApplicationableRole.SELLER
    ).count()
    
    writer_applications = db.query(DBRoleApplication).filter(
        DBRoleApplication.requested_role == ApplicationableRole.WRITER
    ).count()
    
    return {
        "by_status": {
            "pending": pending_count,
            "approved": approved_count,
            "rejected": rejected_count,
            "total": pending_count + approved_count + rejected_count
        },
        "by_role": {
            "mentor": mentor_applications,
            "seller": seller_applications,
            "writer": writer_applications
        }
    }


@router.delete("/{application_id}", response_model=SuccessResponse)
async def withdraw_application(
    application_id: int,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Withdraw a pending role application.
    Users can only withdraw their own pending applications.
    """
    
    application = db.query(DBRoleApplication).filter(
        and_(
            DBRoleApplication.id == application_id,
            DBRoleApplication.user_id == current_user.id,
            DBRoleApplication.status == RoleApplicationStatus.PENDING
        )
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending application not found"
        )
    
    db.delete(application)
    db.commit()
    
    return SuccessResponse(
        message="Application withdrawn successfully",
        data={"application_id": application_id}
    )
