import json
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy import and_
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_async_db
from app.models.user import User as DBUser, RoleApplication as DBRoleApplication
from app.schemas.user import RoleApplication, RoleApplicationCreate, RoleApplicationUpdate, User
from app.schemas.common import (
    RoleApplicationStatus, ApplicationableRole, UserRole, SuccessResponse,
    PaginatedResponse
)
from app.core.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/role-applications", tags=["Role Applications"])


@router.post("/apply", response_model=SuccessResponse)
async def apply_for_role(
    application_data: RoleApplicationCreate,
    current_user: DBUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Apply for a role (mentor, seller, writer).
    Only authenticated users can apply.
    """
    
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
    
    existing_application_result = await db.execute(
        db.query(DBRoleApplication).filter(
            and_(
                DBRoleApplication.user_id == current_user.id,
                DBRoleApplication.requested_role == application_data.requested_role,
                DBRoleApplication.status == RoleApplicationStatus.PENDING
            )
        )
    )
    existing_application = existing_application_result.scalar_one_or_none()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have a pending application for {application_data.requested_role} role"
        )
    
    recent_rejection_result = await db.execute(
        db.query(DBRoleApplication).filter(
            and_(
                DBRoleApplication.user_id == current_user.id,
                DBRoleApplication.requested_role == application_data.requested_role,
                DBRoleApplication.status == RoleApplicationStatus.REJECTED,
                DBRoleApplication.reviewed_at >= datetime.utcnow().date() - timedelta(days=30)
            )
        )
    )
    recent_rejection = recent_rejection_result.scalar_one_or_none()
    
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
    await db.commit()
    await db.refresh(new_application)
    
    return SuccessResponse(
        message=f"Your application for {application_data.requested_role} role has been submitted successfully",
        data={"application_id": new_application.id}
    )


@router.get("/my-applications", response_model=List[RoleApplication])
async def get_my_applications(
    current_user: DBUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get current user's role applications."""
    
    applications_result = await db.execute(
        db.query(DBRoleApplication).filter(
            DBRoleApplication.user_id == current_user.id
        ).order_by(DBRoleApplication.applied_at.desc())
    )
    applications = applications_result.scalars().all()
    
    return applications


@router.get("/", response_model=PaginatedResponse[RoleApplication])
async def get_all_applications(
    status: Optional[RoleApplicationStatus] = Query(None, description="Filter by status"),
    role: Optional[ApplicationableRole] = Query(None, description="Filter by requested role"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: DBUser = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all role applications (Admin only).
    Supports filtering by status and role.
    """
    
    query = db.query(DBRoleApplication).options(
        joinedload(DBRoleApplication.applicant),
        joinedload(DBRoleApplication.reviewer)
    )
    
    if status:
        query = query.filter(DBRoleApplication.status == status)
    if role:
        query = query.filter(DBRoleApplication.requested_role == role)
    
    # Get total count
    total_result = await db.execute(query.with_only_columns([DBRoleApplication.id]))
    total = len(total_result.scalars().all())
    
    # Get paginated results
    applications_result = await db.execute(
        query.order_by(DBRoleApplication.applied_at.desc())
        .offset((page - 1) * size).limit(size)
    )
    applications = applications_result.scalars().all()
    
    result = []
    for app in applications:
        app_data = RoleApplication.model_validate(app)
        if app.applicant:
            app_data.user = app.applicant
        if app.reviewer:
            app_data.reviewed_by_user = app.reviewer
        result.append(app_data)
    
    return PaginatedResponse(
        items=result,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )


@router.get("/all", response_model=List[RoleApplication])
async def get_all_applications_simple(
    status: Optional[RoleApplicationStatus] = Query(None, description="Filter by status"),
    role: Optional[ApplicationableRole] = Query(None, description="Filter by requested role"),
    skip: int = Query(0, ge=0, description="Number of applications to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of applications to return"),
    current_user: DBUser = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all role applications with skip/limit pagination (Admin only).
    This endpoint matches the client API expectations.
    """
    
    query = db.query(DBRoleApplication).options(
        joinedload(DBRoleApplication.applicant),
        joinedload(DBRoleApplication.reviewer)
    )
    
    if status:
        query = query.filter(DBRoleApplication.status == status)
    if role:
        query = query.filter(DBRoleApplication.requested_role == role)
    
    applications_result = await db.execute(
        query.order_by(DBRoleApplication.applied_at.desc())
        .offset(skip).limit(limit)
    )
    applications = applications_result.scalars().all()
    
    result = []
    for app in applications:
        app_data = RoleApplication.model_validate(app)
        if app.applicant:
            app_data.user = app.applicant
        if app.reviewer:
            app_data.reviewed_by_user = app.reviewer
        result.append(app_data)
    
    return result


@router.put("/{application_id}/review", response_model=SuccessResponse)
async def review_application(
    application_id: int,
    review_data: RoleApplicationUpdate,
    current_user: DBUser = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Review a role application (Admin only).
    Approve or reject with optional notes.
    """
    
    application_result = await db.execute(
        db.query(DBRoleApplication).filter(DBRoleApplication.id == application_id)
    )
    application = application_result.scalar_one_or_none()
    
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
    
    application.status = review_data.status
    application.admin_notes = review_data.admin_notes
    application.reviewed_by = current_user.id
    application.reviewed_at = datetime.utcnow()
    
    if review_data.status == RoleApplicationStatus.APPROVED:
        user_result = await db.execute(
            db.query(DBUser).filter(DBUser.id == application.user_id)
        )
        user = user_result.scalar_one_or_none()
        if user:
            user.role = UserRole(application.requested_role)
            user.updated_at = datetime.utcnow()
    
    await db.commit()
    
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
async def get_applications_stats(
    current_user: DBUser = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_async_db)
):
    """Get role application statistics (Admin only)."""
    
    total_result = await db.execute(db.query(DBRoleApplication))
    total_applications = len(total_result.scalars().all())
    
    pending_result = await db.execute(
        db.query(DBRoleApplication).filter(
            DBRoleApplication.status == RoleApplicationStatus.PENDING
        )
    )
    pending_applications = len(pending_result.scalars().all())
    
    approved_result = await db.execute(
        db.query(DBRoleApplication).filter(
            DBRoleApplication.status == RoleApplicationStatus.APPROVED
        )
    )
    approved_applications = len(approved_result.scalars().all())
    
    rejected_result = await db.execute(
        db.query(DBRoleApplication).filter(
            DBRoleApplication.status == RoleApplicationStatus.REJECTED
        )
    )
    rejected_applications = len(rejected_result.scalars().all())
    
    role_stats = {}
    for role in ApplicationableRole:
        role_result = await db.execute(
            db.query(DBRoleApplication).filter(
                DBRoleApplication.requested_role == role
            )
        )
        count = len(role_result.scalars().all())
        role_stats[role.value] = count
    
    return {
        "total_applications": total_applications,
        "pending_applications": pending_applications,
        "approved_applications": approved_applications,
        "rejected_applications": rejected_applications,
        "by_role": role_stats,
        "by_status": {
            "pending": pending_applications,
            "approved": approved_applications,
            "rejected": rejected_applications,
            "total": total_applications
        }
    }


@router.delete("/{application_id}", response_model=SuccessResponse)
async def withdraw_application(
    application_id: int,
    current_user: DBUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Withdraw a pending role application.
    Users can only withdraw their own pending applications.
    """
    
    application_result = await db.execute(
        db.query(DBRoleApplication).filter(
            and_(
                DBRoleApplication.id == application_id,
                DBRoleApplication.user_id == current_user.id,
                DBRoleApplication.status == RoleApplicationStatus.PENDING
            )
        )
    )
    application = application_result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending application not found"
        )
    
    await db.delete(application)
    await db.commit()
    
    return SuccessResponse(
        message="Application withdrawn successfully",
        data={"application_id": application_id}
    )
