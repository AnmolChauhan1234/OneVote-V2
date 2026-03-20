import uuid
from sqlalchemy import Column, String, DateTime, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class BlockchainAnchor(Base):
    __tablename__ = "blockchain_anchors"

    anchor_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    election_id = Column(UUID(as_uuid=True), nullable=False, unique=True)

    final_block_hash = Column(String, nullable=False)

    blockchain_txn_id = Column(String)
    block_number = Column(BigInteger)

    status = Column(String, default="PENDING", nullable=False)

    anchored_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)