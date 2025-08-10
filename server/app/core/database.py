from sqlalchemy import create_engine, Index
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.core.config import settings
from urllib.parse import urlparse

# Import all models to register them with SQLAlchemy
from app.models.user import User, RoleApplication
from app.models.course import Course, Enrollment
from app.models.article import Article
from app.models.product import Product
from app.models.password_reset_token import PasswordResetToken

# PostgreSQL connection configuration with best practices
parsed = urlparse(settings.database_url)
is_postgres = parsed.scheme.startswith("postgres")

connect_args = {}
if is_postgres:
    connect_args = {
        "sslmode": "require",
        "connect_timeout": 10,
        "application_name": "KFATS_LMS_API",
    }

engine = create_engine(
    settings.database_url,
    pool_size=10 if is_postgres else None,
    max_overflow=20 if is_postgres else None,
    pool_timeout=30 if is_postgres else None,
    pool_recycle=3600 if is_postgres else None,
    connect_args=connect_args,
    echo=settings.debug
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create database tables."""
    Base.metadata.create_all(bind=engine)
