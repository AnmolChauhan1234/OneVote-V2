from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.voting_token import GenerateTokenRequest
from app.services.voting_token_service import generate_token
from app.db.session import get_db

# 🔥 shared auth
from shared.core.dependencies import get_current_user

router = APIRouter()


@router.post("/generate-token")
def generate_token_endpoint(
    request: GenerateTokenRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),   # 🔥 ensure user is logged in
):
    try:
        # 🔥 SECURITY CHECK (does NOT break your flow)
        if str(request.user_id) != str(user["user_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only generate token for yourself",
            )

        token = generate_token(
            db=db,
            user_id=request.user_id,
            election_id=request.election_id,
        )

        return {
            "token_id": str(token.token_id),
            "expires_at": token.expires_at.isoformat(),
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )