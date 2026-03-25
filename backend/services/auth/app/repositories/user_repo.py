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
        return self.db.query(User).filter(User.id == user_id).first()

    def get_all(self) -> list[User]:
        return self.db.query(User).all()

    def create(self, user_data: RegisterRequest, password_hash: str) -> User:
        db_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=password_hash,
            user_type=user_data.user_type,
            is_verified=False,
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
