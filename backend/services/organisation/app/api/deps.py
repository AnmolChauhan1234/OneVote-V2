from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.organisation_repo import OrganisationRepository
from app.services.organisation_service import OrganisationService


def get_organisation_repo(
    db: Session = Depends(get_db),
) -> OrganisationRepository:
    return OrganisationRepository(db)


def get_organisation_service(
    repo: OrganisationRepository = Depends(get_organisation_repo),
) -> OrganisationService:
    return OrganisationService(repo)