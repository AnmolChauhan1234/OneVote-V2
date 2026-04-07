import uuid
from pydantic import BaseModel


class VerificationUpdate(BaseModel):
    user_id: uuid.UUID


class UserTypeUpdate(BaseModel):
    user_id: uuid.UUID
    user_type: str
