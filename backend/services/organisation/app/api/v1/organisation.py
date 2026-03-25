from fastapi import APIRouter, Depends, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.organisation import OrganisationResponse, OrganisationCreate, OrganisationUpdate
from app.services.organisation_service import organisation_service

router = APIRouter()

@router.post("/", response_model=OrganisationResponse, status_code=status.HTTP_201_CREATED)
def create_organisation(
    name: str = Form(...),
    type: str = Form(None),
    description: str = Form(None),
    ownerId: str = Form(None),
    document: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    org_in = OrganisationCreate(
        name=name, 
        type=type, 
        description=description, 
        owner_id=ownerId
    )
    return organisation_service.create_organisation(db, org_in, document)

@router.get("/", response_model=List[OrganisationResponse])
def get_organisations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return organisation_service.list_organisations(db, skip=skip, limit=limit)

@router.get("/{org_id}", response_model=OrganisationResponse)
def get_organisation(
    org_id: int,
    db: Session = Depends(get_db)
):
    return organisation_service.get_organisation(db, org_id)

@router.put("/{org_id}", response_model=OrganisationResponse)
def update_organisation(
    org_id: int,
    org_in: OrganisationUpdate,
    db: Session = Depends(get_db)
):
    return organisation_service.update_organisation(db, org_id, org_in)

@router.put("/{org_id}/documents", response_model=OrganisationResponse)
def reupload_document(
    org_id: int,
    document: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return organisation_service.reupload_document(db, org_id, document)

@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organisation(
    org_id: int,
    db: Session = Depends(get_db)
):
    organisation_service.delete_organisation(db, org_id)
