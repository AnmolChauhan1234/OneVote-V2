import uuid
from pydantic import BaseModel


class VerificationUpdate(BaseModel):
    user_id: uuid.UUID
