import sys
import os
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add app directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SQLALCHEMY_DATABASE_URL
from app.models.user import User

def cleanup_unverified_users():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        threshold = datetime.now(timezone.utc) - timedelta(hours=24)
        print(f"Cleaning up users created before {threshold} who are unverified...")
        
        deleted = db.query(User).filter(
            User.is_verified == False,
            User.created_at < threshold
        ).delete()
        
        db.commit()
        print(f"Successfully deleted {deleted} unverified users.")
        
    except Exception as e:
        print(f"Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_unverified_users()
