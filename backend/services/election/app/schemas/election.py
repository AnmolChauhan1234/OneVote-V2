from pydantic import BaseModel, Field, model_validator, field_serializer, ConfigDict
from typing import Optional, List, Any
from datetime import datetime, timezone
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

    @model_validator(mode="after")
    def force_utc_dates(self) -> "ElectionUpdate":
        for field in ["start_date", "end_date"]:
            v = getattr(self, field)
            if v is not None and isinstance(v, datetime):
                if v.tzinfo is None:
                    setattr(self, field, v.replace(tzinfo=timezone.utc))
                else:
                    setattr(self, field, v.astimezone(timezone.utc))
        return self

class ElectionResponse(ElectionBase):
    id: str
    status: ElectionStatus
    manual_override: bool
    override_reason: Optional[str] = None
    overridden_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("start_date", "end_date", "created_at", "updated_at")
    def serialize_dt_as_utc(self, v: datetime) -> str:
        """Always return ISO 8601 with explicit Z suffix so the browser never
        misparses a tz-naive string as local time."""
        if v is None:
            return v
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        else:
            v = v.astimezone(timezone.utc)
        # Use isoformat() and swap +00:00 → Z for compact, unambiguous output
        return v.isoformat().replace("+00:00", "Z")

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

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at")
    def serialize_dt_as_utc(self, v: datetime) -> str:
        if v is None:
            return v
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        else:
            v = v.astimezone(timezone.utc)
        return v.isoformat().replace("+00:00", "Z")

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
