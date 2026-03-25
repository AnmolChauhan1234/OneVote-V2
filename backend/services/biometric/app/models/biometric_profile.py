import uuid
from sqlalchemy import Column, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class BiometricProfile(Base):
    __tablename__ = "biometric_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), index=True, nullable=False, unique=True)
    face_encoding = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
