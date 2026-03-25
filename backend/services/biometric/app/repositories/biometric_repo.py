from sqlalchemy.orm import Session
from app.models.biometric_profile import BiometricProfile
from app.models.biometric_session import BiometricSession
from datetime import datetime

def get_profile_by_user_id(db: Session, user_id: str):
    return db.query(BiometricProfile).filter(BiometricProfile.user_id == user_id).first()

def create_profile(db: Session, user_id: str, face_encoding: list):
    profile = BiometricProfile(
        user_id=user_id,
        face_encoding=face_encoding
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def update_profile(db: Session, profile: BiometricProfile, face_encoding: list):
    profile.face_encoding = face_encoding
    db.commit()
    db.refresh(profile)
    return profile

def create_session(db: Session, user_id: str, token: str, expires_at: datetime):
    session = BiometricSession(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_session_by_token(db: Session, token: str):
    return db.query(BiometricSession).filter(BiometricSession.token == token).first()
