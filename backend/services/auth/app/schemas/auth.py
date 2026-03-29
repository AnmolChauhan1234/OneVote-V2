import uuid
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, UserType


class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="User's password")
    full_name: str = Field(..., description="User's full name")
    user_type: UserType = Field(
        UserType.VOTER, description="User type (voter/org_admin)"
    )

class AdminCreate(BaseModel):
    email: EmailStr = Field(..., description="Administrator's email address")
    password: str = Field(..., min_length=6, description="Administrator's password")
    full_name: str = Field(..., description="Administrator's full name")

class RegisterResponse(BaseModel):
    message: str
    user_id: uuid.UUID

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    device_id: Optional[str] = None


class GenerateOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = Field("2fa", pattern="^(register|2fa|voting)$")


class OTPVerifyRequest(BaseModel):
    email: Optional[EmailStr] = None
    user_id: Optional[uuid.UUID] = None
    otp: str
    purpose: str = Field("2fa", pattern="^(register|2fa|voting)$")


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    user_type: UserType
    created_at: datetime
    # updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    user_type: Optional[UserType] = None
    is_blocked: Optional[bool] = None
    is_suspended: Optional[bool] = None


class MessageResponse(BaseModel):
    message: str
    test_otp: str | None = None
