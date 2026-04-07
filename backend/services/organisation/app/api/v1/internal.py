from fastapi import APIRouter, Depends
import uuid

from app.api.deps import get_organisation_service
from app.services.organisation_service import OrganisationService
from app.schemas.organisation import OrganisationEligibilityResponse
from shared.core.dependencies import validate_internal_key

router = APIRouter(dependencies=[Depends(validate_internal_key)])


@router.get("/health")
def internal_health_check():
    return {"status": "ok", "service": "organisation"}


@router.get("/organizations/{org_id}/eligibility", response_model=OrganisationEligibilityResponse)
def get_organisation_eligibility(
    org_id: uuid.UUID,
    service: OrganisationService = Depends(get_organisation_service),
):
    return service.check_eligibility(org_id)


@router.get("/owners/{owner_id}/org")
def get_owner_org(
    owner_id: str,
    service: OrganisationService = Depends(get_organisation_service),
):
    orgs = service.get_organisation_by_owner(owner_id)
    return {"org_ids": [str(org.id) for org in orgs]}