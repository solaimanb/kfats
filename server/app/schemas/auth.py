from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from .common import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: "User"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    password: str
    confirm_password: str
    role: UserRole = UserRole.USER


# Resolve forward reference
from .user import User
Token.model_rebuild()
