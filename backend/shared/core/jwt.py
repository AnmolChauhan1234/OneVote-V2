from datetime import datetime, timedelta
from typing import Dict, Optional
import jwt

from shared.core.config import settings


def create_access_token(data: Dict) -> str:
    """
    Create JWT access token
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> Optional[Dict]:
    """
    Decode JWT token
    Returns None if invalid instead of raising (important for dependencies)
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None