"""add_slug_to_articles

Revision ID: 05ffee6f36e2
Revises: cbf98e73522a
Create Date: 2025-09-23 16:20:19.326378

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '05ffee6f36e2'
down_revision: Union[str, Sequence[str], None] = 'cbf98e73522a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
