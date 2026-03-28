from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.election_repo import ElectionRepository
from app.services.election_service import ElectionService


# ---------------- REPOSITORY ----------------

def get_election_repo(
    db: Session = Depends(get_db),
) -> ElectionRepository:
    return ElectionRepository(db)


# ---------------- SERVICE ----------------

def get_election_service(
    repo: ElectionRepository = Depends(get_election_repo),
) -> ElectionService:
    return ElectionService(repo)