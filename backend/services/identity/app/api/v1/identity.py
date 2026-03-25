from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_identity_service
from app.services.identity_service import IdentityService
from app.schemas.identity import IdentityVerifyRequest, IdentityResponse, MessageResponse

router = APIRouter()

@router.post("/verify", response_model=IdentityResponse)
async def verify_identity(
    request: IdentityVerifyRequest,
    service: IdentityService = Depends(get_identity_service)
):
    try:
        identity = await service.verify_identity(request)
        return identity
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/{user_id}", response_model=IdentityResponse)
def get_identity_status(
    user_id: str,
    service: IdentityService = Depends(get_identity_service)
):
    import uuid
    identity = service.repo.get_by_user_id(uuid.UUID(user_id))
    if not identity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identity verification not found for this user"
        )
    return identity
