from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid


class OTP(Base):
    __tablename__ = "otps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User")
