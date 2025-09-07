"""
Database seeding script for KFATS LMS
Creates initial admin user and sample data.
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, create_tables_async
from app.models.user import User as DBUser
from app.schemas.common import UserRole, UserStatus
from app.core.security import get_password_hash


async def create_admin_user(db: AsyncSession):
    """Create default admin user."""
    admin_email = "admin@kfats.edu"
    result = await db.execute(select(DBUser).where(DBUser.email == admin_email))
    admin_user = result.scalars().first()
    
    if not admin_user:
        admin_user = DBUser(
            email=admin_email,
            username="admin",
            full_name="System Administrator",
            hashed_password=get_password_hash("admin123"),  # Change this!
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        )
        db.add(admin_user)
        db.commit()
        print(f"✅ Created admin user: {admin_email} (password: admin123)")
    else:
        print(f"ℹ️  Admin user already exists: {admin_email}")


async def create_sample_users(db: AsyncSession):
    """Create sample users for testing."""
    sample_users = [
        {
            "email": "mentor@kfats.edu",
            "username": "mentor1",
            "full_name": "John Mentor",
            "role": UserRole.MENTOR,
            "password": "mentor123"
        },
        {
            "email": "student@kfats.edu", 
            "username": "student1",
            "full_name": "Jane Student",
            "role": UserRole.STUDENT,
            "password": "student123"
        },
        {
            "email": "writer@kfats.edu",
            "username": "writer1", 
            "full_name": "Bob Writer",
            "role": UserRole.WRITER,
            "password": "writer123"
        },
        {
            "email": "seller@kfats.edu",
            "username": "seller1",
            "full_name": "Alice Seller", 
            "role": UserRole.SELLER,
            "password": "seller123"
        }
    ]
    
    for user_data in sample_users:
        result = await db.execute(select(DBUser).where(DBUser.email == user_data["email"]))
        existing_user = result.scalars().first()
        if not existing_user:
            user = DBUser(
                email=user_data["email"],
                username=user_data["username"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                status=UserStatus.ACTIVE
            )
            db.add(user)
            print(f"✅ Created {user_data['role']} user: {user_data['email']}")
        else:
            print(f"ℹ️  User already exists: {user_data['email']}")
    
    db.commit()


async def seed_database():
    """Main seeding function."""
    print("🌱 Starting database seeding...")
    
    # Create tables
    await create_tables_async()
    print("✅ Database tables created/verified")
    
    # Create database session
    async with AsyncSessionLocal() as db:
        try:
            # Create admin user
            await create_admin_user(db)
            
            # Create sample users
            await create_sample_users(db)
            
            print("🎉 Database seeding completed successfully!")
            print("\n📝 Sample credentials:")
            print("Admin: admin@kfats.edu / admin123")
            print("Mentor: mentor@kfats.edu / mentor123")
            print("Student: student@kfats.edu / student123")
            print("Writer: writer@kfats.edu / writer123")
            print("Seller: seller@kfats.edu / seller123")
            print("\n⚠️  Please change these passwords in production!")
            
        except Exception as e:
            print(f"❌ Error during seeding: {e}")
            await db.rollback()
        finally:
            await db.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
