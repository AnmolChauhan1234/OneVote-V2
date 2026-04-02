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

    async def bulk_add_eligible_voters_from_csv(
        self, election_id: str, file: UploadFile, identifier_column: str
    ) -> BulkVoterUploadResponse:
        import os
        import httpx
        try:
            election = self.repo.get_election(election_id)
            if not election:
                raise HTTPException(status_code=404, detail="Election not found")

            if not file.filename.endswith('.csv'):
                raise HTTPException(status_code=400, detail="Only CSV files are accepted")

            content = await file.read()
            decoded = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded))

            if not reader.fieldnames or identifier_column not in reader.fieldnames:
                raise HTTPException(
                    status_code=400,
                    detail=f"CSV must contain the '{identifier_column}' column"
                )

            identifiers = []
            rows = []
            for row in reader:
                val = row.get(identifier_column, '').strip()
                if val:
                    identifiers.append(val)
                    rows.append(val)

            if not identifiers:
                return BulkVoterUploadResponse(
                    total_processed=0, added=0, skipped=0, errors=["No identifiers found"]
                )

            # Call Auth Service for verification
            auth_url = os.getenv("AUTH_SERVICE_URL", "http://auth:8000")
            internal_key = os.getenv("INTERNAL_API_KEY", "supersecret")

            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{auth_url}/api/v1/internal/auth/verify-org-identifiers",
                    json={"org_id": str(election.org_id), "identifiers": list(set(identifiers))},
                    headers={"X-INTERNAL-KEY": internal_key},
                    timeout=10.0
                )
                if resp.status_code != 200:
                    raise HTTPException(
                        status_code=503,
                        detail=f"Auth service verification failed: {resp.text}"
                    )
                auth_data = resp.json()

            # Map results
            found_map = {item["identifier"]: item["user_id"] for item in auth_data["found"]}
            
            to_add = []
            for identifier in rows:
                user_id = found_map.get(identifier)
                to_add.append(EligibleVoterCreate(
                    voter_id=str(user_id) if user_id else None,
                    unique_identifier=identifier
                ))

            added_voters = self.repo.bulk_add_eligible_voters(election_id, to_add)

            self.repo.commit()

            return BulkVoterUploadResponse(
                total_processed=len(rows),
                added=len(added_voters),
                skipped=0,
                errors=[],
                voters=[EligibleVoterResponse.model_validate(v) for v in added_voters]
            )

        except Exception:
            self.repo.rollback()
            raise

    def get_eligible_voters(self, election_id: str) -> List[EligibleVoterResponse]:
        voters = self.repo.get_eligible_voters(election_id)
        return [EligibleVoterResponse.model_validate(v) for v in voters]