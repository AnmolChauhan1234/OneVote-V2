from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from redis import Redis
from app.db.session import get_db   # ✅ FIX — import instead of redefining
from app.schemas.biometric import (
    BiometricEnrollResponse,
    BiometricVerifyResponse,
    LivenessCheckResponse
)
from app.services.biometric_service import enroll_user, verify_user
from app.services.liveness import check_liveness
import redis
import os

router = APIRouter()


# 🔐 Redis dependency (Docker-safe)
def get_redis():
    redis_client = redis.Redis.from_url(
        os.getenv("REDIS_URL", "redis://redis:6379")
    )
    yield redis_client


@router.post("/enroll", response_model=BiometricEnrollResponse)
async def enroll_biometric(
    user_id: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        image_bytes = await image.read()

        enroll_user(db, user_id, image_bytes)

        return BiometricEnrollResponse(
            success=True,
            message="Biometric enrolled"
        )

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify", response_model=BiometricVerifyResponse)
async def verify_biometric(
    user_id: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    redis_client: Redis = Depends(get_redis)
):
    try:
        image_bytes = await image.read()

        result = verify_user(db, redis_client, user_id, image_bytes)

        return BiometricVerifyResponse(
            success=True,
            biometric_token=result["biometric_token"],
            message="Verification successful"
        )

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/liveness-check", response_model=LivenessCheckResponse)
async def verify_liveness():
    """
    Mock liveness endpoint (always passes for now)
    """
    is_live = check_liveness()

    return LivenessCheckResponse(
        success=True,
        liveness_score=1.0,
        message="Liveness passed (mock)"
    )