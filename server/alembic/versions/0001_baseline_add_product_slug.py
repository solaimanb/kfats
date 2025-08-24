"""baseline: ensure slug exists on products

Revision ID: 0001_baseline
Revises: 
Create Date: 2025-08-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001_baseline'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add slug column if missing (Postgres supports IF NOT EXISTS)
    op.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS slug varchar(255);")

    # Backfill slug for rows with null/empty slug using name + id to guarantee uniqueness
    op.execute(r"""
    UPDATE products
    SET slug = lower(regexp_replace(coalesce(name, 'product'), '[^a-z0-9\s-]', '', 'g')) || '-' || id
    WHERE slug IS NULL OR slug = '';
    """)

    # Create a unique index if it does not exist
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_products_slug ON products (slug);")


def downgrade() -> None:
    # Remove unique index and slug column
    op.execute("DROP INDEX IF EXISTS uq_products_slug;")
    op.execute("ALTER TABLE products DROP COLUMN IF EXISTS slug;")
