import uuid
from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class BiometricSession(Base):
    __tablename__ = "biometric_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    token = Column(String, index=True, nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
