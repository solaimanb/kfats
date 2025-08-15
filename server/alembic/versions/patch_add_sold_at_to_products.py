"""Add sold_at to products

Revision ID: patch_add_sold_at_to_products
Revises: 04c2bb72c2a9
Create Date: 2025-08-15 08:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'patch_add_sold_at_to_products'
down_revision = '04c2bb72c2a9'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('products', sa.Column('sold_at', sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column('products', 'sold_at')
