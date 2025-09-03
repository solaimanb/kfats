#!/usr/bin/env python3
"""
Check what tables exist in the database
"""

import sqlite3
import os

db_path = "test.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print("📋 Tables in database:")
    for table in tables:
        print(f"  - {table[0]}")

    conn.close()
else:
    print("❌ Database file not found")
