import asyncio
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine


# allow loading .env for local development
from dotenv import load_dotenv
load_dotenv()


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Allow DATABASE_URL to override alembic.ini
database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)


# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Import your models' metadata here
from app.models.base import Base
target_metadata = Base.metadata


# Provide naming convention - already present on metadata, but set here for clarity
compare_type = True
compare_server_default = True


def include_object(object, name, type_, reflected, compare_to):
    """Filter out Alembic targets we don't want to manage.

    Return False for objects that should be excluded from autogenerate.
    This can be extended to ignore certain schemas or temporary tables.
    """
    # Example: ignore alembic_version table (Alembic manages it)
    if type_ == "table" and name == "alembic_version":
        return False
    # ignore SQLAlchemy internal tables or those in pg_catalog
    return True


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=compare_type,
        compare_server_default=compare_server_default,
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()



def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=compare_type,
        compare_server_default=compare_server_default,
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode with an AsyncEngine."""
    url = config.get_main_option("sqlalchemy.url")
    if not url:
        raise RuntimeError("sqlalchemy.url must be set in alembic.ini or via DATABASE_URL environment variable")

    connectable = create_async_engine(
        url,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run():
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        asyncio.run(run_migrations_online())


if __name__ == "__main__":
    run()
