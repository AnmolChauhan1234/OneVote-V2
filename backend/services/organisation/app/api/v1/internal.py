from fastapi import APIRouter, Depends

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
    org_id: int,
    service: OrganisationService = Depends(get_organisation_service),
):
    return service.check_eligibility(org_id)