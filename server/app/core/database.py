from sqlalchemy import create_engine, Index
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.core.config import settings

# Import all models to register them with SQLAlchemy
from app.models.user import User, RoleApplication
from app.models.course import Course, Enrollment
from app.models.article import Article
from app.models.product import Product
from app.models.password_reset_token import PasswordResetToken

# PostgreSQL connection configuration with best practices
engine = create_engine(
    settings.database_url,
    # Connection pool settings for PostgreSQL
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600,
    # PostgreSQL specific settings
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
        "application_name": "KFATS_LMS_API",
    },
    echo=settings.debug  # Log SQL queries in debug mode
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
