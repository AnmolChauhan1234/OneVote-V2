from sqlalchemy.orm import Session
from app.models.voting_token import VotingToken
from datetime import datetime, timedelta


class VotingTokenRepository:
    def __init__(self, db: Session):
        self.db = db

    # ----------------------------------------
    # 🔍 Get active token
    # ----------------------------------------
    def get_active_token(self, user_id: str, election_id: str):
        return (
            self.db.query(VotingToken)
            .filter(
                VotingToken.user_id == user_id,
                VotingToken.election_id == election_id,
                VotingToken.is_used == False,
            )
            .first()
        )

    # ----------------------------------------
    # 🎟 Create token (NO COMMIT)
    # ----------------------------------------
    def create_token(self, user_id, election_id):
        expires_at = datetime.utcnow() + timedelta(minutes=10)

        token = VotingToken(
            user_id=user_id,
            election_id=election_id,
            expires_at=expires_at,
            is_used=False,
        )

        self.db.add(token)
        self.db.flush()   # ✅ important (no commit)

        return token

    # ----------------------------------------
    # 🎟 Mark token used (NO COMMIT)
    # ----------------------------------------
    def mark_token_used(self, token: VotingToken):
        token.is_used = True
        self.db.flush()

        return token