import os
from typing import Optional, List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    app_name: str = "KFATS LMS API"
    app_version: str = "1.0.0"
    debug: bool = False
    client_app_url: str

    # Database
    database_url: str

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

    # Pagination
    default_page_size: int = 20
    max_page_size: int = 100

    class Config:
        env_file = ".env"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS origins string to list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def allowed_image_types_list(self) -> List[str]:
        """Convert allowed image types string to list."""
        return [mime_type.strip() for mime_type in self.allowed_image_types.split(",")]


settings = Settings()
