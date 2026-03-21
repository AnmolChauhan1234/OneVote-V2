from app.services.hash_chain import create_vote_hash, verify_vote_chain
from app.repositories.voting_repo import (
    get_participation,
    create_participation,
    create_vote,
    get_last_vote_for_update,
    get_votes_by_election,
)
from app.repositories.voting_token_repo import mark_token_used
from app.services.voting_token_service import validate_token
from app.security.anonymization import generate_user_reference
from datetime import datetime


# ----------------------------------------
# 🗳 CAST VOTE (UPDATED WITH JWT USER)
# ----------------------------------------
def cast_vote(db, vote_data, user_id):
    try:
        # 🔒 Step 1 — Lock last vote (PREVENT RACE CONDITION)
        last_vote = get_last_vote_for_update(db, vote_data.election_id)

        # 🔒 Step 2 — Validate token
        token = validate_token(db, user_id, vote_data.election_id)

        # 🚫 Step 3 — Prevent double voting
        existing = get_participation(db, user_id, vote_data.election_id)
        if existing:
            raise Exception("User has already voted")

        # 🔐 Step 4 — Anonymize user
        user_reference_hash = generate_user_reference(
            user_id,
            vote_data.election_id,
        )

        # ⛓ Step 5 — Hash chain
        if last_vote:
            previous_hash = last_vote.vote_hash
            block_index = last_vote.block_index + 1
        else:
            previous_hash = "GENESIS"
            block_index = 1

        timestamp = datetime.utcnow().isoformat()

        vote_hash = create_vote_hash(
            election_id=vote_data.election_id,
            position_id=vote_data.position_id,
            candidate_id=vote_data.candidate_id,
            user_reference_hash=user_reference_hash,
            previous_hash=previous_hash,
            timestamp=timestamp,
        )

        # 🗳 Step 6 — Store vote
        new_vote = create_vote(
            db=db,
            election_id=vote_data.election_id,
            position_id=vote_data.position_id,
            candidate_id=vote_data.candidate_id,
            user_reference_hash=user_reference_hash,
            previous_hash=previous_hash,
            vote_hash=vote_hash,
            block_index=block_index,
        )

        # 🧾 Step 7 — Mark participation
        create_participation(db, user_id, vote_data.election_id)

        # 🎟 Step 8 — Mark token used
        mark_token_used(db, token)

        # ✅ SINGLE COMMIT (RELEASE LOCK)
        db.commit()
        db.refresh(new_vote)

        return new_vote

    except Exception:
        db.rollback()
        raise


# ----------------------------------------
# 🔍 VERIFY VOTES
# ----------------------------------------
def verify_election_votes(db, election_id):
    votes = get_votes_by_election(db, election_id)

    is_valid, message = verify_vote_chain(votes)

    return {
        "valid": is_valid,
        "message": message,
        "total_votes": len(votes),
    }