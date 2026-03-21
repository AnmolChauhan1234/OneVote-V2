import hashlib


SECRET_KEY = "super_secret_key"  # later move to env


def generate_user_reference(user_id: str, election_id: str) -> str:
    raw = f"{user_id}:{election_id}:{SECRET_KEY}"
    return hashlib.sha256(raw.encode()).hexdigest()