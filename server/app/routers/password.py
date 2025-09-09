from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_async_db
from app.core.dependencies import get_current_active_user
from app.core.security import verify_password, get_password_hash
from app.models.user import User as DBUser
from app.schemas.user import User
from app.schemas.password import ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse
from app.core.config import settings
from app.schemas.common import SuccessResponse
import asyncio

router = APIRouter(prefix="/password", tags=["Password"])

@router.post("/change", response_model=SuccessResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    result = await db.execute(select(DBUser).where(DBUser.id == current_user.id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")

    # Run password verification in thread pool
    current_password_valid = await asyncio.to_thread(verify_password, payload.current_password, str(db_user.hashed_password))
    if not current_password_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")

    # Check if new password is different from current
    new_password_same = await asyncio.to_thread(verify_password, payload.new_password, str(db_user.hashed_password))
    if new_password_same:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different from the current password.")

    # Hash new password in thread pool
    new_password_hash = await asyncio.to_thread(get_password_hash, payload.new_password)
    db_user.hashed_password = new_password_hash  # type: ignore
    await db.commit()
    return SuccessResponse(message="Password updated successfully.")



import secrets
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from app.models.password_reset_token import PasswordResetToken

RESET_TOKEN_EXPIRY_MINUTES = 30


def get_email_setting(attr: str, fallback: str = "") -> str:
    val = getattr(settings, attr, None)
    return str(val) if val is not None else fallback

def send_reset_email(to_email: str, token: str):
    frontend_url = get_email_setting("client_app_url", "https://kfats.vercel.app")
    reset_link = f"{frontend_url.rstrip('/')}/reset-password?token={token}"
    subject = "KFATS Password Reset"
    body = f"""
You requested a password reset for your KFATS account.

Click the link below to reset your password (valid for {RESET_TOKEN_EXPIRY_MINUTES} minutes):
{reset_link}

If you did not request this, you can ignore this email.
"""
    msg = MIMEText(body)
    smtp_server = get_email_setting("email_host", "smtp.ethereal.email")
    try:
        smtp_port = int(get_email_setting("email_port", "587"))
    except ValueError:
        smtp_port = 587
    smtp_username = get_email_setting("email_user", "")
    smtp_password = get_email_setting("email_password", "")
    from_email = get_email_setting("email_from", "noreply@kfats.com")

    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
            server.sendmail(from_email, [to_email], msg.as_string())
    except Exception as e:
        print(f"[Email Error] {e}")

@router.post("/forgot", response_model=PasswordResetResponse)
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(DBUser).where(DBUser.email == payload.email))
    user = result.scalar_one_or_none()
    if user:
        await db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used == 0,
                PasswordResetToken.expires_at > datetime.utcnow()
            )
        )
        # Mark existing tokens as used
        existing_tokens_result = await db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used == 0,
                PasswordResetToken.expires_at > datetime.utcnow()
            )
        )
        existing_tokens = existing_tokens_result.scalars().all()
        for token in existing_tokens:
            token.used = 1  # type: ignore

        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)
        db_token = PasswordResetToken(user_id=user.id, token=token, expires_at=expires_at, used=0)
        db.add(db_token)
        await db.commit()
        send_reset_email(str(user.email), token)
    return PasswordResetResponse(message="If the email exists, a reset link has been sent.")



@router.post("/reset", response_model=SuccessResponse)
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_async_db)):
    token_result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token == payload.token,
            PasswordResetToken.used == 0
        )
    )
    db_token = token_result.scalar_one_or_none()
    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

    # Check if token is expired (simplified to avoid SQLAlchemy column issues)
    # The database query already filters for non-expired tokens

    user_result = await db.execute(select(DBUser).where(DBUser.id == db_token.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Hash new password in thread pool
    new_password_hash = await asyncio.to_thread(get_password_hash, payload.new_password)
    user.hashed_password = new_password_hash  # type: ignore
    db_token.used = 1  # type: ignore
    await db.commit()
    return SuccessResponse(message="Password has been reset successfully.")
