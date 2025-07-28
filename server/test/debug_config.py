#!/usr/bin/env python3
"""
Simple test to debug configuration loading
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing configuration loading...")
    
    # Test basic imports
    print("✅ Basic imports successful")
    
    # Test dotenv loading
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ dotenv loaded")
    
    # Test environment variables
    db_url = os.getenv('DATABASE_URL')
    print(f"✅ DATABASE_URL loaded: {bool(db_url)}")
    if db_url:
        print(f"   URL preview: {db_url[:50]}...")
    
    # Test pydantic settings
    from app.config import settings
    print("✅ Settings loaded successfully")
    print(f"   App name: {settings.app_name}")
    print(f"   Database URL: {settings.database_url[:50]}...")
    
    # Test database connection
    from app.database import engine
    print("✅ Database engine created")
    
    # Test simple connection
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
