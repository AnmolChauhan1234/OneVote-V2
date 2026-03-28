from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from app.schemas.voting import CastVoteRequest
from app.api.deps import get_voting_service
from app.services.voting_service import VotingService

# 🔥 shared auth
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
    service: VotingService = Depends(get_voting_service),   # ✅ use service DI
    user=Depends(get_current_user),   # 🔥 JWT + Redis validation
):
    try:
        vote = service.cast_vote(
            vote_data=vote_data,
            user_id=user["user_id"],   # 🔥 from JWT (correct)
        )

        return {
            "message": "Vote cast successfully",
            "vote_id": str(vote.vote_id),
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ---------------- VERIFY VOTES ----------------
@router.get("/verify/{election_id}")
def verify_votes(
    election_id: UUID,
    service: VotingService = Depends(get_voting_service),   # ✅ service DI
):
    try:
        return service.verify_election_votes(election_id)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )