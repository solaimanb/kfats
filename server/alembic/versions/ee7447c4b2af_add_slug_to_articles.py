"""add_slug_to_articles

Revision ID: ee7447c4b2af
Revises: 77585c165762
Create Date: 2025-09-23 16:20:56.052859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ee7447c4b2af'
down_revision: Union[str, Sequence[str], None] = 'cbf98e73522a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add slug column to articles table
    op.add_column('articles', sa.Column('slug', sa.String(), nullable=True))
    
    # Create unique index on slug
    op.create_index('ix_articles_slug', 'articles', ['slug'], unique=True)
    
    # Populate slug values for existing articles
    # Using raw SQL to generate slugs from titles
    connection = op.get_bind()
    
    # First, let's generate slugs for existing articles
    result = connection.execute(sa.text("SELECT id, title FROM articles"))
    articles = result.fetchall()
    
    for article in articles:
        import re
        import unicodedata
        title = article[1] if article[1] else f"article-{article[0]}"
        
        # Generate slug from title
        slug = unicodedata.normalize('NFKD', title.lower())
        slug = slug.encode('ascii', 'ignore').decode('ascii')
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = re.sub(r'^-|-$', '', slug)
        slug = re.sub(r'-+', '-', slug)
        
        # Ensure slug is not empty
        if not slug:
            slug = f"article-{article[0]}"
        
        # Check for duplicates and append number if needed
        counter = 1
        original_slug = slug
        while True:
            check_result = connection.execute(
                sa.text("SELECT COUNT(*) FROM articles WHERE slug = :slug"),
                {"slug": slug}
            )
            if check_result.scalar() == 0:
                break
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        # Update the article with the generated slug
        connection.execute(
            sa.text("UPDATE articles SET slug = :slug WHERE id = :id"),
            {"slug": slug, "id": article[0]}
        )
    
    # Make slug column non-nullable after populating it
    op.alter_column('articles', 'slug', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the index and column
    op.drop_index('ix_articles_slug', table_name='articles')
    op.drop_column('articles', 'slug')
