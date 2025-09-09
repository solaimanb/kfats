from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_async_db
from app.models.user import User as DBUser
from app.schemas.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, Token
from app.schemas.common import UserRole, UserStatus, SuccessResponse
from pydantic import BaseModel
from app.core.security import get_password_hash
from app.core.dependencies import get_current_active_user
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=SuccessResponse)
async def register(user_data: RegisterRequest, db: AsyncSession = Depends(get_async_db)):
    """Register a new user."""
    result = await AuthService.register_user(db, user_data)
    return SuccessResponse(message=result["message"], data={"user_id": result["user_id"], "username": result["username"]})


@router.post("/login", response_model=Token)
async def login(user_data: LoginRequest, db: AsyncSession = Depends(get_async_db)):
    """Authenticate user and return access token."""
    return await AuthService.login_user(db, user_data)


@router.post("/login/oauth", response_model=Token)
async def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_async_db)):
    """OAuth2 compatible login endpoint."""
    
    from app.schemas.auth import LoginRequest
    
    result = await db.execute(select(DBUser).where(DBUser.email == form_data.username))
    user = result.scalars().first()
    if not user:
        result = await db.execute(select(DBUser).where(DBUser.username == form_data.username))
        user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    login_request = LoginRequest(email=user.email, password=form_data.password)
    
    return await AuthService.login_user(db, login_request)


class RoleUpgradeBody(BaseModel):
    new_role: UserRole


@router.post("/role-upgrade", response_model=SuccessResponse)
async def upgrade_user_role(
    body: RoleUpgradeBody,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Upgrade user role (e.g., user -> student when enrolling in a course)."""
    
    upgrade_rules = {
        UserRole.USER: [UserRole.STUDENT, UserRole.MENTOR, UserRole.SELLER, UserRole.WRITER],
        UserRole.STUDENT: [UserRole.MENTOR, UserRole.SELLER, UserRole.WRITER],
    }
    
    current_role = UserRole(current_user.role)
    
    if body.new_role not in upgrade_rules.get(current_role, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot upgrade from {current_role} to {body.new_role}"
        )
    
    result = await db.execute(select(DBUser).where(DBUser.id == current_user.id))
    db_user = result.scalars().first()
    db_user.role = body.new_role
    await db.commit()
    
    return SuccessResponse(
        message=f"Role upgraded to {body.new_role} successfully",
        data={"old_role": current_role, "new_role": body.new_role}
    )
