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

    async def get_election_results(self, election_id: str) -> dict:
        import json
        import os
        import httpx
        from shared.core.redis import redis_client
        from app.models.election import ElectionStatus

        cache_key = f"results:{election_id}"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)

        election = self.get_election(election_id)
        if election.status != ElectionStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail="Results are only available after the election is completed"
            )

        positions = self.get_positions(election_id)
        candidates = []
        for pos in positions:
            candidates.extend(self.get_candidates(pos.id))

        voting_url = os.getenv("VOTING_SERVICE_URL", "http://voting:8000")
        internal_key = os.getenv("INTERNAL_API_KEY", "supersecret")

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{voting_url}/api/v1/internal/elections/{election_id}/results",
                    headers={"X-INTERNAL-KEY": internal_key},
                    timeout=5.0
                )
                if resp.status_code != 200:
                    raise HTTPException(status_code=503, detail="Voting service unavailable")
                vote_data = resp.json()
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Failed to communicate with Voting service")

        vote_map = {(item["position_id"], item["candidate_id"]): item["vote_count"] for item in vote_data}

        result_positions = []
        for p in positions:
            pos_cands = [c for c in candidates if c.position_id == p.id]
            cand_results = []
            max_votes = -1

            for c in pos_cands:
                vc = vote_map.get((p.id, c.id), 0)
                cand_results.append({
                    "candidate_id": c.id,
                    "name": c.name,
                    "vote_count": vc,
                    "is_winner": False
                })
                if vc > max_votes:
                    max_votes = vc

            if max_votes > 0:
                for cr in cand_results:
                    if cr["vote_count"] == max_votes:
                        cr["is_winner"] = True

            result_positions.append({
                "position_id": p.id,
                "name": p.name,
                "candidates": cand_results
            })

        final_result = {
            "election_id": election.id,
            "title": election.title,
            "status": election.status,
            "positions": result_positions
        }

        redis_client.setex(cache_key, 86400 * 30, json.dumps(final_result))  # 30 days
        return final_result

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