import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class ElectionStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"

class Election(Base):
    __tablename__ = "elections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(Enum(ElectionStatus), default=ElectionStatus.UPCOMING, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
