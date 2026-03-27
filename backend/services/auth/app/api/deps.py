import os
from sqlalchemy.orm import Session
from fastapi import Depends, Request, HTTPException, status
from app.db.session import get_db
from app.db.redis import get_redis
from app.repositories.user_repo import UserRepository
from app.repositories.session_repo import SessionRepository
from app.services.user_service import UserService
from app.services.session_service import SessionService
from app.services.otp_service import OTPService
from redis import Redis


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    repo = UserRepository(db)
    return UserService(repo)


def get_session_service(
    db: Session = Depends(get_db), redis: Redis = Depends(get_redis)
) -> SessionService:
    repo = SessionRepository(db)
    return SessionService(repo, redis)


def get_otp_service(redis: Redis = Depends(get_redis)) -> OTPService:
    return OTPService(redis)

