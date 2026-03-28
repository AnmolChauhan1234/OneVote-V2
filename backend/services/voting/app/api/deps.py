from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.voting_repo import VotingRepository
from app.repositories.voting_token_repo import VotingTokenRepository
from app.services.voting_service import VotingService
from app.services.voting_token_service import VotingTokenService


# ---------------- REPOSITORIES ----------------

def get_voting_repo(db: Session = Depends(get_db)) -> VotingRepository:
    return VotingRepository(db)


def get_voting_token_repo(db: Session = Depends(get_db)) -> VotingTokenRepository:
    return VotingTokenRepository(db)


# ---------------- SERVICES ----------------

def get_voting_service(
    repo: VotingRepository = Depends(get_voting_repo),
    token_repo: VotingTokenRepository = Depends(get_voting_token_repo),
) -> VotingService:
    return VotingService(repo, token_repo)


def get_voting_token_service(
    repo: VotingTokenRepository = Depends(get_voting_token_repo),
) -> VotingTokenService:
    return VotingTokenService(repo)