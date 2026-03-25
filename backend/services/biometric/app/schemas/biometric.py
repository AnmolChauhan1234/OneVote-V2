from pydantic import BaseModel
from uuid import UUID

class BiometricEnrollResponse(BaseModel):
    success: bool
    message: str

class BiometricVerifyResponse(BaseModel):
    success: bool
    biometric_token: str | None = None
    message: str

class LivenessCheckResponse(BaseModel):
    success: bool
    liveness_score: float
    message: str
