from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from .common import UserRole, UserStatus


# User Models
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.USER


class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserInDB(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    hashed_password: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# Role Application Models
class RoleApplicationBase(BaseModel):
    requested_role: str  # mentor, seller, writer
    reason: str
    application_data: Optional[dict] = None


class RoleApplicationCreate(RoleApplicationBase):
    pass


class RoleApplicationUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None


class RoleApplicationInDB(RoleApplicationBase):
    id: int
    user_id: int
    status: str
    admin_notes: Optional[str] = None
    reviewed_by: Optional[int] = None
    applied_at: datetime
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class RoleApplication(RoleApplicationInDB):
    # For API responses with user details
    user: Optional["User"] = None
    reviewed_by_user: Optional["User"] = None

    class Config:
        from_attributes = True
