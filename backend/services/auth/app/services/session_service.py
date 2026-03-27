import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from app.repositories.session_repo import SessionRepository
from shared.core.jwt import create_access_token, create_refresh_token, decode_token as decode_jwt
from shared.core.config import settings
from redis import Redis


class SessionService:
    def __init__(self, session_repo: SessionRepository, redis_client: Redis):
        self.repo = session_repo
        self.redis = redis_client

    def create_session(self, user_id: uuid.UUID, device_id: str = None) -> Dict[str, str]:
        # Enforce "Only one active session per user"
        existing_session = self.repo.get_by_user_id(user_id)
        if existing_session:
            # Check if expired, if not, reject
            if existing_session.expires_at > datetime.now(timezone.utc):
                # Optionally, you could delete it and allow new login, 
                # but requirement says "Reject login if session exists"
                raise Exception("Active session already exists for this user.")
            else:
                self.repo.delete_all_for_user(user_id)

        refresh_token = create_refresh_token({"sub": str(user_id)})
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_REFRESH_EXPIRY_MINUTES)
        
        self.repo.create(user_id, refresh_token, expires_at, device_id)
        
        access_token = create_access_token({"sub": str(user_id)})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    def refresh_session(self, old_refresh_token: str) -> Dict[str, str]:
        session = self.repo.get_by_token(old_refresh_token)
        if not session or session.expires_at < datetime.now(timezone.utc):
            if session:
                self.repo.delete_by_token(old_refresh_token)
            raise Exception("Invalid or expired refresh token")

        # Refresh token rotation
        user_id = session.user_id
        self.repo.delete_by_token(old_refresh_token)
        
        new_refresh_token = create_refresh_token({"sub": str(user_id)})
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_REFRESH_EXPIRY_MINUTES)
        
        self.repo.create(user_id, new_refresh_token, expires_at, session.device_id)
        
        access_token = create_access_token({"sub": str(user_id)})
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token
        }

    def logout(self, user_id: uuid.UUID, access_token: str = None):
        self.repo.delete_all_for_user(user_id)
        if access_token:
            # Blacklist access token in Redis
            try:
                payload = decode_jwt(access_token)
                exp = payload.get("exp")
                if exp:
                    remaining = exp - int(datetime.now(timezone.utc).timestamp())
                    if remaining > 0:
                        self.redis.setex(f"blacklist:{access_token}", remaining, "1")
            except:
                pass

    def is_access_token_blacklisted(self, access_token: str) -> bool:
        return self.redis.exists(f"blacklist:{access_token}") > 0
