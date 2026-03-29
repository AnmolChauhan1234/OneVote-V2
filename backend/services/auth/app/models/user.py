import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum
from app.db.base import Base


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"


class UserType(str, enum.Enum):
    VOTER = "voter"
    ORG_ADMIN = "org_admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    is_verified = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)

    role = Column(String, default=UserRole.USER)
    user_type = Column(String, default=UserType.VOTER)

    identity_verified = Column(Boolean, default=False)
    biometric_verified = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
