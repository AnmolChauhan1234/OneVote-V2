import uuid
import numpy as np
import face_recognition
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from redis import Redis
from app.repositories.biometric_repo import (
    get_profile_by_user_id,
    create_profile,
    update_profile,
    create_session,
)
from app.services.liveness import check_liveness


def _get_encoding_from_image(image_bytes: bytes) -> list:
    """Extracts a face encoding from image bytes."""

    # 🔐 NEW — Image size validation
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


def enroll_user(db: Session, user_id: str, image_bytes: bytes):
    encoding_list = _get_encoding_from_image(image_bytes)

    profile = get_profile_by_user_id(db, user_id)

    if profile:
        update_profile(db, profile, encoding_list)
    else:
        create_profile(db, user_id, encoding_list)

    return True


def verify_user(db: Session, redis_client: Redis, user_id: str, image_bytes: bytes):
    """Verify user face, check liveness, and issue token."""

    # 🔐 FIX — Remove wrong frames param (mock liveness)
    if not check_liveness():
        raise HTTPException(status_code=400, detail="Liveness check failed")

    # 🔐 Encoding
    new_encoding_list = _get_encoding_from_image(image_bytes)
    new_encoding = np.array(new_encoding_list)

    profile = get_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Biometric profile not found")

    stored_encoding = np.array(profile.face_encoding)

    # 🔐 IMPROVED — distance check (better than only compare_faces)
    distance = face_recognition.face_distance([stored_encoding], new_encoding)[0]

    if distance > 0.6:
        raise HTTPException(status_code=401, detail="Face mismatch")

    # 🔐 Generate token
    biometric_token = str(uuid.uuid4())

    # 🔐 Store in Redis
    redis_client.setex(
        f"biometric:token:{biometric_token}",
        300,
        str(user_id)
    )

    # 🔐 Store in DB (optional but good)
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    create_session(db, user_id, biometric_token, expires_at)

    # 🔐 FIX — return structured response
    return {
        "biometric_token": biometric_token
    }


def validate_biometric_token(redis_client: Redis, user_id: str, token: str):
    redis_key = f"biometric:token:{token}"
    stored_user_id = redis_client.get(redis_key)

    if not stored_user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired biometric token")

    if isinstance(stored_user_id, bytes):
        stored_user_id = stored_user_id.decode("utf-8")

    if stored_user_id != str(user_id):
        raise HTTPException(status_code=403, detail="Token does not belong to user")

    return True