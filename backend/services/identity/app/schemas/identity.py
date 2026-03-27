import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class IdentityBase(BaseModel):
    aadhar_id: str = Field(..., pattern=r"^\d{12}$", description="12-digit Aadhar ID")

class IdentityCreate(IdentityBase):
    user_id: uuid.UUID

class DigiLockerMockResponse(BaseModel):
    full_name: str
    dob: str
    gender: str
    address: str
    aadhar_id: str

class IdentityVerifyRequest(IdentityBase):
    user_id: uuid.UUID

class IdentityResponse(BaseModel):
    user_id: uuid.UUID
    aadhar_id: str
    is_verified: bool
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    message: str
