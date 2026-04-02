from fastapi import APIRouter, Depends
from typing import List
import uuid

from app.api.deps import get_organisation_service
from app.services.organisation_service import OrganisationService
from app.schemas.organisation import (
    OrganisationListPendingResponse,
    OrganisationDocumentResponse,
    ApproveOrganisationRequest,
    RejectOrganisationRequest,
)

router = APIRouter()


@router.get("/organizations/{org_id}/documents", response_model=List[OrganisationDocumentResponse])
def get_organisation_documents(
    org_id: uuid.UUID,
    service: OrganisationService = Depends(get_organisation_service),
):
    return service.get_documents(org_id)


@router.get("/organizations", response_model=List[OrganisationListPendingResponse])
def list_pending_organisations(
    status: str = "PENDING_VERIFICATION",
    service: OrganisationService = Depends(get_organisation_service),
):
    return service.get_pending_organisations()


@router.post("/organizations/{org_id}/approve")
def approve_organisation(
    org_id: uuid.UUID,
    req: ApproveOrganisationRequest,
    service: OrganisationService = Depends(get_organisation_service),
):
    admin_id = "admin_001"

    org = service.approve_organisation(org_id, admin_id, req.remarks)

    return {
        "status": org.status,
        "verifiedAt": org.verified_at,
    }


@router.post("/organizations/{org_id}/reject")
def reject_organisation(
    org_id: uuid.UUID,
    req: RejectOrganisationRequest,
    service: OrganisationService = Depends(get_organisation_service),
):
    admin_id = "admin_001"

    org = service.reject_organisation(org_id, admin_id, req.reason)

    return {
        "status": org.status,
    }