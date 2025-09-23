#!/usr/bin/env python3
"""
Check what tables exist in the database
"""

import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.core.config import async_database_url


async def check_database():
    """Check database tables and article structure."""
    engine = create_async_engine(async_database_url())
    async_session = async_sessionmaker(bind=engine, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Get all table names
            result = await session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = result.fetchall()

            print("📋 Tables in database:")
            for table in tables:
                print(f"  - {table[0]}")

            # Check articles table structure
            result = await session.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'articles'
                ORDER BY ordinal_position;
            """))
            columns = result.fetchall()
            
            if columns:
                print("\n📄 Articles table structure:")
                for col in columns:
                    nullable = "NULL" if col[2] == "YES" else "NOT NULL"
                    print(f"  - {col[0]} ({col[1]}) {nullable}")

                # Check if there are any articles
                result = await session.execute(text("SELECT COUNT(*) FROM articles;"))
                count = result.scalar() or 0
                print(f"\n📊 Total articles: {count}")

                if count > 0:
                    # Check if slug column exists and has data
                    try:
                        result = await session.execute(text("SELECT id, title, slug FROM articles LIMIT 3;"))
                        samples = result.fetchall()
                        print("\n📝 Sample articles:")
                        for article in samples:
                            title = article[1][:50] + "..." if len(article[1]) > 50 else article[1]
                            slug = article[2] if len(article) > 2 else "N/A"
                            print(f"  - ID: {article[0]}, Title: {title}, Slug: {slug}")
                    except Exception as e:
                        print(f"\n❌ Error reading article data: {e}")
            else:
                print("\n❌ Articles table not found")

        except Exception as e:
            print(f"❌ Database connection error: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(check_database())
