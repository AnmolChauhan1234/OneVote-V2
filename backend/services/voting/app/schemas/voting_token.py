from pydantic import BaseModel
from uuid import UUID


class GenerateTokenRequest(BaseModel):
    user_id: UUID
    election_id: UUID


class TokenResponse(BaseModel):
    token_id: UUID
    expires_at: str