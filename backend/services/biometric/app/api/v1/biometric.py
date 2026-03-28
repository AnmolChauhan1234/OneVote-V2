from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.schemas.biometric import (
    BiometricEnrollResponse,
    BiometricVerifyResponse,
    LivenessCheckResponse
)
from app.api.deps import get_biometric_service
from app.services.biometric_service import BiometricService
from app.services.liveness import check_liveness
from shared.core.dependencies import get_current_user

router = APIRouter()


@router.post("/enroll", response_model=BiometricEnrollResponse)
async def enroll_biometric(
    user_id: str = Form(...),
    image: UploadFile = File(...),
    service: BiometricService = Depends(get_biometric_service),
    current_user: dict = Depends(get_current_user),
):
    try:
        # 🔒 strict check
        if str(current_user["user_id"]) != user_id:
            raise HTTPException(status_code=403, detail="Cannot enroll for another user")

        image_bytes = await image.read()
        service.enroll_user(user_id, image_bytes)

        return BiometricEnrollResponse(
            success=True,
            message="Biometric enrolled"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify", response_model=BiometricVerifyResponse)
async def verify_biometric(
    user_id: str = Form(...),
    image: UploadFile = File(...),
    service: BiometricService = Depends(get_biometric_service),
    current_user: dict = Depends(get_current_user),
):
    try:
        # 🔒 strict check
        if str(current_user["user_id"]) != user_id:
            raise HTTPException(status_code=403, detail="Cannot verify for another user")

        image_bytes = await image.read()
        result = service.verify_user(user_id, image_bytes)

        return BiometricVerifyResponse(
            success=True,
            biometric_token=result["biometric_token"],
            message="Verification successful",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/liveness-check", response_model=LivenessCheckResponse)
async def verify_liveness(
    current_user: dict = Depends(get_current_user)
):
    is_live = check_liveness()

    return LivenessCheckResponse(
        success=is_live,
        liveness_score=1.0 if is_live else 0.0,
        message="Liveness passed (mock)" if is_live else "Liveness failed",
    )