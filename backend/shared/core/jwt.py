import jwt
from datetime import datetime, timedelta
from typing import Dict

SECRET_KEY = "supersecret"   # ⚠️ move to env later
ALGORITHM = "HS256"


def create_access_token(data: Dict, expires_minutes: int = 60) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise Exception("Token expired")

    except jwt.InvalidTokenError:
        raise Exception("Invalid token")