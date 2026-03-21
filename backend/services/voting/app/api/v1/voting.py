from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.schemas.voting import CastVoteRequest
from app.services.voting_service import cast_vote, verify_election_votes
from app.core.dependencies import get_db

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "Voting service running"}



from app.core.dependencies import get_current_user


@router.post("/cast-vote")
def cast_vote_endpoint(
    vote_data: CastVoteRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        vote = cast_vote(
            db,
            vote_data,
            user_id=user["user_id"],   # 🔥 from JWT
        )

        return {
            "message": "Vote cast successfully",
            "vote_id": str(vote.vote_id),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/verify/{election_id}")
def verify_votes(
    election_id: UUID,
    db: Session = Depends(get_db),
):
    try:
        result = verify_election_votes(db, election_id)
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))