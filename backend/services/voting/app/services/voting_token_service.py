from datetime import datetime, timezone
from fastapi import HTTPException


class VotingTokenService:
    def __init__(self, repo):
        self.repo = repo

    # ----------------------------------------
    # 🔐 VALIDATE TOKEN
    # ----------------------------------------
    def validate_token(self, user_id: str, election_id: str):
        token = self.repo.get_active_token(user_id, election_id)

        if not token:
            raise HTTPException(
                status_code=400,
                detail="Invalid or already used token"
            )

        if token.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=400,
                detail="Token expired"
            )

        return token

    # ----------------------------------------
    # 🎟 GENERATE TOKEN
    # ----------------------------------------
    def generate_token(self, user_id: str, election_id: str):
        # Prevent multiple active tokens
        existing = self.repo.get_active_token(user_id, election_id)

        if existing:
            return existing

        try:
            token = self.repo.create_token(user_id, election_id)
            self.repo.commit()
            self.repo.refresh(token)
            return token
        except Exception:
            self.repo.rollback()
            raise

    # ----------------------------------------
    # 🎟 MARK TOKEN USED
    # ----------------------------------------
    def mark_token_used(self, token):
        return self.repo.mark_token_used(token)