from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import RegisterRequest
import uuid


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = self.db.query(User).filter(User.id == user_id).first()
        print(f"DEBUG REPO: Query for ID {user_id} returned {result}")
        return result

    def get_all(self) -> list[User]:
        return self.db.query(User).all()

    def create(self, user_data: RegisterRequest, password_hash: str) -> User:
        db_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=password_hash,
            user_type=user_data.user_type,
            phone_number=user_data.phone_number,
            is_verified=False,
            is_suspended=False,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def create_admin(self, admin_data, password_hash: str) -> User:
        from app.models.user import UserRole, UserType

        db_user = User(
            email=admin_data.email,
            full_name=admin_data.full_name,
            password_hash=password_hash,
            role=UserRole.ADMIN,
            user_type=UserType.ORG_ADMIN,
            is_verified=True,  # Admins don't need email verification
            identity_verified=True,  # Bypass KYC
            biometric_verified=True,  # Bypass Biometrics
            is_blocked=False,
            is_suspended=False,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def create_super_admin(self, email: str, password_hash: str) -> User:
        from app.models.user import UserRole, UserType

        # First check if super admin already exists
        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            if existing.role != UserRole.SUPER_ADMIN:
                existing.role = UserRole.SUPER_ADMIN
                self.db.commit()
            return existing

        db_user = User(
            email=email,
            full_name="Super Administrator",
            password_hash=password_hash,
            role=UserRole.SUPER_ADMIN,
            user_type=UserType.ORG_ADMIN,
            is_verified=True,
            identity_verified=True,
            biometric_verified=True,
            is_blocked=False,
            is_suspended=False,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user: User, update_data: dict) -> User:
        for field, value in update_data.items():
            if value is not None:
                setattr(user, field, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User):
        self.db.delete(user)
        self.db.commit()

    def mark_verified(self, user: User):
        user.is_verified = True
        self.db.commit()
        self.db.refresh(user)
