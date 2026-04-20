from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime
import enum
import uuid

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
    org_id: uuid.UUID
    file_url: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OrganisationResponse(OrganisationBase):
    id: uuid.UUID
    status: OrganisationStatus
    created_at: datetime
    verified_at: Optional[datetime] = None

    @property
    def isVerified(self) -> bool:
        return self.status == OrganisationStatus.VERIFIED

    model_config = ConfigDict(from_attributes=True)

class OrganisationListPendingResponse(BaseModel):
    id: uuid.UUID
    name: str
    submittedAt: datetime = Field(
        validation_alias="created_at",
        serialization_alias="submittedAt"
    )

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ApproveOrganisationRequest(BaseModel):
    remarks: Optional[str] = None

class RejectOrganisationRequest(BaseModel):
    reason: str

class OrganisationEligibilityResponse(BaseModel):
    orgId: uuid.UUID
    isVerified: bool
    eligibleForElection: bool
