from typing import AsyncGenerator, Optional, Tuple
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker

from app.models.base import Base, metadata
from app.core.config import settings

# Ensure models are imported so they register with Base.metadata
# Importing modules for side-effects only
from app.models import user, course, article, product, password_reset_token  # noqa: F401


def _is_postgres(url: Optional[str]) -> bool:
    if not url:
        return False
    return urlparse(url).scheme.startswith("postgres")


# Prefer asyncpg async URL for AsyncEngine. If the provided DATABASE_URL uses
# postgres:// convert to postgresql+asyncpg:// for SQLAlchemy async driver.
def _make_async_url(url: str) -> Tuple[str, bool]:
    """Return (async_url, ssl_required).

    Converts postgres:// or postgresql:// to postgresql+asyncpg:// and
    strips any sslmode= query parameter (which asyncpg doesn't accept).
    If sslmode is present and not 'disable', return ssl_required=True so the
    caller can pass connect_args={'ssl': True} or an SSLContext.
    """
    ssl_required = False
    if url.startswith("postgresql+asyncpg://"):
        async_url = url
    else:
        if url.startswith("postgres://"):
            async_url = "postgresql+asyncpg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://"):
            async_url = "postgresql+asyncpg://" + url[len("postgresql://"):]
        else:
            async_url = url

    # parse and strip sslmode from query string (asyncpg doesn't accept sslmode)
    parsed = urlparse(async_url)
    if parsed.query:
        q = dict(parse_qsl(parsed.query, keep_blank_values=True))
        # strip psycopg/psycopg2-only params that asyncpg does not accept
        if "sslmode" in q:
            val = q.pop("sslmode")
            if val and val.lower() != "disable":
                ssl_required = True
        # asyncpg does not accept `channel_binding` kwarg (comes from some URLs)
        # remove it if present so SQLAlchemy's asyncpg dialect doesn't forward it
        if "channel_binding" in q:
            q.pop("channel_binding")
        # rebuild URL without the removed params
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
        # asyncpg expects `ssl` param (bool or SSLContext), not sslmode
        connect_args["ssl"] = True

# Create async engine
engine: AsyncEngine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=settings.debug,
    pool_pre_ping=True,
    connect_args=connect_args,
)

# Async session factory using SQLAlchemy 2.0 async_sessionmaker
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an AsyncSession."""
    async with AsyncSessionLocal() as session:
        yield session


def create_sync_tables():
    """Helper to create tables synchronously for local dev (uses sync engine).

    This is intentionally separate from async runtime code.
    """
    from sqlalchemy import create_engine

    sync_url = DATABASE_URL.replace("+asyncpg","") if "+asyncpg" in DATABASE_URL else DATABASE_URL
    sync_engine = create_engine(sync_url)
    Base.metadata.create_all(bind=sync_engine)


# Backwards-compatible API: older code expects `create_tables()` to exist and be
# callable synchronously (used during development startup). Provide it as an alias
# to `create_sync_tables`.
def create_tables() -> None:
    """Create tables synchronously (compat wrapper)."""
    create_sync_tables()
