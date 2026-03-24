from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.schemas.organisation import OrganisationCreate, OrganisationUpdate
from app.repositories.organisation_repo import organisation_repo

class OrganisationService:
    def get_organisation(self, db: Session, org_id: int):
        org = organisation_repo.get_by_id(db, org_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organisation not found")
        return org

    def list_organisations(self, db: Session, skip: int = 0, limit: int = 100):
        return organisation_repo.get_all(db, skip=skip, limit=limit)

    def create_organisation(self, db: Session, org_in: OrganisationCreate):
        return organisation_repo.create(db, org_in)

    def update_organisation(self, db: Session, org_id: int, org_in: OrganisationUpdate):
        org = self.get_organisation(db, org_id)
        return organisation_repo.update(db, org, org_in)

    def delete_organisation(self, db: Session, org_id: int):
        org = self.get_organisation(db, org_id)
        organisation_repo.delete(db, org)

organisation_service = OrganisationService()
