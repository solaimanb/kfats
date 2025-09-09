from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel


class TokenBlacklist(BaseModel):
    """Token blacklist for revoked tokens."""
    __tablename__ = "token_blacklist"

    token = Column(String, unique=True, index=True, nullable=False)
    token_type = Column(String, nullable=False)  # access or refresh
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), server_default=func.now())
    revocation_reason = Column(String, nullable=True)

    # Relationship
    user = relationship("User", back_populates="blacklisted_tokens")


class LoginAttempt(BaseModel):
    """Track login attempts for brute force protection."""
    __tablename__ = "login_attempts"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    email = Column(String, index=True, nullable=False)
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    successful = Column(Boolean, default=False, nullable=False)
    attempted_at = Column(DateTime(timezone=True), server_default=func.now())
    failure_reason = Column(String, nullable=True)

    # Relationship
    user = relationship("User", back_populates="login_attempts")


class PasswordHistory(BaseModel):
    """Store password history to prevent reuse."""
    __tablename__ = "password_history"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hashed_password = Column(String, nullable=False)
    set_at = Column(DateTime(timezone=True), server_default=func.now())
    set_by = Column(String, nullable=True)  # 'user' or 'admin'

    # Relationship
    user = relationship("User", back_populates="password_history")


class UserSession(BaseModel):
    """Track active user sessions."""
    __tablename__ = "user_sessions"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String, unique=True, index=True, nullable=False)
    device_info = Column(JSON, nullable=True)  # Store device fingerprint
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationship
    user = relationship("User", back_populates="sessions")


class SecurityEvent(BaseModel):
    """Log security-related events."""
    __tablename__ = "security_events"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event_type = Column(String, nullable=False)  # login, logout, password_change, etc.
    severity = Column(String, nullable=False)  # low, medium, high, critical
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="security_events")
