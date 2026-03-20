from sqlalchemy.orm import Session as DBSession
from app.models.user import User
from app.schemas.auth import UserCreate
# from shared.utils.hashing import get_password_hash

# Mock until shared utils are provided by Senior
def get_password_hash(password: str) -> str:
    return "mock_hash"

class UserRepository:
    def get_user_by_email(self, db: DBSession, email: str) -> User | None:
        if db is None: return None
        return db.query(User).filter(User.email == email).first()

    def create_user(self, db: DBSession, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        db_user = User(email=user.email, hashed_password=hashed_password)
        if db is not None:
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        return db_user

user_repo = UserRepository()
