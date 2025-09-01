from datetime import timedelta, datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.user import User as DBUser
from app.schemas import User, LoginRequest, RegisterRequest, Token
from app.core.security import verify_password, create_access_token
from app.services.user_service import UserService
from app.schemas.common import UserStatus
from app.core.config import settings


class AuthService:
    """Service layer for authentication operations."""
    
    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[DBUser]:
        """Authenticate user with email and password."""
        user = await UserService.get_user_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
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
        
        # Ensure robust comparison regardless of enum/string backing
        try:
            user_status_value = user.status.value if hasattr(user.status, 'value') else str(user.status)
        except Exception:
            user_status_value = str(user.status)
        if str(user_status_value).lower() != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is not active"
            )
        
        user.last_login = datetime.utcnow()
        await db.commit()
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={
                "sub": user.username, 
                "user_id": user.id,
                "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
                "email": user.email
            },
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=User.model_validate(user)
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
