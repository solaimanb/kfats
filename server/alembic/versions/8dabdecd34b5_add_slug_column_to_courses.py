"""add_slug_column_to_courses

Revision ID: 8dabdecd34b5
Revises: 0002_add_search_indexes
Create Date: 2025-09-11 18:59:57.040110

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8dabdecd34b5'
down_revision: Union[str, Sequence[str], None] = '0002_add_search_indexes'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add slug column to courses table
    op.add_column('courses', sa.Column('slug', sa.String(), nullable=True))
    # Add unique index on slug
    op.create_index('ix_courses_slug', 'courses', ['slug'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the index first
    op.drop_index('ix_courses_slug', table_name='courses')
    # Drop the slug column
    op.drop_column('courses', 'slug')
