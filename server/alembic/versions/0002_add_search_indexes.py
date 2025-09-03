"""add_search_indexes

Revision ID: 0002_add_search_indexes
Revises: 0001_baseline
Create Date: 2025-09-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0002_add_search_indexes'
down_revision: Union[str, Sequence[str], None] = '0001_baseline'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add indexes for search performance

    # User search indexes
    op.create_index('ix_users_full_name', 'users', ['full_name'], unique=False)

    # Article search indexes
    op.create_index('ix_articles_excerpt', 'articles', ['excerpt'], unique=False)
    # For SQLite compatibility, use regular index on content
    op.create_index('ix_articles_content', 'articles', ['content'], unique=False)

    # Course search indexes
    op.create_index('ix_courses_description', 'courses', ['description'], unique=False)

    # Product search indexes
    op.create_index('ix_products_description', 'products', ['description'], unique=False)

    # Role application filtering indexes
    op.create_index('ix_role_applications_status', 'role_applications', ['status'], unique=False)
    op.create_index('ix_role_applications_requested_role', 'role_applications', ['requested_role'], unique=False)
    op.create_index('ix_role_applications_user_id', 'role_applications', ['user_id'], unique=False)

    # Enrollment filtering indexes
    op.create_index('ix_enrollments_student_id', 'enrollments', ['student_id'], unique=False)
    op.create_index('ix_enrollments_course_id', 'enrollments', ['course_id'], unique=False)
    op.create_index('ix_enrollments_status', 'enrollments', ['status'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes in reverse order

    # Enrollment indexes
    op.drop_index('ix_enrollments_status', table_name='enrollments')
    op.drop_index('ix_enrollments_course_id', table_name='enrollments')
    op.drop_index('ix_enrollments_student_id', table_name='enrollments')

    # Role application indexes
    op.drop_index('ix_role_applications_user_id', table_name='role_applications')
    op.drop_index('ix_role_applications_requested_role', table_name='role_applications')
    op.drop_index('ix_role_applications_status', table_name='role_applications')

    # Product indexes
    op.drop_index('ix_products_description', table_name='products')

    # Course indexes
    op.drop_index('ix_courses_description', table_name='courses')

    # Article indexes
    op.drop_index('ix_articles_content', table_name='articles')
    op.drop_index('ix_articles_excerpt', table_name='articles')

    # User indexes
    op.drop_index('ix_users_full_name', table_name='users')
