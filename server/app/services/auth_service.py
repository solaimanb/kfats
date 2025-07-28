from datetime import timedelta, datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User as DBUser
from app.schemas import User, LoginRequest, RegisterRequest, Token, UserRole
from app.core.security import verify_password, create_access_token
from app.services.user_service import UserService
from app.core.config import settings


class AuthService:
    """Service layer for authentication operations."""
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[DBUser]:
        """Authenticate user with email and password."""
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def login_user(db: Session, login_data: LoginRequest) -> Token:
        """Login user and return access token."""
        user = AuthService.authenticate_user(db, login_data.email, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is not active"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=User.model_validate(user)
        )
    
    @staticmethod
    def register_user(db: Session, register_data: RegisterRequest) -> dict:
        """Register a new user."""
        # Validate password confirmation
        if register_data.password != register_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        # Create user
        user_data = register_data.model_dump()
        user_data.pop('confirm_password')  # Remove confirm_password field
        
        from app.schemas import UserCreate
        user_create = UserCreate(**user_data)
        user = UserService.create_user(db, user_create)
        
        return {
            "message": "User registered successfully",
            "user_id": user.id,
            "username": user.username
        }
