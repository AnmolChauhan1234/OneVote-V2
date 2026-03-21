from sqlalchemy.orm import Session
from app.models.voting_token import VotingToken


def get_active_token(db: Session, user_id: str, election_id: str):
    return (
        db.query(VotingToken)
        .filter(
            VotingToken.user_id == user_id,
            VotingToken.election_id == election_id,
            VotingToken.is_used == False,
        )
        .first()
    )


def mark_token_used(db: Session, token: VotingToken):
    token.is_used = True
    db.commit()
    db.refresh(token)




from app.models.voting_token import VotingToken
from datetime import datetime, timedelta


def create_token(db, user_id, election_id):
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    token = VotingToken(
        user_id=user_id,
        election_id=election_id,
        expires_at=expires_at,
        is_used=False,
    )

    db.add(token)
    db.commit()
    db.refresh(token)

    return token