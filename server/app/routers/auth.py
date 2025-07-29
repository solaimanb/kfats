from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db
from app.models.user import User as DBUser
from app.schemas.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, Token
from app.schemas.common import UserRole, UserStatus, SuccessResponse
from app.core.security import get_password_hash
from app.core.dependencies import get_current_active_user
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=SuccessResponse)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    existing_user = db.query(DBUser).filter(
        (DBUser.email == user_data.email) | (DBUser.username == user_data.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    hashed_password = get_password_hash(user_data.password)
    db_user = DBUser(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        phone=user_data.phone,
        bio=user_data.bio,
        avatar_url=user_data.avatar_url,
        hashed_password=hashed_password,
        role=user_data.role,
        status=UserStatus.ACTIVE
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return SuccessResponse(
        message="User registered successfully",
        data={"user_id": db_user.id, "username": db_user.username}
    )


@router.post("/login", response_model=Token)
async def login(user_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return access token."""
    return AuthService.login_user(db, user_data)


@router.post("/login/oauth", response_model=Token)
async def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible login endpoint."""
    
    from app.schemas.auth import LoginRequest
    
    user = db.query(DBUser).filter(DBUser.email == form_data.username).first()
    if not user:
        user = db.query(DBUser).filter(DBUser.username == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    login_request = LoginRequest(email=user.email, password=form_data.password)
    
    return AuthService.login_user(db, login_request)


@router.post("/role-upgrade", response_model=SuccessResponse)
async def upgrade_user_role(
    new_role: UserRole,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upgrade user role (e.g., user -> student when enrolling in a course)."""
    
    upgrade_rules = {
        UserRole.USER: [UserRole.STUDENT, UserRole.MENTOR, UserRole.SELLER, UserRole.WRITER],
        UserRole.STUDENT: [UserRole.MENTOR, UserRole.SELLER, UserRole.WRITER],
    }
    
    current_role = UserRole(current_user.role)
    
    if new_role not in upgrade_rules.get(current_role, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot upgrade from {current_role} to {new_role}"
        )
    
    db_user = db.query(DBUser).filter(DBUser.id == current_user.id).first()
    db_user.role = new_role
    db.commit()
    
    return SuccessResponse(
        message=f"Role upgraded to {new_role} successfully",
        data={"old_role": current_role, "new_role": new_role}
    )
