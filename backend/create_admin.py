"""
Script to create initial admin user in the database
Run this once to set up the admin account
"""
from sqlalchemy.orm import Session
from db.database import sessionmaker
from models.admin_model import Admin
from service.auth_service import get_password_hash
from core.config import settings
import sys

def create_admin_user():
    """Create initial admin user from settings"""
    db = sessionmaker()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(Admin).filter(
            Admin.username == settings.ADMIN_USERNAME
        ).first()
        
        if existing_admin:
            print(f"❌ Admin user '{settings.ADMIN_USERNAME}' already exists!")
            print(f"   Admin ID: {existing_admin.id}")
            print(f"   Created at: {existing_admin.created_at}")
            return
        
        # Create new admin user
        hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
        
        new_admin = Admin(
            username=settings.ADMIN_USERNAME,
            password_hash=hashed_password,
            email=f"{settings.ADMIN_USERNAME}@exstream.com",
            is_active=True
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print("✅ Admin user created successfully!")
        print(f"   Username: {new_admin.username}")
        print(f"   Admin ID: {new_admin.id}")
        print(f"   Email: {new_admin.email}")
        print(f"\n🔐 You can now login with:")
        print(f"   Username: {settings.ADMIN_USERNAME}")
        print(f"   Password: {settings.ADMIN_PASSWORD}")
        print(f"\n⚠️  Remember to change the password in production!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Creating initial admin user...")
    create_admin_user()
