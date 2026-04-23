from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.election import Election
from app.models.position import Position
from app.models.candidate import Candidate
from app.models.eligible_voter import EligibleVoter

from app.schemas.election import (
    ElectionCreate, ElectionUpdate,
    PositionCreate,
    CandidateCreate,
    EligibleVoterCreate
)


class ElectionRepository:
    def __init__(self, db: Session):
        self.db = db

    # ---------------- ELECTION ----------------

    def create_election(self, data: ElectionCreate) -> Election:
        election = Election(**data.model_dump())
        self.db.add(election)
        self.db.flush()
        return election

    def get_election(self, election_id: str) -> Optional[Election]:
        return self.db.query(Election).filter(Election.id == election_id).first()

    def get_elections(self, org_ids: List[str], skip: int = 0, limit: int = 100) -> List[Election]:
        return self.db.query(Election)\
            .filter(Election.org_id.in_(org_ids))\
            .offset(skip).limit(limit).all()

    def get_all_elections(self, skip: int = 0, limit: int = 100) -> List[Election]:
        return self.db.query(Election).offset(skip).limit(limit).all()

    def update_election(self, election: Election, data: ElectionUpdate) -> Election:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(election, key, value)

        self.db.flush()
        return election

    # ---------------- POSITION ----------------

    def create_position(self, election_id: str, data: PositionCreate) -> Position:
        position = Position(**data.model_dump(), election_id=election_id)
        self.db.add(position)
        self.db.flush()
        return position

    def get_positions(self, election_id: str) -> List[Position]:
        return self.db.query(Position).filter(Position.election_id == election_id).all()

    # ---------------- CANDIDATE ----------------

    def create_candidate(self, position_id: str, data: CandidateCreate) -> Candidate:
        candidate = Candidate(**data.model_dump(), position_id=position_id)
        self.db.add(candidate)
        self.db.flush()
        return candidate

    def get_candidates(self, position_id: str) -> List[Candidate]:
        return self.db.query(Candidate).filter(Candidate.position_id == position_id).all()

    # ---------------- VOTERS ----------------

    def bulk_add_eligible_voters(self, election_id: str, voters_data: list[EligibleVoterCreate]) -> list[EligibleVoter]:
        voters = []
        for data in voters_data:
            voter = EligibleVoter(
                election_id=election_id,
                voter_id=data.voter_id,
                unique_identifier=data.unique_identifier
            )
            self.db.add(voter)
            voters.append(voter)

        self.db.flush()
        return voters

    def get_eligible_voters(self, election_id: str) -> List[EligibleVoter]:
        return self.db.query(EligibleVoter).filter(EligibleVoter.election_id == election_id).all()

    def get_eligible_voter_by_voter_id(self, election_id: str, voter_id: str) -> Optional[EligibleVoter]:
        return self.db.query(EligibleVoter).filter(
            EligibleVoter.election_id == election_id,
            EligibleVoter.voter_id == voter_id
        ).first()

    def update_voter_id_by_identifier(self, org_id: str, identifier_value: str, user_id: str) -> int:
        """Update voter_id on all eligible_voter rows matching org_id + identifier."""
        from sqlalchemy import update
        # Get election IDs belonging to this org
        election_ids = [
            e.id for e in self.db.query(Election).filter(Election.org_id == org_id).all()
        ]
        if not election_ids:
            return 0

        result = self.db.query(EligibleVoter).filter(
            EligibleVoter.election_id.in_(election_ids),
            EligibleVoter.unique_identifier == identifier_value,
        ).update({"voter_id": user_id}, synchronize_session="fetch")

        self.db.flush()
        return result

    def get_elections_by_voter_id(self, voter_id: str) -> List[Election]:
        """Get all elections where this user is an eligible voter."""
        election_ids = self.db.query(EligibleVoter.election_id).filter(
            EligibleVoter.voter_id == voter_id
        ).distinct().all()

        if not election_ids:
            return []

        ids = [eid[0] for eid in election_ids]
        return self.db.query(Election).filter(Election.id.in_(ids)).all()

    def update_expired_statuses(self):
        """Automatically transition statuses based on current time."""
        from app.models.election import ElectionStatus
        from datetime import datetime
        now = datetime.now()

        # 1. UPCOMING -> ONGOING
        self.db.query(Election).filter(
            Election._status == ElectionStatus.UPCOMING,
            Election.start_date <= now,
            Election.manual_override == False
        ).update({"_status": ElectionStatus.ONGOING}, synchronize_session=False)

        # 2. ONGOING -> COMPLETED
        self.db.query(Election).filter(
            Election._status == ElectionStatus.ONGOING,
            Election.end_date <= now,
            Election.manual_override == False
        ).update({"_status": ElectionStatus.COMPLETED}, synchronize_session=False)

        # 3. UPCOMING -> COMPLETED (Edge case if election is very short and both passed)
        self.db.query(Election).filter(
            Election._status == ElectionStatus.UPCOMING,
            Election.end_date <= now,
            Election.manual_override == False
        ).update({"_status": ElectionStatus.COMPLETED}, synchronize_session=False)

        self.db.flush()

    # ---------------- TRANSACTION ----------------

    def commit(self):
        self.db.commit()

    def rollback(self):
        self.db.rollback()

    def refresh(self, obj):
        self.db.refresh(obj)

    # ---------------- AUDIT ----------------

    def create_audit_log(self, data: dict):
        from app.models.audit_log import AuditLog
        log = AuditLog(**data)
        self.db.add(log)
        self.db.flush()
        return log