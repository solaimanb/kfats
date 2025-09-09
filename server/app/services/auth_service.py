from datetime import timedelta, datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User as DBUser
from app.schemas import User, LoginRequest, RegisterRequest, Token, PasswordChangeRequest
from app.core.security import verify_password, create_access_token, get_password_hash
from app.services.user_service import UserService
from app.schemas.common import UserStatus
from app.core.config import settings


class AuthService:
    """Simple service layer for authentication operations."""

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[DBUser]:
        """Authenticate user with email and password."""
        result = await db.execute(select(DBUser).where(DBUser.email == email))
        user = result.scalars().first()
        if not user:
            return None
        if not verify_password(password, str(user.hashed_password)):
            return None
        return user

    @staticmethod
    async def login_user(db: AsyncSession, login_data: LoginRequest) -> Token:
        """Login user and return access token."""
        user = await AuthService.authenticate_user(db, login_data.email, login_data.password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is active
        user_status_value = user.status.value if hasattr(user.status, 'value') else str(user.status)
        if str(user_status_value).lower() != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is not active"
            )

        # Update last login
        user.last_login = datetime.utcnow()  # type: ignore
        
        # Get user data before commit (to avoid detached session issues)
        user_data = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "phone": user.phone,
            "bio": user.bio,
            "avatar_url": user.avatar_url,
            "role": user.role,
            "status": user.status,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "last_login": user.last_login,
        }
        
        await db.commit()

        # Create access token
        access_token = create_access_token(
            data={
                "sub": user.username,
                "user_id": user.id,
                "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
                "email": user.email
            }
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=User.model_validate(user_data)
        )

    @staticmethod
    async def register_user(db: AsyncSession, register_data: RegisterRequest) -> dict:
        """Register a new user."""
        if register_data.password != register_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        user_data = register_data.model_dump()
        user_data.pop('confirm_password')

        from app.schemas import UserCreate
        user_create = UserCreate(**user_data)
        user = await UserService.create_user(db, user_create)

        return {
            "message": "User registered successfully",
            "user_id": user.id,
            "username": user.username
        }

    @staticmethod
    async def change_password(db: AsyncSession, password_data: PasswordChangeRequest, current_user: User):
        """Change user password."""
        if password_data.new_password != password_data.confirm_new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New passwords do not match"
            )

        # Verify current password
        result = await db.execute(select(DBUser).where(DBUser.id == current_user.id))
        db_user = result.scalars().first()

        if not db_user or not verify_password(password_data.current_password, str(db_user.hashed_password)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        # Update password
        db_user.hashed_password = get_password_hash(password_data.new_password)  # type: ignore
        db_user.updated_at = datetime.utcnow()  # type: ignore
        await db.commit()

        return {"message": "Password updated successfully"}
