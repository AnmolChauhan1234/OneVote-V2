from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.biometric_repo import BiometricRepository
from app.services.biometric_service import BiometricService

# 🔥 USE SHARED REDIS
from shared.core.redis import redis_client


def get_biometric_repo(db: Session = Depends(get_db)) -> BiometricRepository:
    return BiometricRepository(db)


def get_biometric_service(
    repo: BiometricRepository = Depends(get_biometric_repo),
) -> BiometricService:
    return BiometricService(repo, redis_client)