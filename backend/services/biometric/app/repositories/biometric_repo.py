from sqlalchemy.orm import Session
from app.models.biometric_profile import BiometricProfile
from app.models.biometric_session import BiometricSession
from datetime import datetime
import uuid


class BiometricRepository:
    def __init__(self, db: Session):
        self.db = db

    # ----------------------------------------
    # 👤 PROFILE
    # ----------------------------------------
    def get_profile_by_user_id(self, user_id: uuid.UUID) -> BiometricProfile | None:
        return (
            self.db.query(BiometricProfile)
            .filter(BiometricProfile.user_id == user_id)
            .first()
        )

    def create_profile(self, user_id: uuid.UUID, face_encoding: list) -> BiometricProfile:
        profile = BiometricProfile(
            user_id=user_id,
            face_encoding=face_encoding
        )
        self.db.add(profile)
        self.db.flush()
        return profile

    def update_profile(self, profile: BiometricProfile, face_encoding: list) -> BiometricProfile:
        profile.face_encoding = face_encoding
        self.db.flush()
        return profile

    # ----------------------------------------
    # 🔐 SESSION
    # ----------------------------------------
    def create_session(self, user_id: uuid.UUID, token: str, expires_at: datetime) -> BiometricSession:
        session = BiometricSession(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        self.db.add(session)
        self.db.flush()
        return session

    # ----------------------------------------
    # 🔁 TRANSACTION CONTROL
    # ----------------------------------------
    def commit(self):
        self.db.commit()

    def rollback(self):
        self.db.rollback()