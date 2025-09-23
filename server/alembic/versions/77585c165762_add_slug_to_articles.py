"""add_slug_to_articles

Revision ID: 77585c165762
Revises: 05ffee6f36e2
Create Date: 2025-09-23 16:20:42.130268

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '77585c165762'
down_revision: Union[str, Sequence[str], None] = '05ffee6f36e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
