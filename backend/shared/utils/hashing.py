import hashlib


def sha256_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()