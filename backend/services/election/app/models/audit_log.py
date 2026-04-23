import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(50), nullable=False)  # e.g., "ELECTION"
    entity_id = Column(String, nullable=False)
    action = Column(String(50), nullable=False)      # e.g., "STATUS_OVERRIDE", "UPDATE"
    performed_by = Column(UUID(as_uuid=True), nullable=False)
    previous_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
