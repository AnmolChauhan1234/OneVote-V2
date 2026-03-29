import argparse
import sys
import os

# Add the parent directory to sys.path so we can import app and shared modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.session import SessionLocal
from app.models.user import User, UserRole, UserType
from shared.core.security import hash_password

def create_super_admin(email: str, password: str, full_name: str):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User with email {email} already exists.")
            # If so, optionally elevate them instead of crashing
            if existing_user.role != UserRole.SUPER_ADMIN:
                existing_user.role = UserRole.SUPER_ADMIN
                existing_user.is_verified = True
                db.commit()
                print(f"Elevated {email} to Super Admin.")
            return

        # Create new super admin
        hashed_pw = hash_password(password)
        super_admin = User(
            email=email,
            full_name=full_name,
            password_hash=hashed_pw,
            role=UserRole.SUPER_ADMIN,
            user_type=UserType.ORG_ADMIN,  # Super Admins might technically be ORG_ADMINs internally
            is_verified=True,
            identity_verified=True,
            biometric_verified=True,
            is_blocked=False,
            is_suspended=False
        )

        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)

        print(f"Successfully created Super Admin: {email} (ID: {super_admin.id})")
    except Exception as e:
        print(f"Error creating super admin: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a Super Admin user.")
    parser.add_argument("--email", required=True, help="Email address of the Super Admin")
    parser.add_argument("--password", required=True, help="Password for the Super Admin")
    parser.add_argument("--fullname", required=True, help="Full name of the Super Admin")

    args = parser.parse_args()

    create_super_admin(args.email, args.password, args.fullname)
