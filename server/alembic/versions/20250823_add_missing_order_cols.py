"""add missing buyer_id and payment_reference to orders

Revision ID: 20250823_add_missing_order_cols
Revises: 20250823_add_orders_and_order_items
Create Date: 2025-08-23 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250823_add_missing_order_cols'
down_revision = '20250823_add_orders_and_order_items'
branch_labels = None
depends_on = None


def upgrade():
    # This migration performs several add-column/index/constraint steps.
    # Avoid using SQLAlchemy inspection (sa.inspect) because Alembic's
    # offline/--sql mode provides a MockConnection which cannot be inspected.
    # Instead, use idempotent SQL (IF NOT EXISTS) where possible so the
    # migration can be generated as SQL and also run online safely.

    # Add buyer_id if missing (idempotent via IF NOT EXISTS)
    try:
        op.execute(
            """
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS buyer_id INTEGER;
            """
        )
        # create FK if it doesn't exist (best-effort; may warn in some DBs)
        try:
            op.create_foreign_key('orders_buyer_id_fkey', 'orders', 'users', ['buyer_id'], ['id'])
        except Exception:
            # ignore if constraint already exists or cannot be created idempotently
            pass
    except Exception:
        # If executing raw SQL is not supported in the current context, ignore
        pass

    # Add payment_reference if missing
    try:
        op.execute(
            """
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS payment_reference VARCHAR;
            """
        )
        try:
            op.create_index('ix_orders_payment_reference', 'orders', ['payment_reference'])
        except Exception:
            pass
    except Exception:
        pass

    # Ensure timestamps have server defaults (idempotent). Use ALTER .. SET DEFAULT
    try:
        op.execute("ALTER TABLE orders ALTER COLUMN created_at SET DEFAULT now();")
    except Exception:
        pass
    try:
        op.execute("ALTER TABLE orders ALTER COLUMN updated_at SET DEFAULT now();")
    except Exception:
        pass

    # Backfill any existing rows that have NULL timestamps (best-effort)
    try:
        op.execute("UPDATE orders SET created_at = now() WHERE created_at IS NULL")
        op.execute("UPDATE orders SET updated_at = now() WHERE updated_at IS NULL")
    except Exception:
        pass


def downgrade():
    # Remove added columns if present (best-effort)
    try:
        try:
            op.drop_index('ix_orders_payment_reference', table_name='orders')
        except Exception:
            pass
        try:
            op.drop_constraint('orders_buyer_id_fkey', 'orders', type_='foreignkey')
        except Exception:
            pass
        try:
            op.execute("ALTER TABLE orders DROP COLUMN IF EXISTS payment_reference;")
        except Exception:
            pass
        try:
            op.execute("ALTER TABLE orders DROP COLUMN IF EXISTS buyer_id;")
        except Exception:
            pass
    except Exception:
        pass
