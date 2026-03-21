import jwt
from datetime import datetime, timedelta
from typing import Dict
from shared.core.config import settings


def create_access_token(data: Dict) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> Dict:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise Exception("Token expired")

    except jwt.InvalidTokenError:
        raise Exception("Invalid token")