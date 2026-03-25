from sqlalchemy.orm import Session
from app.models.identity import UserIdentity
from app.schemas.identity import IdentityCreate
import uuid

class IdentityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: uuid.UUID) -> UserIdentity | None:
        return self.db.query(UserIdentity).filter(UserIdentity.user_id == user_id).first()

    def get_by_aadhar_id(self, aadhar_id: str) -> UserIdentity | None:
        return self.db.query(UserIdentity).filter(UserIdentity.aadhar_id == aadhar_id).first()

    def create(self, user_id: uuid.UUID, aadhar_id: str, digilocker_data: dict) -> UserIdentity:
        db_identity = UserIdentity(
            user_id=user_id,
            aadhar_id=aadhar_id,
            full_name=digilocker_data.get("full_name"),
            dob=digilocker_data.get("dob"),
            gender=digilocker_data.get("gender"),
            address=digilocker_data.get("address")
        )
        self.db.add(db_identity)
        self.db.commit()
        self.db.refresh(db_identity)
        return db_identity

    def mark_verified(self, identity: UserIdentity):
        from datetime import datetime, timezone
        identity.is_verified = True
        identity.verified_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(identity)
        return identity
