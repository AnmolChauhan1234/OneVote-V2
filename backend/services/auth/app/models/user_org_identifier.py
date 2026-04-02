import uuid
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class UserOrgIdentifier(Base):
    __tablename__ = "user_org_identifiers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(UUID(as_uuid=True), nullable=False)
    identifier_value = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint('org_id', 'identifier_value', name='_org_identifier_uc'),
    )
