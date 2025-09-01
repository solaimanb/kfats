from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, String
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from app.core.database import get_async_db
from app.models.user import User as DBUser
from app.schemas.user import User, UserUpdate
from app.schemas.common import UserRole, UserStatus, SuccessResponse, PaginatedResponse
from app.core.dependencies import get_current_active_user, get_admin_user
from app.core.exceptions import ConflictError, BusinessLogicError
from app.core.error_utils import (
    ensure_user_exists,
    handle_database_error,
    create_business_logic_error,
    require_authorization
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user's profile."""
    return current_user


@router.put("/me", response_model=User)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update current user's profile."""

    try:
        result = await db.execute(
            db.query(DBUser).filter(DBUser.id == current_user.id)
        )
        db_user = result.scalars().first()
        ensure_user_exists(current_user.id, db_user)

        if user_update.username and user_update.username != current_user.username:
            result = await db.execute(
                db.query(DBUser).filter(
                    DBUser.username == user_update.username,
                    DBUser.id != current_user.id
                )
            )
            existing_user = result.scalars().first()
            if existing_user:
                raise ConflictError(
                    message="Username already taken",
                    details={"field": "username", "value": user_update.username}
                )

        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        await db.commit()
        await db.refresh(db_user)

        return User.model_validate(db_user)

    except Exception as e:
        await db.rollback()
        if isinstance(e, ConflictError):
            raise
        handle_database_error(e)


@router.get("/", response_model=PaginatedResponse[User])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    status: Optional[str] = None,
    email: Optional[str] = None,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get paginated list of users (Admin only)."""
    
    query = db.query(DBUser)
    
    if role:
        query = query.filter(DBUser.role == role)
    
    if status:
        query = query.filter(DBUser.status == status)
    
    if email:
        search_term = f"%{email}%"
        query = query.filter(
            or_(
                DBUser.email.ilike(search_term),
                DBUser.full_name.ilike(search_term),
                DBUser.username.ilike(search_term),
                DBUser.role.cast(String).ilike(search_term)
            )
        )
    
    result = await db.execute(query)
    users = result.scalars().all()
    total = len(users)
    
    page = (skip // limit) + 1
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=[User.model_validate(user) for user in users],
        total=total,
        page=page,
        size=limit,
        pages=pages
    )


@router.get("/{user_id}", response_model=User)
async def get_user_by_id(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user by ID (Admin only)."""

    try:
        result = await db.execute(
            db.query(DBUser).filter(DBUser.id == user_id)
        )
        user = result.scalars().first()
        ensure_user_exists(user_id, user)

        return User.model_validate(user)

    except Exception as e:
        handle_database_error(e)


class UpdateRoleRequest(BaseModel):
    new_role: UserRole


@router.put("/{user_id}/role", response_model=SuccessResponse)
async def update_user_role(
    user_id: int,
    request: UpdateRoleRequest,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update user role (Admin only)."""
    
    result = await db.execute(
        db.query(DBUser).filter(DBUser.id == user_id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    old_role = user.role
    user.role = request.new_role
    await db.commit()
    
    return SuccessResponse(
        message=f"User role updated successfully",
        data={"user_id": user_id, "old_role": old_role, "new_role": request.new_role}
    )


@router.delete("/{user_id}", response_model=SuccessResponse)
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete user (Admin only)."""

    try:
        result = await db.execute(
            db.query(DBUser).filter(DBUser.id == user_id)
        )
        user = result.scalars().first()
        ensure_user_exists(user_id, user)

        if user.role == UserRole.ADMIN:
            raise create_business_logic_error(
                "Cannot delete admin users",
                user_id=user_id,
                user_role=user.role.value
            )

        await db.delete(user)
        await db.commit()

        return SuccessResponse(
            message="User deleted successfully",
            data={"user_id": user_id}
        )

    except Exception as e:
        await db.rollback()
        if isinstance(e, BusinessLogicError):
            raise
        handle_database_error(e)


@router.put("/{user_id}/toggle-status", response_model=SuccessResponse)
async def toggle_user_status(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Toggle a user's active status (Admin only)."""
    result = await db.execute(
        db.query(DBUser).filter(DBUser.id == user_id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change status of admin users"
        )

    try:
        current = UserStatus(user.status) if not isinstance(user.status, UserStatus) else user.status
    except Exception:
        current = UserStatus.ACTIVE if str(user.status).lower() == "active" else UserStatus.INACTIVE

    user.status = UserStatus.INACTIVE if current == UserStatus.ACTIVE else UserStatus.ACTIVE
    await db.commit()

    return SuccessResponse(
        message="User status updated successfully",
        data={"user_id": user_id, "new_status": user.status}
    )
