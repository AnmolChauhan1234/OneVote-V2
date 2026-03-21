from datetime import datetime
from app.repositories.voting_token_repo import get_active_token


def validate_token(db, user_id: str, election_id: str):
    token = get_active_token(db, user_id, election_id)

    if not token:
        raise Exception("Invalid or already used token")

    if token.expires_at < datetime.utcnow():
        raise Exception("Token expired")

    return token





from app.repositories.voting_token_repo import create_token, get_active_token


def generate_token(db, user_id, election_id):
    # Prevent multiple active tokens
    existing = get_active_token(db, user_id, election_id)

    if existing:
        return existing

    return create_token(db, user_id, election_id)