import hashlib
import secrets


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def generate_secure_token(length: int = 32) -> str:
    return secrets.token_hex(length)