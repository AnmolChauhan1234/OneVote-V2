from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.organisation import OrganisationEligibilityResponse
from app.services.organisation_service import organisation_service

router = APIRouter()

@router.get("/organizations/{org_id}/eligibility", response_model=OrganisationEligibilityResponse)
def get_organisation_eligibility(org_id: int, db: Session = Depends(get_db)):
    return organisation_service.check_eligibility(db, org_id)
