#!/usr/bin/env python3
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base_models import Base
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

def setup_database():
    """Setup database with tables and sample data"""
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL, echo=True)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"Database already has {existing_users} users. Skipping setup.")
            return
        
        # Create sample users
        users_data = [
            {
                "username": "admin",
                "email": "admin@sekar.net",
                "hashed_password": get_password_hash("admin123"),
                "full_name": "Administrator",
                "phone": "+62 21 1234 5678",
                "address": "Jl. Sudirman No. 1, Jakarta",
                "role": "admin",
                "is_active": True
            },
            {
                "username": "technician",
                "email": "technician@sekar.net",
                "hashed_password": get_password_hash("technician123"),
                "full_name": "Ahmad Rizki",
                "phone": "+62 21 1234 5679",
                "address": "Jl. Thamrin No. 10, Jakarta",
                "role": "technician",
                "is_active": True
            },
            {
                "username": "customer",
                "email": "customer@example.com",
                "hashed_password": get_password_hash("customer123"),
                "full_name": "Budi Santoso",
                "phone": "+62 21 1234 5680",
                "address": "Jl. Sudirman No. 123, Jakarta",
                "role": "customer",
                "is_active": True
            }
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
        
        db.commit()
        print("Database setup completed successfully!")
        print(f"Created {len(users_data)} users")
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_database() 