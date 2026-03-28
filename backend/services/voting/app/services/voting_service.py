from datetime import datetime
from fastapi import HTTPException

from app.services.hash_chain import create_vote_hash, verify_vote_chain
from app.security.anonymization import generate_user_reference
from app.services.biometric_validation import validate_biometric_token


class VotingService:
    def __init__(self, repo, token_repo):
        self.repo = repo
        self.token_repo = token_repo

    # ----------------------------------------
    # 🗳 CAST VOTE
    # ----------------------------------------
    def cast_vote(self, vote_data, user_id):
        try:
            # 🔐 Step 0 — Biometric validation
            validate_biometric_token(
                user_id,
                vote_data.biometric_token
            )

            # 🔒 Step 1 — Lock last vote
            last_vote = self.repo.get_last_vote_for_update(
                vote_data.election_id
            )

            # 🔒 Step 2 — Validate voting token
            token = self.token_repo.validate_token(
                user_id,
                vote_data.election_id
            )

            # 🚫 Step 3 — Prevent double voting
            existing = self.repo.get_participation(
                user_id,
                vote_data.election_id
            )
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="User has already voted"
                )

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
            new_vote = self.repo.create_vote(
                election_id=vote_data.election_id,
                position_id=vote_data.position_id,
                candidate_id=vote_data.candidate_id,
                user_reference_hash=user_reference_hash,
                previous_hash=previous_hash,
                vote_hash=vote_hash,
                block_index=block_index,
            )

            # 🧾 Step 7 — Participation
            self.repo.create_participation(
                user_id,
                vote_data.election_id
            )

            # 🎟 Step 8 — Mark token used
            self.token_repo.mark_token_used(token)

            # ✅ Commit
            self.repo.commit()
            self.repo.refresh(new_vote)

            return new_vote

        except HTTPException:
            self.repo.rollback()
            raise

        except Exception as e:
            self.repo.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    # ----------------------------------------
    # 🔍 VERIFY VOTES
    # ----------------------------------------
    def verify_election_votes(self, election_id):
        votes = self.repo.get_votes_by_election(election_id)

        is_valid, message = verify_vote_chain(votes)

        return {
            "valid": is_valid,
            "message": message,
            "total_votes": len(votes),
        }