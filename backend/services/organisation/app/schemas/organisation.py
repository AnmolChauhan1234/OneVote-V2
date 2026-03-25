from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
import enum

class OrganisationStatus(str, enum.Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class OrganisationBase(BaseModel):
    name: str
    type: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[str] = None

class OrganisationCreate(OrganisationBase):
    pass

class OrganisationUpdate(OrganisationBase):
    name: Optional[str] = None

class OrganisationDocumentResponse(BaseModel):
    id: int
    org_id: int
    file_url: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OrganisationResponse(OrganisationBase):
    id: int
    status: OrganisationStatus
    created_at: datetime
    verified_at: Optional[datetime] = None

    @property
    def isVerified(self) -> bool:
        return self.status == OrganisationStatus.VERIFIED

    model_config = ConfigDict(from_attributes=True)

class OrganisationListPendingResponse(BaseModel):
    id: int
    name: str
    submittedAt: datetime

    model_config = ConfigDict(from_attributes=True)

class ApproveOrganisationRequest(BaseModel):
    remarks: Optional[str] = None

class RejectOrganisationRequest(BaseModel):
    reason: str

class OrganisationEligibilityResponse(BaseModel):
    orgId: int
    isVerified: bool
    eligibleForElection: bool
