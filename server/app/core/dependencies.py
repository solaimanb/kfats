from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.database import get_db
from app.models.user import User as DBUser
from app.schemas.user import User
from app.schemas.common import UserRole, UserStatus
from app.core.security import verify_token

# Security scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    token_data = verify_token(token)
    
    user = db.query(DBUser).filter(DBUser.id == token_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return User.model_validate(user)


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user."""
    # Ensure we compare enum to enum (or its value)
    if isinstance(current_user.status, UserStatus):
        is_active = current_user.status == UserStatus.ACTIVE
    else:
        is_active = str(current_user.status).lower() == "active"

    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def require_role(required_role: UserRole):
    """Decorator factory to require specific user role."""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        # Ensure robust enum comparison
        user_role = UserRole(current_user.role)
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role.value}"
            )
        return current_user
    return role_checker


def require_roles(allowed_roles: list[UserRole]):
    """Decorator factory to require one of multiple user roles."""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        # Ensure robust enum comparison and admin bypass
        user_role = UserRole(current_user.role)
        
        # Always allow admin access
        if user_role == UserRole.ADMIN:
            return current_user
            
        # Check if user has one of the allowed roles
        if user_role not in allowed_roles:
            allowed_roles_str = ", ".join([role.value for role in allowed_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles_str}"
            )
        return current_user
    return role_checker


# Convenience dependency functions
def get_admin_user(current_user: User = Depends(require_role(UserRole.ADMIN))):
    """Require admin role."""
    return current_user


def get_mentor_or_admin(current_user: User = Depends(require_roles([UserRole.MENTOR, UserRole.ADMIN]))):
    """Allow mentor or admin access."""
    return current_user


def get_seller_or_admin(current_user: User = Depends(require_roles([UserRole.SELLER, UserRole.ADMIN]))):
    """Allow seller or admin access."""
    return current_user


def get_writer_or_admin(current_user: User = Depends(require_roles([UserRole.WRITER, UserRole.ADMIN]))):
    """Allow writer or admin access."""
    return current_user
