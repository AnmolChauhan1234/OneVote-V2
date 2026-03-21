from pydantic import BaseModel
from uuid import UUID


class CastVoteRequest(BaseModel):
    user_id: UUID
    election_id: UUID
    position_id: UUID
    candidate_id: UUID