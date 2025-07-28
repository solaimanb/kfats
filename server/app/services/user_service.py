from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User as DBUser
from app.schemas import User, UserCreate, UserUpdate, UserRole
from app.core.security import get_password_hash


class UserService:
    """Service layer for user operations."""
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[DBUser]:
        """Get user by ID."""
        return db.query(DBUser).filter(DBUser.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[DBUser]:
        """Get user by email."""
        return db.query(DBUser).filter(DBUser.email == email).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[DBUser]:
        """Get user by username."""
        return db.query(DBUser).filter(DBUser.username == username).first()
    
    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> DBUser:
        """Create a new user."""
        # Check if user already exists
        existing_user = db.query(DBUser).filter(
            (DBUser.email == user_create.email) | (DBUser.username == user_create.username)
        ).first()
        
        if existing_user:
            if existing_user.email == user_create.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Create new user
        hashed_password = get_password_hash(user_create.password)
        db_user = DBUser(
            email=user_create.email,
            username=user_create.username,
            full_name=user_create.full_name,
            phone=user_create.phone,
            bio=user_create.bio,
            avatar_url=user_create.avatar_url,
            hashed_password=hashed_password,
            role=user_create.role
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdate) -> DBUser:
        """Update user information."""
        db_user = UserService.get_user_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check username uniqueness if being updated
        if user_update.username and user_update.username != db_user.username:
            existing_user = db.query(DBUser).filter(
                DBUser.username == user_update.username,
                DBUser.id != user_id
            ).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Update user fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def upgrade_user_role(db: Session, user_id: int, new_role: UserRole) -> DBUser:
        """Upgrade user role."""
        db_user = UserService.get_user_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db_user.role = new_role
        db.commit()
        db.refresh(db_user)
        return db_user
