from datetime import datetime, timedelta
from typing import Dict, Optional
import jwt

from shared.core.config import settings


def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_EXPIRY_MINUTES)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token(data: Dict) -> str:
    """
    Create JWT refresh token using the configured refresh expiry.
    """
    expires = timedelta(minutes=settings.JWT_REFRESH_EXPIRY_MINUTES)
    return create_access_token(data, expires_delta=expires)


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