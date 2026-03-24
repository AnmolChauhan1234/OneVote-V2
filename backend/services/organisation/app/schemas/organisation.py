from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class OrganisationBase(BaseModel):
    name: str
    description: Optional[str] = None

class OrganisationCreate(OrganisationBase):
    pass

class OrganisationUpdate(OrganisationBase):
    name: Optional[str] = None

class OrganisationResponse(OrganisationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
