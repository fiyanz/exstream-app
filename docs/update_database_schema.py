#!/usr/bin/env python3
"""
Script to update database schema for transaksi table
This script will alter the column sizes to accommodate larger JSON data
"""

import pymysql
from urllib.parse import urlparse
from core.config import settings

def update_database_schema():
    """Update the database schema to increase column sizes"""
    
    # Parse DATABASE_URL
    db_url = urlparse(settings.DATABASE_URL)
    
    # Database connection parameters
    db_config = {
        'host': db_url.hostname,
        'user': db_url.username,
        'password': db_url.password,
        'database': db_url.path.lstrip('/'),
        'charset': 'utf8mb4'
    }
    
    try:
        # Connect to database
        connection = pymysql.connect(**db_config)
        cursor = connection.cursor()
        
        print("Connected to database successfully!")
        
        # Check current column sizes
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'transaksi'
        """, (db_url.path.lstrip('/'),))
        
        current_columns = cursor.fetchall()
        print("\nCurrent column sizes:")
        for column in current_columns:
            print(f"  {column[0]}: {column[1]}({column[2]})")
        
        # Update column sizes
        print("\nUpdating column sizes...")
        
        # Update nama_barang column
        try:
            cursor.execute("""
                ALTER TABLE transaksi 
                MODIFY COLUMN nama_barang VARCHAR(2000) NOT NULL
            """)
            print("✅ Updated nama_barang to VARCHAR(2000)")
        except Exception as e:
            print(f"⚠️  nama_barang update failed: {e}")
        
        # Update detail_barang column
        try:
            cursor.execute("""
                ALTER TABLE transaksi 
                MODIFY COLUMN detail_barang VARCHAR(5000) NULL
            """)
            print("✅ Updated detail_barang to VARCHAR(5000)")
        except Exception as e:
            print(f"⚠️  detail_barang update failed: {e}")
        
        # Commit changes
        connection.commit()
        
        # Verify changes
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'transaksi'
        """, (db_url.path.lstrip('/'),))
        
        updated_columns = cursor.fetchall()
        print("\nUpdated column sizes:")
        for column in updated_columns:
            print(f"  {column[0]}: {column[1]}({column[2]})")
        
        print("\n✅ Database schema updated successfully!")
        
    except Exception as e:
        print(f"❌ Error updating database schema: {e}")
        if 'connection' in locals():
            connection.rollback()
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    print("🔄 Updating database schema for transaksi table...")
    update_database_schema()
    print("✅ Script completed!")
