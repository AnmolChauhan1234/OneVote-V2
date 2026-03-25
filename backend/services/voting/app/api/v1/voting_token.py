from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.voting_token import GenerateTokenRequest
from app.services.voting_token_service import generate_token
from app.core.dependencies import get_db

router = APIRouter()


@router.post("/generate-token")
def generate_token_endpoint(
    request: GenerateTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        token = generate_token(
            db,
            user_id=request.user_id,
            election_id=request.election_id,
        )

        return {
            "token_id": str(token.token_id),
            "expires_at": token.expires_at.isoformat(),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))