import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from typing import Optional

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

# SECRET_KEY = os.getenv("JWT_SECRET", "supersecret")
# ALGORITHM = "HS256"

# ACCESS_TOKEN_EXPIRE_MINUTES = 5
# REFRESH_TOKEN_EXPIRE_MINUTES = 20


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# def create_jwt(data: dict, expires_delta: Optional[timedelta] = None) -> str:
#     to_encode = data.copy()

#     expire = datetime.now(timezone.utc) + (
#         expires_delta or timedelta(minutes=15)
#     )

#     to_encode.update({"exp": expire})

#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# def create_access_token(data: dict) -> str:
#     return create_jwt(data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))


# def create_refresh_token(data: dict) -> str:
#     return create_jwt(data, timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES))


# def decode_jwt(token: str) -> dict:
#     return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

from shared.core.jwt import create_access_token, decode_token as decode_jwt

# Mapping shared functions to existing names
def create_refresh_token(data: dict) -> str:
    # Using shared create_access_token for refresh tokens as well
    return create_access_token(data)