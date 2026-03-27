import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_user_service
from app.services.user_service import UserService

from app.schemas.internal import VerificationUpdate
from app.schemas.auth import MessageResponse, UserResponse

from shared.core.dependencies import validate_internal_key


router = APIRouter(dependencies=[Depends(validate_internal_key)])


@router.post("/identity-verified", response_model=MessageResponse)
def identity_verified(
    data: VerificationUpdate, user_service: UserService = Depends(get_user_service)
):
    if user_service.update_identity_status(data.user_id, True):
        return {"message": "Identity status updated"}

    raise HTTPException(status_code=404, detail="User not found")


@router.post("/biometric-verified", response_model=MessageResponse)
def biometric_verified(
    data: VerificationUpdate, user_service: UserService = Depends(get_user_service)
):
    if user_service.update_biometric_status(data.user_id, True):
        return {"message": "Biometric status updated"}

    raise HTTPException(status_code=404, detail="User not found")


@router.get("/user/{user_id}", response_model=UserResponse)
def get_user_internal(
    user_id: uuid.UUID, user_service: UserService = Depends(get_user_service)
):
    user = user_service.get_user_by_id(user_id)

    print("in internal auth: ", user)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
