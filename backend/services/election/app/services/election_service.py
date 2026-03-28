from fastapi import HTTPException, status, UploadFile
from typing import List
import csv
import io

from app.repositories.election_repo import ElectionRepository
from app.schemas.election import (
    ElectionCreate, ElectionUpdate, ElectionResponse,
    PositionCreate, PositionResponse,
    CandidateCreate, CandidateResponse,
    EligibleVoterCreate, EligibleVoterResponse,
    BulkVoterUploadResponse
)


class ElectionService:
    def __init__(self, repo: ElectionRepository):
        self.repo = repo

    # ---------------- ELECTION ----------------

    def create_election(self, data: ElectionCreate) -> ElectionResponse:
        try:
            if data.end_date <= data.start_date:
                raise HTTPException(status_code=400, detail="End date must be after start date")

            election = self.repo.create_election(data)

            self.repo.commit()
            self.repo.refresh(election)

            return ElectionResponse.model_validate(election)

        except Exception:
            self.repo.rollback()
            raise

    def get_election(self, election_id: str) -> ElectionResponse:
        election = self.repo.get_election(election_id)
        if not election:
            raise HTTPException(status_code=404, detail="Election not found")
        return ElectionResponse.model_validate(election)

    def get_elections(self, skip: int = 0, limit: int = 100) -> List[ElectionResponse]:
        elections = self.repo.get_elections(skip, limit)
        return [ElectionResponse.model_validate(e) for e in elections]

    def update_election(self, election_id: str, data: ElectionUpdate) -> ElectionResponse:
        try:
            election = self.repo.get_election(election_id)
            if not election:
                raise HTTPException(status_code=404, detail="Election not found")

            election = self.repo.update_election(election, data)

            self.repo.commit()
            self.repo.refresh(election)

            return ElectionResponse.model_validate(election)

        except Exception:
            self.repo.rollback()
            raise

    # ---------------- POSITION ----------------

    def create_position(self, election_id: str, data: PositionCreate) -> PositionResponse:
        try:
            self.get_election(election_id)

            position = self.repo.create_position(election_id, data)

            self.repo.commit()
            self.repo.refresh(position)

            return PositionResponse.model_validate(position)

        except Exception:
            self.repo.rollback()
            raise

    def get_positions(self, election_id: str) -> List[PositionResponse]:
        self.get_election(election_id)
        positions = self.repo.get_positions(election_id)
        return [PositionResponse.model_validate(p) for p in positions]

    # ---------------- CANDIDATE ----------------

    def create_candidate(self, position_id: str, data: CandidateCreate) -> CandidateResponse:
        try:
            candidate = self.repo.create_candidate(position_id, data)

            self.repo.commit()
            self.repo.refresh(candidate)

            return CandidateResponse.model_validate(candidate)

        except Exception:
            self.repo.rollback()
            raise

    def get_candidates(self, position_id: str) -> List[CandidateResponse]:
        candidates = self.repo.get_candidates(position_id)
        return [CandidateResponse.model_validate(c) for c in candidates]

    # ---------------- VOTERS ----------------

    async def bulk_add_eligible_voters_from_csv(self, election_id: str, file: UploadFile) -> BulkVoterUploadResponse:
        try:
            self.get_election(election_id)

            if not file.filename.endswith('.csv'):
                raise HTTPException(status_code=400, detail="Only CSV files are accepted")

            content = await file.read()
            decoded = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded))

            if not reader.fieldnames or 'roll_no' not in reader.fieldnames or 'phone' not in reader.fieldnames:
                raise HTTPException(status_code=400, detail="CSV must contain 'roll_no' and 'phone' columns")

            errors = []
            to_add = []
            skipped = 0
            total = 0

            for row_num, row in enumerate(reader, start=2):
                total += 1
                roll_no = row.get('roll_no', '').strip()
                phone = row.get('phone', '').strip()

                if not roll_no:
                    errors.append(f"Row {row_num}: missing roll_no")
                    continue
                if not phone:
                    errors.append(f"Row {row_num}: missing phone for roll_no '{roll_no}'")
                    continue

                existing = self.repo.get_eligible_voter_by_voter_id(election_id, phone)
                if existing:
                    skipped += 1
                    continue

                to_add.append(EligibleVoterCreate(voter_id=phone, roll_no=roll_no))

            added_voters = self.repo.bulk_add_eligible_voters(election_id, to_add)

            self.repo.commit()

            return BulkVoterUploadResponse(
                total_processed=total,
                added=len(added_voters),
                skipped=skipped,
                errors=errors,
                voters=[EligibleVoterResponse.model_validate(v) for v in added_voters]
            )

        except Exception:
            self.repo.rollback()
            raise

    def get_eligible_voters(self, election_id: str) -> List[EligibleVoterResponse]:
        voters = self.repo.get_eligible_voters(election_id)
        return [EligibleVoterResponse.model_validate(v) for v in voters]