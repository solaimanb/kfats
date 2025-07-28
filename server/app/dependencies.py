from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db, User as DBUser
from app.models import User, UserRole
from app.auth import verify_token

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
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def require_role(required_role: UserRole):
    """Decorator factory to require specific user role."""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}"
            )
        return current_user
    return role_checker


def require_roles(required_roles: list[UserRole]):
    """Decorator factory to require one of multiple user roles."""
    def roles_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}"
            )
        return current_user
    return roles_checker


# Role-specific dependencies
def get_admin_user(current_user: User = Depends(require_role(UserRole.ADMIN))):
    return current_user


def get_mentor_user(current_user: User = Depends(require_role(UserRole.MENTOR))):
    return current_user


def get_student_user(current_user: User = Depends(require_role(UserRole.STUDENT))):
    return current_user


def get_seller_user(current_user: User = Depends(require_role(UserRole.SELLER))):
    return current_user


def get_writer_user(current_user: User = Depends(require_role(UserRole.WRITER))):
    return current_user


def get_mentor_or_admin(current_user: User = Depends(require_roles([UserRole.MENTOR, UserRole.ADMIN]))):
    return current_user


def get_writer_or_admin(current_user: User = Depends(require_roles([UserRole.WRITER, UserRole.ADMIN]))):
    return current_user


def get_seller_or_admin(current_user: User = Depends(require_roles([UserRole.SELLER, UserRole.ADMIN]))):
    return current_user
