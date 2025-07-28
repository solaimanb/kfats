from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_db
from app.models.user import User as DBUser
from app.schemas.user import User, UserUpdate
from app.schemas.common import UserRole, SuccessResponse
from app.core.dependencies import get_current_active_user, get_admin_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user's profile."""
    return current_user


@router.put("/me", response_model=User)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    
    db_user = db.query(DBUser).filter(DBUser.id == current_user.id).first()
    
    # Check for username uniqueness if being updated
    if user_update.username and user_update.username != current_user.username:
        existing_user = db.query(DBUser).filter(
            DBUser.username == user_update.username,
            DBUser.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    
    return User.model_validate(db_user)


@router.get("/", response_model=List[User])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of users (Admin only)."""
    
    query = db.query(DBUser)
    
    if role:
        query = query.filter(DBUser.role == role)
    
    users = query.offset(skip).limit(limit).all()
    return [User.model_validate(user) for user in users]


@router.get("/{user_id}", response_model=User)
async def get_user_by_id(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (Admin only)."""
    
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User.model_validate(user)


@router.put("/{user_id}/role", response_model=SuccessResponse)
async def update_user_role(
    user_id: int,
    new_role: UserRole,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user role (Admin only)."""
    
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    old_role = user.role
    user.role = new_role
    db.commit()
    
    return SuccessResponse(
        message=f"User role updated successfully",
        data={"user_id": user_id, "old_role": old_role, "new_role": new_role}
    )


@router.delete("/{user_id}", response_model=SuccessResponse)
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete user (Admin only)."""
    
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Don't allow deleting admin users
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete admin users"
        )
    
    db.delete(user)
    db.commit()
    
    return SuccessResponse(
        message="User deleted successfully",
        data={"user_id": user_id}
    )
