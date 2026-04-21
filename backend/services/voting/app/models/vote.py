import uuid
from sqlalchemy import Column, String, DateTime, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class Vote(Base):
    __tablename__ = "votes"

    vote_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    organisation_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    election_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    selections = Column(JSONB, nullable=False)

    user_reference_hash = Column(String, nullable=False, index=True)

    vote_hash = Column(String, nullable=False)
    previous_hash = Column(String, nullable=False)

    block_index = Column(BigInteger, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)