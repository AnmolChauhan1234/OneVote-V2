from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.schemas.voting import CastVoteRequest
from app.services.voting_service import cast_vote, verify_election_votes
from app.db.session import get_db

# 🔥 USE SHARED AUTH (NOT LOCAL)
from shared.core.dependencies import get_current_user

router = APIRouter()


# ---------------- HEALTH ----------------
@router.get("/health")
def health():
    return {"status": "Voting service running"}


# ---------------- CAST VOTE ----------------
@router.post("/cast-vote")
def cast_vote_endpoint(
    vote_data: CastVoteRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),   # 🔥 JWT + Redis validation
):
    try:
        vote = cast_vote(
            db=db,
            vote_data=vote_data,
            user_id=user["user_id"],   # 🔥 extracted from token
        )

        return {
            "message": "Vote cast successfully",
            "vote_id": str(vote.vote_id),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ---------------- VERIFY VOTES ----------------
@router.get("/verify/{election_id}")
def verify_votes(
    election_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Public or admin endpoint (no auth required unless you want to restrict it)
    """
    try:
        result = verify_election_votes(db, election_id)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )