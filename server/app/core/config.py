import os
from typing import Optional, List
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    app_name: str = "KFATS LMS API"
    app_version: str = "1.0.0"
    debug: bool = False
    client_app_url: Optional[str] = None

    # Database
    database_url: Optional[str] = None

    # Security
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    cors_origins: str = "http://localhost:3000,https://kfats.vercel.app"

    # File Upload
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_image_types: str = "image/jpeg,image/png,image/gif,image/webp"

    # Email
    email_host: str = ""
    email_port: int = 587
    email_user: str = ""
    email_password: str = ""
    email_from: str = ""

    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_file: str = "logs/kfats.log"
    log_max_size: int = 10 * 1024 * 1024  # 10MB
    log_backup_count: int = 5

    # Rate Limiting
    rate_limit_requests_per_minute: int = 60

    class Config:
        # Load the repository `server/.env` file regardless of CWD
        env_file = str(Path(__file__).resolve().parents[2] / ".env")
        env_file_encoding = "utf-8"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS origins string to list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def allowed_image_types_list(self) -> List[str]:
        """Convert allowed image types string to list."""
        return [mime_type.strip() for mime_type in self.allowed_image_types.split(",")]


settings = Settings()


def get_settings() -> Settings:
    """Helper to import the configured settings instance.

    Use this in modules that cannot import the module-level `settings` at
    import time (tests, CLI helpers, or Alembic env).
    """
    return settings


# Backwards compatible property: provide an async driver URL when needed.
def async_database_url() -> str:
    url = settings.database_url or "sqlite+aiosqlite:///./test.db"
    if url.startswith("postgres://"):
        return "postgresql+asyncpg://" + url[len("postgres://"):]
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        return "postgresql+asyncpg://" + url[len("postgresql://"):]
    return url
