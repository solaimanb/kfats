from typing import AsyncGenerator, Generator, Optional, Tuple
from urllib.parse import parse_qsl, urlparse, urlunparse, urlencode

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker as sync_sessionmaker

from app.core.config import settings
from app.models.base import Base

from app.models import (
    article,
    course,
    password_reset_token,
    product,
    user,
)

__all__ = [
    "engine",
    "AsyncSessionLocal",
    "SessionLocal",
    "get_async_db",
    "get_db",
    "create_tables",
]


def _is_postgres(url: Optional[str]) -> bool:
    """Return True if URL scheme indicates a PostgreSQL DB."""
    if not url:
        return False
    return urlparse(url).scheme.startswith("postgres")


def _make_async_url(url: str) -> Tuple[str, bool]:
    """Convert a DB URL to an async-compatible URL and detect ssl requirement.

    Returns (async_url, ssl_required).
    """
    ssl_required = False
    if url.startswith("postgresql+asyncpg://"):
        async_url = url
    elif url.startswith("postgres://"):
        async_url = "postgresql+asyncpg://" + url[len("postgres://") :]
    elif url.startswith("postgresql://"):
        async_url = "postgresql+asyncpg://" + url[len("postgresql://") :]
    else:
        async_url = url

    parsed = urlparse(async_url)
    if parsed.query:
        q = dict(parse_qsl(parsed.query, keep_blank_values=True))
        if "sslmode" in q:
            val = q.pop("sslmode")
            if val and val.lower() != "disable":
                ssl_required = True
        q.pop("channel_binding", None)
        new_query = urlencode(q, doseq=True)
        parsed = parsed._replace(query=new_query)
        async_url = urlunparse(parsed)

    return async_url, ssl_required


DATABASE_URL = settings.database_url or "sqlite+aiosqlite:///./test.db"
ASYNC_DATABASE_URL, ssl_required = _make_async_url(DATABASE_URL)

connect_args = {}
if _is_postgres(DATABASE_URL):
    connect_args = {"timeout": 10}
    if ssl_required:
        connect_args["ssl"] = True


engine: AsyncEngine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=settings.debug,
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


SYNC_DATABASE_URL = DATABASE_URL.replace("+asyncpg", "").replace("+aiosqlite", "")
sync_engine = create_engine(SYNC_DATABASE_URL, echo=settings.debug, pool_pre_ping=True)
SessionLocal = sync_sessionmaker(
    bind=sync_engine, autocommit=False, autoflush=False, class_=Session
)


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Async FastAPI dependency that yields an AsyncSession.

    Use this in async endpoints / services that expect an AsyncSession.
    """
    async with AsyncSessionLocal() as session:
        yield session


def get_db() -> Generator[Session, None, None]:
    """Sync FastAPI dependency that yields a synchronous :class:`Session`.

    This preserves backwards compatibility for code that uses the sync ORM
    API (``db.query()``, ``db.commit()``, etc.).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_sync_tables() -> None:
    """Create DB tables using a synchronous engine (for local dev/setup)."""
    sync_url = (
        DATABASE_URL.replace("+asyncpg", "").replace("+aiosqlite", "")
        if "+asyncpg" in DATABASE_URL or "+aiosqlite" in DATABASE_URL
        else DATABASE_URL
    )
    local_engine = create_engine(sync_url)
    Base.metadata.create_all(bind=local_engine)


async def create_tables_async() -> None:
    """Create DB tables using an async engine (for async startup)."""
    async_url = DATABASE_URL
    if DATABASE_URL.startswith("sqlite://"):
        async_url = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")
    
    local_engine = create_async_engine(async_url)
    async with local_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def create_tables() -> None:
    """Backwards-compatible wrapper for creating tables synchronously."""
    create_sync_tables()
