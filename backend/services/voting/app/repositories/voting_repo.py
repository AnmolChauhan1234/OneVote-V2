from sqlalchemy.orm import Session
from app.models.vote import Vote
from app.models.vote_participation import VoteParticipation


class VotingRepository:
    def __init__(self, db: Session):
        self.db = db

    # ----------------------------------------
    # 🗳 Get last vote (for hash chain)
    # ----------------------------------------
    def get_last_vote(self, election_id):
        return (
            self.db.query(Vote)
            .filter(Vote.election_id == election_id)
            .order_by(Vote.block_index.desc())
            .first()
        )

    # ----------------------------------------
    # 🔒 Get last vote WITH LOCK (race condition fix)
    # ----------------------------------------
    def get_last_vote_for_update(self, election_id):
        return (
            self.db.query(Vote)
            .filter(Vote.election_id == election_id)
            .order_by(Vote.block_index.desc())
            .with_for_update()  # 🔥 important
            .first()
        )

    # ----------------------------------------
    # 🗳 Create vote (NO COMMIT HERE)
    # ----------------------------------------
    def create_vote(
        self,
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

        self.db.add(vote)
        self.db.flush()

        return vote

    # ----------------------------------------
    # 🚫 Check participation
    # ----------------------------------------
    def get_participation(self, user_id, election_id):
        return (
            self.db.query(VoteParticipation)
            .filter(
                VoteParticipation.user_id == user_id,
                VoteParticipation.election_id == election_id,
            )
            .first()
        )

    # ----------------------------------------
    # 🧾 Create participation
    # ----------------------------------------
    def create_participation(self, user_id, election_id):
        participation = VoteParticipation(
            user_id=user_id,
            election_id=election_id,
            has_voted=True,
        )

        self.db.add(participation)
        self.db.flush()

        return participation

    # ----------------------------------------
    # 🔍 Get votes for verification
    # ----------------------------------------
    def get_votes_by_election(self, election_id):
        return (
            self.db.query(Vote)
            .filter(Vote.election_id == election_id)
            .order_by(Vote.block_index.asc())
            .all()
        )

    # ----------------------------------------
    # 🔁 TRANSACTION CONTROL
    # ----------------------------------------
    def commit(self):
        self.db.commit()

    def rollback(self):
        self.db.rollback()

    def refresh(self, obj):
        self.db.refresh(obj)