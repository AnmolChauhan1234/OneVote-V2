import uuid
from sqlalchemy import Column, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class VotingToken(Base):
    __tablename__ = "voting_tokens"

    token_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    election_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)

    issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)