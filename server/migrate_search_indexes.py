#!/usr/bin/env python3
"""
Manual migration script to add search indexes to the database.
Run this script to apply the search index optimizations.
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import text
from app.core.database import get_async_db


async def run_migration():
    """Run the search index migration."""
    async for db in get_async_db():
        try:
            print("Starting search index migration...")

            # User search indexes
            print("Creating user search indexes...")
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_users_full_name ON users (full_name);"))

            # Article search indexes (SQLite compatible)
            print("Creating article search indexes...")
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_articles_excerpt ON articles (excerpt);"))
            # For SQLite, we'll use a simple LIKE-based index on content
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_articles_content ON articles (content);"))

            # Course search indexes
            print("Creating course search indexes...")
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_courses_description ON courses (description);"))

            # Product search indexes
            print("Creating product search indexes...")
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_products_description ON products (description);"))

            # Role application filtering indexes
            print("Creating role application indexes...")
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_role_applications_status ON role_applications (status);"))
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_role_applications_requested_role ON role_applications (requested_role);"))
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_role_applications_user_id ON role_applications (user_id);"))

            # Enrollment filtering indexes
            print("Creating enrollment indexes...")
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_enrollments_student_id ON enrollments (student_id);"))
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_enrollments_course_id ON enrollments (course_id);"))
            await db.execute(text("CREATE INDEX IF NOT EXISTS ix_enrollments_status ON enrollments (status);"))

            # Note: Orders table doesn't exist in current schema, skipping order indexes

            await db.commit()
            print("✅ Migration completed successfully!")
            print("\n📊 Search indexes added:")
            print("  - Users: full_name")
            print("  - Articles: excerpt, content")
            print("  - Courses: description")
            print("  - Products: description")
            print("  - Role Applications: status, requested_role, user_id")
            print("  - Enrollments: student_id, course_id, status")
            print("  - Note: Order indexes skipped (orders table not in current schema)")

        except Exception as e:
            await db.rollback()
            print(f"❌ Migration failed: {e}")
            return False

        finally:
            await db.close()

    return True


if __name__ == "__main__":
    print("🔍 LMS Search Index Migration")
    print("=" * 40)

    # Check if we're in the right directory
    if not os.path.exists("app/core/database.py"):
        print("❌ Please run this script from the server directory")
        sys.exit(1)

    # Run the migration
    success = asyncio.run(run_migration())

    if success:
        print("\n🎉 Search performance optimization complete!")
        print("Your LMS will now have significantly faster search queries.")
    else:
        print("\n💥 Migration failed. Please check the error messages above.")
        sys.exit(1)
