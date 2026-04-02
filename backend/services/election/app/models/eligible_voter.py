import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, func
from app.db.base import Base

class EligibleVoter(Base):
    __tablename__ = "eligible_voters"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    election_id = Column(String, ForeignKey("elections.id", ondelete="CASCADE"), nullable=False)
    voter_id = Column(String, nullable=True, index=True) # nullable for "Not Found/Pending" users
    unique_identifier = Column(String, nullable=False, index=True) # Renamed from roll_no
    created_at = Column(DateTime, server_default=func.now())
