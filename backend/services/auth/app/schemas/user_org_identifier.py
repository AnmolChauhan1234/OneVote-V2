import uuid
from pydantic import BaseModel
from typing import List, Optional

class UserOrgIdentifierBase(BaseModel):
    org_id: uuid.UUID
    identifier_value: str

class UserOrgIdentifierCreate(UserOrgIdentifierBase):
    pass

class UserOrgIdentifierUpdate(BaseModel):
    identifier_value: str

class UserOrgIdentifierResponse(UserOrgIdentifierBase):
    id: uuid.UUID
    user_id: uuid.UUID

    class Config:
        from_attributes = True

class InternalVoterVerificationRequest(BaseModel):
    org_id: uuid.UUID
    identifiers: List[str]

class InternalVoterVerificationResponse(BaseModel):
    found: List[dict] # list of {"identifier": str, "user_id": uuid.UUID}
    not_found: List[str]
