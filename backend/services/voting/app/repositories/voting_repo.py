from sqlalchemy.orm import Session
from app.models.vote import Vote
from app.models.vote_participation import VoteParticipation


# ----------------------------------------
# 🗳 Get last vote (for hash chain)
# ----------------------------------------
def get_last_vote(db: Session, election_id):
    return (
        db.query(Vote)
        .filter(Vote.election_id == election_id)
        .order_by(Vote.block_index.desc())
        .first()
    )




# ✅ NEW FUNCTION (FOR RACE CONDITION)
def get_last_vote_for_update(db: Session, election_id):
    return (
        db.query(Vote)
        .filter(Vote.election_id == election_id)
        .order_by(Vote.block_index.desc())
        .with_for_update()  # 🔥 THIS IS THE FIX
        .first()
    )




# ----------------------------------------
# 🗳 Create vote (NO COMMIT HERE)
# ----------------------------------------
def create_vote(
    db: Session,
    election_id,
    position_id,
    candidate_id,
    user_reference_hash,
    previous_hash,
    vote_hash,
    block_index,
):
    vote = Vote(
        election_id=election_id,
        position_id=position_id,
        candidate_id=candidate_id,
        user_reference_hash=user_reference_hash,
        previous_hash=previous_hash,
        vote_hash=vote_hash,
        block_index=block_index,
    )

    db.add(vote)
    db.flush()  # important (do not commit here)

    return vote


# ----------------------------------------
# 🚫 Check participation (prevent double voting)
# ----------------------------------------
def get_participation(db: Session, user_id, election_id):
    return (
        db.query(VoteParticipation)
        .filter(
            VoteParticipation.user_id == user_id,
            VoteParticipation.election_id == election_id,
        )
        .first()
    )


# ----------------------------------------
# 🧾 Create participation record
# ----------------------------------------
def create_participation(db: Session, user_id, election_id):
    participation = VoteParticipation(
        user_id=user_id,
        election_id=election_id,
        has_voted=True,
    )

    db.add(participation)
    db.flush()  # keep in same transaction

    return participation


# ----------------------------------------
# 🔍 Get all votes for verification
# ----------------------------------------
def get_votes_by_election(db: Session, election_id):
    return (
        db.query(Vote)
        .filter(Vote.election_id == election_id)
        .order_by(Vote.block_index.asc())
        .all()
    )