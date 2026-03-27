import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class OrganisationStatus(str, enum.Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class Organisation(Base):
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String, nullable=True) # e.g. college
    description = Column(String, nullable=True)
    owner_id = Column(String, nullable=True) # string as it could be UUID from auth service
    status = Column(Enum(OrganisationStatus), default=OrganisationStatus.PENDING_VERIFICATION)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    documents = relationship("OrganisationDocument", back_populates="organisation", cascade="all, delete-orphan")
    verification_logs = relationship("VerificationLog", back_populates="organisation", cascade="all, delete-orphan")

class OrganisationDocument(Base):
    __tablename__ = "organization_documents"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    organisation = relationship("Organisation", back_populates="documents")

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False) # APPROVED / REJECTED
    admin_id = Column(String, nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    organisation = relationship("Organisation", back_populates="verification_logs")
