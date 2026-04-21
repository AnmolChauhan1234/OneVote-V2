from pydantic import BaseModel
from uuid import UUID

from typing import List

class Selection(BaseModel):
    position_id: UUID
    candidate_id: UUID

class CastVoteRequest(BaseModel):
    user_id: UUID
    organisation_id: UUID
    election_id: UUID
    selections: List[Selection]
    biometric_token: str