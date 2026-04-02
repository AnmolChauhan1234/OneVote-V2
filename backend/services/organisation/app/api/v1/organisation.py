from fastapi import APIRouter, Depends, status, Form, UploadFile, File
from typing import List
import uuid

from app.api.deps import get_organisation_service
from app.services.organisation_service import OrganisationService
from app.schemas.organisation import OrganisationResponse, OrganisationCreate, OrganisationUpdate

router = APIRouter()


@router.post("/", response_model=OrganisationResponse, status_code=status.HTTP_201_CREATED)
def create_organisation(
    name: str = Form(...),
    type: str = Form(None),
    description: str = Form(None),
    ownerId: str = Form(None),
    document: UploadFile = File(...),
    service: OrganisationService = Depends(get_organisation_service),
):
    org_in = OrganisationCreate(
        name=name,
        type=type,
        description=description,
        owner_id=ownerId,
    )
    return service.create_organisation(org_in, document)


@router.get("/", response_model=List[OrganisationResponse])
def get_organisations(
    skip: int = 0,
    limit: int = 100,
    service: OrganisationService = Depends(get_organisation_service),
):
    return service.list_organisations(skip=skip, limit=limit)


@router.get("/{org_id}", response_model=OrganisationResponse)
def get_organisation(
    org_id: uuid.UUID,
    service: OrganisationService = Depends(get_organisation_service),
):
    return service.get_organisation(org_id)


@router.put("/{org_id}", response_model=OrganisationResponse)
def update_organisation(
    org_id: uuid.UUID,
    org_in: OrganisationUpdate,
    service: OrganisationService = Depends(get_organisation_service),
):
    return service.update_organisation(org_id, org_in)


@router.put("/{org_id}/documents", response_model=OrganisationResponse)
def reupload_document(
    org_id: uuid.UUID,
    document: UploadFile = File(...),
    service: OrganisationService = Depends(get_organisation_service),
):
    return service.reupload_document(org_id, document)


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organisation(
    org_id: uuid.UUID,
    service: OrganisationService = Depends(get_organisation_service),
):
    service.delete_organisation(org_id)