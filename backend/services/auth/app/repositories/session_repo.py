from sqlalchemy.orm import Session
from app.models.session import Session as UserSession
import uuid
from datetime import datetime


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: uuid.UUID, refresh_token: str, expires_at: datetime, device_id: str = None) -> UserSession:
        db_session = UserSession(
            user_id=user_id,
            refresh_token=refresh_token,
            expires_at=expires_at,
            device_id=device_id
        )
        self.db.add(db_session)
        self.db.flush()
        return db_session

    def get_by_token(self, refresh_token: str) -> UserSession | None:
        return (
            self.db.query(UserSession)
            .filter(UserSession.refresh_token == refresh_token)
            .first()
        )

    def get_by_user_id(self, user_id: uuid.UUID) -> UserSession | None:
        return (
            self.db.query(UserSession)
            .filter(UserSession.user_id == user_id)
            .first()
        )

    def delete_by_token(self, refresh_token: str):
        self.db.query(UserSession).filter(UserSession.refresh_token == refresh_token).delete()

    def delete_all_for_user(self, user_id: uuid.UUID):
        self.db.query(UserSession).filter(UserSession.user_id == user_id).delete()
