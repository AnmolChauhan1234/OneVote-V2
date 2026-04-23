from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from app.models.election import ElectionStatus

import uuid

class ElectionBase(BaseModel):
    org_id: uuid.UUID
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime

class ElectionCreate(ElectionBase):
    pass

class ElectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[ElectionStatus] = None
    manual_override: Optional[bool] = None
    override_reason: Optional[str] = None

class ElectionResponse(ElectionBase):
    id: str
    status: ElectionStatus
    manual_override: bool
    override_reason: Optional[str] = None
    overridden_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PositionBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    max_candidates_selectable: int = 1

class PositionCreate(PositionBase):
    pass

class PositionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_candidates_selectable: Optional[int] = None

class PositionResponse(PositionBase):
    id: str
    election_id: str

    class Config:
        from_attributes = True

class CandidateBase(BaseModel):
    name: str = Field(..., max_length=255)
    biography: Optional[str] = None
    image_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    biography: Optional[str] = None
    image_url: Optional[str] = None

class CandidateResponse(CandidateBase):
    id: str
    position_id: str

    class Config:
        from_attributes = True

class EligibleVoterCreate(BaseModel):
    voter_id: Optional[str] = None
    unique_identifier: str

class EligibleVoterResponse(BaseModel):
    id: str
    election_id: str
    voter_id: Optional[str] = None
    unique_identifier: str
    created_at: datetime

    class Config:
        from_attributes = True

class BulkVoterUploadResponse(BaseModel):
    total_processed: int
    added: int
    skipped: int
    errors: List[str] = []
    voters: List[EligibleVoterResponse] = []

class CandidateResultResponse(BaseModel):
    candidate_id: str
    name: str
    vote_count: int
    is_winner: bool = False

class PositionResultResponse(BaseModel):
    position_id: str
    name: str
    candidates: List[CandidateResultResponse]

class ElectionResultResponse(BaseModel):
    election_id: str
    title: str
    status: ElectionStatus
    positions: List[PositionResultResponse]
