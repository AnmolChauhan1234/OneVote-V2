from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.organisation import OrganisationListPendingResponse, OrganisationDocumentResponse, ApproveOrganisationRequest, RejectOrganisationRequest, OrganisationResponse
from app.services.organisation_service import organisation_service

router = APIRouter()

@router.get("/organizations/{org_id}/documents", response_model=List[OrganisationDocumentResponse])
def get_organisation_documents(org_id: int, db: Session = Depends(get_db)):
    return organisation_service.get_documents(db, org_id)

@router.get("/organizations", response_model=List[OrganisationListPendingResponse])
def list_pending_organisations(status: str = "PENDING_VERIFICATION", db: Session = Depends(get_db)):
    return organisation_service.get_pending_organisations(db)

@router.post("/organizations/{org_id}/approve")
def approve_organisation(org_id: int, req: ApproveOrganisationRequest, db: Session = Depends(get_db)):
    admin_id = "admin_001"
    org = organisation_service.approve_organisation(db, org_id, admin_id, req.remarks)
    return {
        "status": org.status,
        "verifiedAt": org.verified_at
    }

@router.post("/organizations/{org_id}/reject")
def reject_organisation(org_id: int, req: RejectOrganisationRequest, db: Session = Depends(get_db)):
    admin_id = "admin_001"
    org = organisation_service.reject_organisation(db, org_id, admin_id, req.reason)
    return {
        "status": org.status
    }
