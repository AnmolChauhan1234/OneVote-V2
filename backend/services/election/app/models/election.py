import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum, func, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class ElectionStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"

class Election(Base) :
    __tablename__ = "elections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    # Use a private attribute for the DB column so we can use 'status' as a property
    _status = Column("status", Enum(ElectionStatus), default=ElectionStatus.UPCOMING, nullable=False)
    
    # New fields for production-ready election management
    manual_override = Column(Boolean(), default=False, nullable=False)
    override_reason = Column(String(500), nullable=True)
    overridden_by = Column(UUID(as_uuid=True), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    @property
    def current_status(self) -> ElectionStatus:
        if self.manual_override:
            return self._status
            
        now = datetime.now()
        if now < self.start_date:
            return ElectionStatus.UPCOMING
        elif self.start_date <= now <= self.end_date:
            return ElectionStatus.ONGOING
        else:
            return ElectionStatus.COMPLETED

    @property
    def status(self) -> ElectionStatus:
        """Alias for current_status to maintain compatibility with schemas and existing code."""
        return self.current_status

    @status.setter
    def status(self, value):
        """Allows setting the status, which updates the internal _status field."""
        self._status = value
