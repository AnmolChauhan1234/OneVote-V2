import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List
from app.repositories.session_repo import SessionRepository
from shared.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token as decode_jwt,
)
from shared.core.config import settings
from redis import Redis


class SessionService:
    def __init__(self, session_repo: SessionRepository, redis_client: Redis):
        self.repo = session_repo
        self.redis = redis_client

    def create_session(
        self,
        user_id: uuid.UUID,
        role: str,
        user_type: str,
        org_ids: List[uuid.UUID] = None,
        device_id: str = None,
    ) -> Dict[str, str]:
        lock_key = f"lock:create_session:{user_id}"
        # 🔥 Distributed Lock to prevent login race conditions
        with self.redis.lock(lock_key, timeout=10):
            try:
                # Enforce "Only one active session per user"
                existing_session = self.repo.get_by_user_id(user_id)
                if existing_session:
                    # If not expired, reject or invalidate.
                    # Checklist says: "Single-session enforcement logic that conflicts with token rotation"
                    # We will invalidate existing to allow the new login to proceed (common practice)
                    if existing_session.expires_at > datetime.now(timezone.utc):
                        self.repo.delete_all_for_user(user_id)
                    else:
                        self.repo.delete_all_for_user(user_id)

                refresh_token = create_refresh_token({"sub": str(user_id)})
                expires_at = datetime.now(timezone.utc) + timedelta(
                    minutes=settings.JWT_REFRESH_EXPIRY_MINUTES
                )

                self.repo.create(user_id, refresh_token, expires_at, device_id)

                payload = {
                    "sub": str(user_id),
                    "role": role,
                    "user_type": user_type,
                    "org_ids": [str(oid) for oid in (org_ids or [])],
                }
                access_token = create_access_token(payload)

                # 🔥 Atomic Commit
                self.repo.db.commit()

                return {"access_token": access_token, "refresh_token": refresh_token}
            except Exception as e:
                self.repo.db.rollback()
                raise e

    def refresh_session(
        self,
        old_refresh_token: str,
        role: str,
        user_type: str,
        org_ids: List[uuid.UUID] = None,
    ) -> Dict[str, str]:
        # We need the user_id to lock effectively. Decode without validating expiry (it might be handled by repo)

        payload = decode_jwt(old_refresh_token)
        if not payload or not payload.get("sub"):
            raise Exception("Invalid refresh token")

        user_id = payload.get("sub")
        lock_key = f"lock:refresh_session:{user_id}"

        # 🔥 Distributed Lock to prevent token rotation race (TOCTOU)
        with self.redis.lock(lock_key, timeout=10):
            try:
                session = self.repo.get_by_token(old_refresh_token)
                if not session or session.expires_at < datetime.now(timezone.utc):
                    if session:
                        self.repo.delete_by_token(old_refresh_token)
                        self.repo.db.commit()
                    raise Exception("Session expired. Please login again.")

                # Refresh token rotation
                self.repo.delete_by_token(old_refresh_token)

                new_refresh_token = create_refresh_token({"sub": str(user_id)})
                expires_at = datetime.now(timezone.utc) + timedelta(
                    minutes=settings.JWT_REFRESH_EXPIRY_MINUTES
                )

                self.repo.create(
                    user_id, new_refresh_token, expires_at, session.device_id
                )

                payload = {
                    "sub": str(user_id),
                    "role": role,
                    "user_type": user_type,
                    "org_ids": [str(oid) for oid in (org_ids or [])],
                }
                access_token = create_access_token(payload)

                # 🔥 Atomic Commit
                self.repo.db.commit()

                return {
                    "access_token": access_token,
                    "refresh_token": new_refresh_token,
                }
            except Exception as e:
                self.repo.db.rollback()
                raise e

    def logout(self, user_id: uuid.UUID, access_token: str = None):
        self.repo.delete_all_for_user(user_id)
        if access_token:
            # Blacklist access token in Redis
            try:
                payload = decode_jwt(access_token)
                if payload:  # 🔥 Fix for potential None from decode_jwt
                    exp = payload.get("exp")
                    if exp:
                        remaining = exp - int(datetime.now(timezone.utc).timestamp())
                        if remaining > 0:
                            self.redis.setex(
                                f"blacklist:{access_token}", remaining, "1"
                            )
            except:
                pass

    def is_access_token_blacklisted(self, access_token: str) -> bool:
        return self.redis.exists(f"blacklist:{access_token}") > 0
