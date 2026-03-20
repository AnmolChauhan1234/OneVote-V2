from sqlalchemy.orm import Session as DBSession
from app.models.otp import OTP
from uuid import UUID
from datetime import datetime

class OTPRepository:
    def create_otp(self, db: DBSession, user_id: UUID, code: str, expires_at: datetime) -> OTP:
        db_otp = OTP(user_id=user_id, code=code, expires_at=expires_at)
        if db is not None:
            db.add(db_otp)
            db.commit()
            db.refresh(db_otp)
        return db_otp

    def get_latest_otp_for_user(self, db: DBSession, user_id: UUID) -> OTP | None:
        if db is None: return None
        return db.query(OTP).filter(OTP.user_id == user_id).order_by(OTP.created_at.desc()).first()

    def delete_otps_for_user(self, db: DBSession, user_id: UUID):
        if db is not None:
            db.query(OTP).filter(OTP.user_id == user_id).delete()
            db.commit()

otp_repo = OTPRepository()
