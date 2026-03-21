import hashlib
import json


def generate_vote_hash(data: str) -> str:
    return hashlib.sha256(f"VOTE_CHAIN::{data}".encode()).hexdigest()


def build_vote_string(
    election_id: str,
    position_id: str,
    candidate_id: str,
    user_reference_hash: str,
    previous_hash: str,
    timestamp: str,
) -> str:
    return json.dumps(
        {
            "election_id": str(election_id),
            "position_id": str(position_id),
            "candidate_id": str(candidate_id),
            "user_reference_hash": user_reference_hash,
            "previous_hash": previous_hash,
            "timestamp": timestamp,
        },
        sort_keys=True,
        separators=(",", ":"),
    )


def create_vote_hash(
    election_id: str,
    position_id: str,
    candidate_id: str,
    user_reference_hash: str,
    previous_hash: str,
    timestamp: str,
):
    vote_string = build_vote_string(
        election_id,
        position_id,
        candidate_id,
        user_reference_hash,
        previous_hash,
        timestamp,
    )

    return generate_vote_hash(vote_string)


def verify_vote_chain(votes):
    if not votes:
        return True, "No votes found"

    votes = sorted(votes, key=lambda v: v.block_index or 0)

    previous_hash = "GENESIS"
    expected_index = 1

    for vote in votes:
        if vote.block_index != expected_index:
            return False, {
                "error": "INVALID_BLOCK_INDEX",
                "vote_id": str(vote.vote_id),
            }

        if vote.block_index == 1 and vote.previous_hash != "GENESIS":
            return False, {
                "error": "INVALID_GENESIS",
                "vote_id": str(vote.vote_id),
            }

        timestamp = (
            vote.created_at.isoformat()
            if vote.created_at
            else ""
        )

        vote_string = build_vote_string(
            vote.election_id,
            vote.position_id,
            vote.candidate_id,
            vote.user_reference_hash,
            previous_hash,
            timestamp,
        )

        recalculated_hash = generate_vote_hash(vote_string)

        if vote.vote_hash != recalculated_hash:
            return False, {
                "error": "HASH_MISMATCH",
                "vote_id": str(vote.vote_id),
            }

        if vote.previous_hash != previous_hash:
            return False, {
                "error": "CHAIN_BROKEN",
                "vote_id": str(vote.vote_id),
            }

        previous_hash = vote.vote_hash
        expected_index += 1

    return True, "Chain is valid"