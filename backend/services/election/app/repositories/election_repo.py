from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.models.election import Election, ElectionStatus
from app.models.position import Position
from app.models.candidate import Candidate
from app.models.eligible_voter import EligibleVoter

from app.schemas.election import (
    ElectionCreate, ElectionUpdate,
    PositionCreate, PositionUpdate,
    CandidateCreate, CandidateUpdate,
    EligibleVoterCreate
)

class ElectionRepository:
    def __init__(self, db: Session):
        self.db = db

    # Elections
    def create_election(self, data: ElectionCreate) -> Election:
        election = Election(**data.model_dump())
        self.db.add(election)
        self.db.commit()
        self.db.refresh(election)
        return election

    def get_election(self, election_id: str) -> Optional[Election]:
        return self.db.query(Election).filter(Election.id == election_id).first()

    def get_elections(self, skip: int = 0, limit: int = 100) -> List[Election]:
        return self.db.query(Election).offset(skip).limit(limit).all()

    def update_election(self, election_id: str, data: ElectionUpdate) -> Optional[Election]:
        election = self.get_election(election_id)
        if not election:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(election, key, value)
        self.db.commit()
        self.db.refresh(election)
        return election

    # Positions
    def create_position(self, election_id: str, data: PositionCreate) -> Position:
        position = Position(**data.model_dump(), election_id=election_id)
        self.db.add(position)
        self.db.commit()
        self.db.refresh(position)
        return position

    def get_positions(self, election_id: str) -> List[Position]:
        return self.db.query(Position).filter(Position.election_id == election_id).all()

    # Candidates
    def create_candidate(self, position_id: str, data: CandidateCreate) -> Candidate:
        candidate = Candidate(**data.model_dump(), position_id=position_id)
        self.db.add(candidate)
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def get_candidates(self, position_id: str) -> List[Candidate]:
        return self.db.query(Candidate).filter(Candidate.position_id == position_id).all()

    # Eligible Voters
    def add_eligible_voter(self, election_id: str, data: EligibleVoterCreate) -> EligibleVoter:
        voter = EligibleVoter(election_id=election_id, voter_id=data.voter_id, roll_no=data.roll_no)
        self.db.add(voter)
        self.db.commit()
        self.db.refresh(voter)
        return voter

    def bulk_add_eligible_voters(self, election_id: str, voters_data: list[EligibleVoterCreate]) -> list[EligibleVoter]:
        voters = []
        for data in voters_data:
            voter = EligibleVoter(election_id=election_id, voter_id=data.voter_id, roll_no=data.roll_no)
            self.db.add(voter)
            voters.append(voter)
        self.db.commit()
        for voter in voters:
            self.db.refresh(voter)
        return voters

    def get_eligible_voters(self, election_id: str) -> List[EligibleVoter]:
        return self.db.query(EligibleVoter).filter(EligibleVoter.election_id == election_id).all()

    def get_eligible_voter_by_voter_id(self, election_id: str, voter_id: str) -> Optional[EligibleVoter]:
        return self.db.query(EligibleVoter).filter(
            EligibleVoter.election_id == election_id,
            EligibleVoter.voter_id == voter_id
        ).first()
