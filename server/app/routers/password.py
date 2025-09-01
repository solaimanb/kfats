from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_db
from app.core.dependencies import get_current_active_user
from app.core.security import verify_password, get_password_hash
from app.models.user import User as DBUser
from app.schemas.user import User
from app.schemas.password import ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse
from app.core.config import settings
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/password", tags=["Password"])

@router.post("/change", response_model=SuccessResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    db_user = await db.execute(db.query(DBUser).filter(DBUser.id == current_user.id))
    db_user = db_user.scalar_one_or_none()
    if not db_user or not verify_password(payload.current_password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")
    if verify_password(payload.new_password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different from the current password.")
    db_user.hashed_password = get_password_hash(payload.new_password)
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
    user_result = await db.execute(db.query(DBUser).filter(DBUser.email == payload.email))
    user = user_result.scalar_one_or_none()
    if user:
        await db.execute(
            db.query(PasswordResetToken).filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used == 0,
                PasswordResetToken.expires_at > datetime.utcnow()
            ).update({PasswordResetToken.used: 1})
        )
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)
        db_token = PasswordResetToken(user_id=user.id, token=token, expires_at=expires_at, used=0)
        db.add(db_token)
        await db.commit()
        send_reset_email(user.email, token)
    return PasswordResetResponse(message="If the email exists, a reset link has been sent.")



@router.post("/reset", response_model=SuccessResponse)
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_async_db)):
    db_token_result = await db.execute(
        db.query(PasswordResetToken).filter(
            PasswordResetToken.token == payload.token,
            PasswordResetToken.used == 0
        )
    )
    db_token = db_token_result.scalar_one_or_none()
    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")
    if datetime.utcnow() > db_token.expires_at:
        db_token.used = 1
        await db.commit()
        raise HTTPException(status_code=400, detail="Token has expired.")
    user_result = await db.execute(db.query(DBUser).filter(DBUser.id == db_token.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.hashed_password = get_password_hash(payload.new_password)
    db_token.used = 1
    await db.commit()
    return SuccessResponse(message="Password has been reset successfully.")
