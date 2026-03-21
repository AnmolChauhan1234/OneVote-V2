from app.db.session import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




from fastapi import Header, HTTPException
from shared.core.jwt import decode_token
from shared.core.redis import get_redis, get_session


def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        scheme, token = authorization.split()

        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")

        # 🔥 Decode JWT
        payload = decode_token(token)

        session_id = payload.get("session_id")
        user_id = payload.get("user_id")

        if not session_id or not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # 🔥 Validate session in Redis
        redis_client = get_redis()
        session = get_session(redis_client, session_id)

        if not session:
            raise HTTPException(status_code=401, detail="Session expired or invalid")

        return payload

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))