from fastapi import APIRouter, Depends
from shared.core.dependencies import validate_internal_key

router = APIRouter(
    dependencies=[Depends(validate_internal_key)],
    tags=["internal"]
)


@router.get("/health")
def internal_health_check():
    return {
        "status": "ok",
        "service": "biometric",
    }