from shared.core.security import verify_password
from shared.core.security import hash_password
from shared.core.jwt import create_access_token, decode_token as decode_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return verify_password(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return hash_password(password)


# Mapping shared functions to existing names
def create_refresh_token(data: dict) -> str:
    # Using shared create_access_token for refresh tokens as well
    return create_access_token(data)