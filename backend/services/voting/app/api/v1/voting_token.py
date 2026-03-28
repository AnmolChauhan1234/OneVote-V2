from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.voting_token import GenerateTokenRequest
from app.api.deps import get_voting_token_service
from app.services.voting_token_service import VotingTokenService

# 🔥 shared auth
from shared.core.dependencies import get_current_user

router = APIRouter()


@router.post("/generate-token")
def generate_token_endpoint(
    request: GenerateTokenRequest,
    service: VotingTokenService = Depends(get_voting_token_service),  # ✅ DI
    user=Depends(get_current_user),
):
    try:
        # 🔥 SECURITY CHECK
        if str(request.user_id) != str(user["user_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only generate token for yourself",
            )

        token = service.generate_token(
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