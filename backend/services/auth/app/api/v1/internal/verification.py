from fastapi import APIRouter, Depends
from app.api.deps import get_user_org_identifier_service
from app.services.user_org_identifier_service import UserOrgIdentifierService
from app.schemas.user_org_identifier import InternalVoterVerificationRequest, InternalVoterVerificationResponse
from shared.core.dependencies import validate_internal_key

router = APIRouter(dependencies=[Depends(validate_internal_key)])

@router.post("/verify-org-identifiers", response_model=InternalVoterVerificationResponse)
def verify_org_identifiers(
    request_data: InternalVoterVerificationRequest,
    service: UserOrgIdentifierService = Depends(get_user_org_identifier_service)
):
    return service.verify_identifiers(request_data.org_id, request_data.identifiers)
