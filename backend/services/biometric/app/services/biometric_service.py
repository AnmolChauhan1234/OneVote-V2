import uuid
import numpy as np
import face_recognition
import httpx
import os

from datetime import datetime, timedelta, timezone
from fastapi import HTTPException

from app.repositories.biometric_repo import BiometricRepository
from app.services.liveness import check_liveness


AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth:8000")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "supersecret")


class BiometricService:
    def __init__(self, repo: BiometricRepository, redis_client):
        self.repo = repo
        self.redis = redis_client

    # ----------------------------------------
    # 🔍 IMAGE → ENCODING
    # ----------------------------------------
    def _get_encoding_from_image(self, image_bytes: bytes) -> list:
        if len(image_bytes) > 2 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large")

        np_img = np.frombuffer(image_bytes, np.uint8)

        import cv2
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image data")

        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(rgb_img)

        if not encodings:
            raise HTTPException(status_code=400, detail="No face detected")

        if len(encodings) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected")

        return encodings[0].tolist()

    # ----------------------------------------
    # 🔗 INTERNAL AUTH CALL
    # ----------------------------------------
    async def _update_auth_biometric_status(self, user_id: uuid.UUID):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/api/v1/internal/biometric-verified",
                json={"user_id": str(user_id)},
                headers={"X-INTERNAL-KEY": INTERNAL_API_KEY},
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to update biometric status in Auth service",
                )

    # ----------------------------------------
    # 👤 ENROLL (UPDATED)
    # ----------------------------------------
    async def enroll_user(self, user_id: str, image_bytes: bytes) -> bool:
        try:
            user_uuid = uuid.UUID(str(user_id))

            encoding_list = self._get_encoding_from_image(image_bytes)

            profile = self.repo.get_profile_by_user_id(user_uuid)

            if profile:
                self.repo.update_profile(profile, encoding_list)
            else:
                self.repo.create_profile(user_uuid, encoding_list)

            # ✅ commit local DB
            self.repo.commit()

            # 🔥 IMPORTANT: call auth service
            await self._update_auth_biometric_status(user_uuid)

            return True

        except HTTPException:
            self.repo.rollback()
            raise

        except Exception as e:
            self.repo.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    # ----------------------------------------
    # 🔐 VERIFY (UNCHANGED)
    # ----------------------------------------
    def verify_user(self, user_id: str, image_bytes: bytes) -> dict:
        try:
            if not check_liveness():
                raise HTTPException(status_code=400, detail="Liveness check failed")

            user_uuid = uuid.UUID(str(user_id))

            new_encoding = np.array(self._get_encoding_from_image(image_bytes))

            profile = self.repo.get_profile_by_user_id(user_uuid)
            if not profile:
                raise HTTPException(status_code=404, detail="Biometric profile not found")

            stored_encoding = np.array(profile.face_encoding)

            distance = face_recognition.face_distance([stored_encoding], new_encoding)[0]

            if distance > 0.6:
                raise HTTPException(status_code=401, detail="Face mismatch")

            biometric_token = str(uuid.uuid4())

            self.redis.setex(
                f"biometric:token:{biometric_token}",
                300,
                str(user_id),
            )

            expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

            self.repo.create_session(
                user_uuid,
                biometric_token,
                expires_at
            )

            self.repo.commit()

            return {"biometric_token": biometric_token}

        except HTTPException:
            self.repo.rollback()
            raise

        except Exception as e:
            self.repo.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    # ----------------------------------------
    # 🔍 VALIDATE TOKEN
    # ----------------------------------------
    def validate_biometric_token(self, user_id: str, token: str) -> bool:
        redis_key = f"biometric:token:{token}"
        stored_user_id = self.redis.get(redis_key)

        if not stored_user_id:
            raise HTTPException(status_code=401, detail="Invalid or expired biometric token")

        if stored_user_id != str(user_id):
            raise HTTPException(status_code=403, detail="Token does not belong to user")

        return True