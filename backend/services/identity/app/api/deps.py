from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.identity_repo import IdentityRepository
from app.services.identity_service import IdentityService

def get_identity_repo(db: Session = Depends(get_db)) -> IdentityRepository:
    return IdentityRepository(db)

def get_identity_service(repo: IdentityRepository = Depends(get_identity_repo)) -> IdentityService:
    return IdentityService(repo)
