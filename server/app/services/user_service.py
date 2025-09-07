from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models import User as DBUser
from app.schemas import User, UserCreate, UserUpdate, UserRole
from app.core.security import get_password_hash


class UserService:
    """Service layer for user operations."""
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[DBUser]:
        """Get user by ID."""
        result = await db.execute(
            select(DBUser).where(DBUser.id == user_id)
        )
        return result.scalars().first()
    
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[DBUser]:
        """Get user by email."""
        result = await db.execute(
            select(DBUser).where(DBUser.email == email)
        )
        return result.scalars().first()
    
    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> Optional[DBUser]:
        """Get user by username."""
        result = await db.execute(
            select(DBUser).where(DBUser.username == username)
        )
        return result.scalars().first()
    
    @staticmethod
    async def create_user(db: AsyncSession, user_create: UserCreate) -> DBUser:
        """Create a new user."""
        # Check if user already exists
        result = await db.execute(
            select(DBUser).where(
                (DBUser.email == user_create.email) | (DBUser.username == user_create.username)
            )
        )
        existing_user = result.scalars().first()
        
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
        await db.commit()
        await db.refresh(db_user)
        return db_user
    
    @staticmethod
    async def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate) -> DBUser:
        """Update user information."""
        db_user = await UserService.get_user_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check username uniqueness if being updated
        if user_update.username and user_update.username != db_user.username:
            result = await db.execute(
                select(DBUser).where(
                    DBUser.username == user_update.username,
                    DBUser.id != user_id
                )
            )
            existing_user = result.scalars().first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Update user fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        await db.commit()
        await db.refresh(db_user)
        return db_user
    
    @staticmethod
    async def upgrade_user_role(db: AsyncSession, user_id: int, new_role: UserRole) -> DBUser:
        """Upgrade user role."""
        db_user = await UserService.get_user_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db_user.role = new_role
        await db.commit()
        await db.refresh(db_user)
        return db_user
