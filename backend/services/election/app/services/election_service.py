from fastapi import HTTPException, status, UploadFile
from typing import List
import csv
import io
from datetime import datetime, timedelta

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
        self.repo.update_expired_statuses()
        self.repo.commit()
        election = self.repo.get_election(election_id)
        if not election:
            raise HTTPException(status_code=404, detail="Election not found")
        return ElectionResponse.model_validate(election)

    def get_elections(self, org_ids: List[str], skip: int = 0, limit: int = 100) -> List[ElectionResponse]:
        self.repo.update_expired_statuses()
        self.repo.commit()
        elections = self.repo.get_elections(org_ids, skip, limit)
        return [ElectionResponse.model_validate(e) for e in elections]

    def get_all_elections(self, skip: int = 0, limit: int = 100) -> List[ElectionResponse]:
        self.repo.update_expired_statuses()
        self.repo.commit()
        elections = self.repo.get_all_elections(skip, limit)
        return [ElectionResponse.model_validate(e) for e in elections]

    def update_election(self, election_id: str, data: ElectionUpdate, current_user: dict) -> ElectionResponse:
        try:
            election = self.repo.get_election(election_id)
            if not election:
                raise HTTPException(status_code=404, detail="Election not found")

            status = election.current_status

            is_super_admin = current_user.get("role") == "super_admin"

            # 1. Manual Override Check
            if data.manual_override is not None or data.status is not None:
                if not is_super_admin:
                    raise HTTPException(
                        status_code=403, 
                        detail="Only super admins can manually override election status"
                    )
                if data.manual_override and not data.override_reason:
                    raise HTTPException(
                        status_code=400,
                        detail="Override reason is required for manual overrides"
                    )
                # Log override
                self.repo.create_audit_log({
                    "entity_type": "ELECTION",
                    "entity_id": election_id,
                    "action": "STATUS_OVERRIDE" if data.manual_override else "STATUS_CHANGE",
                    "performed_by": current_user.get("sub"),
                    "previous_values": {"status": election.status, "manual_override": election.manual_override},
                    "new_values": {"status": data.status or election.status, "manual_override": data.manual_override},
                    "reason": data.override_reason or "Manual status update"
                })
                print(f"AUDIT: Election {election_id} status overridden by {current_user.get('sub')}")

            # 2. State-based restrictions
            if status == "COMPLETED" and not is_super_admin:
                raise HTTPException(status_code=400, detail="Completed elections are fully locked")

            if status == "ONGOING":
                allowed_fields = {"end_date", "description"}
                requested_fields = data.model_dump(exclude_unset=True).keys()
                forbidden = requested_fields - allowed_fields
                if forbidden and not is_super_admin:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Only {allowed_fields} can be updated during an ONGOING election"
                    )

            # 2. Business Logic Validation
            if status == "UPCOMING":
                if data.start_date and data.start_date < datetime.now() and not is_super_admin:
                    raise HTTPException(status_code=400, detail="Start date cannot be in the past")

            # 3. Candidate Locking (Safety Mechanism)
            # Candidates are locks if we are within 60 mins of start
            time_to_start = election.start_date - datetime.now()
            if status == "UPCOMING" and time_to_start < timedelta(minutes=60):
                # Check if trying to change critical things
                requested_fields = data.model_dump(exclude_unset=True).keys()
                if ("start_date" in requested_fields) and not is_super_admin:
                     raise HTTPException(
                        status_code=400, 
                        detail="Election is locked for starting soon. Cannot change start time."
                    )

            election = self.repo.update_election(election, data)
            
            # If manual override is happening, set the overridden_by
            if data.manual_override:
                election.overridden_by = current_user.get("sub")

            self.repo.commit()
            self.repo.refresh(election)

            return ElectionResponse.model_validate(election)

        except HTTPException:
            raise
        except Exception as e:
            self.repo.rollback()
            raise HTTPException(status_code=500, detail=str(e))

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
        internal_key = os.getenv("INTERNAL_API_KEY", "internal-secret")

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{voting_url}/api/v1/voting/internal/elections/{election_id}/results",
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

    def create_position(self, election_id: str, data: PositionCreate, current_user: dict) -> PositionResponse:
        try:
            election = self.repo.get_election(election_id)
            if not election:
                raise HTTPException(status_code=404, detail="Election not found")

            status = election.current_status
            is_super_admin = current_user.get("role") == "super_admin"

            if status == "COMPLETED" and not is_super_admin:
                raise HTTPException(status_code=400, detail="Cannot add positions to a completed election")
            
            if status == "ONGOING" and not is_super_admin:
                raise HTTPException(status_code=400, detail="Cannot add positions to an ongoing election")

            time_to_start = election.start_date - datetime.now()
            if status == "UPCOMING" and time_to_start < timedelta(minutes=60) and not is_super_admin:
                raise HTTPException(status_code=400, detail="Election is locked. Cannot add positions 60 mins before start.")

            position = self.repo.create_position(election_id, data)

            self.repo.commit()
            self.repo.refresh(position)

            return PositionResponse.model_validate(position)

        except HTTPException:
            raise
        except Exception:
            self.repo.rollback()
            raise

    def get_positions(self, election_id: str) -> List[PositionResponse]:
        self.get_election(election_id)
        positions = self.repo.get_positions(election_id)
        return [PositionResponse.model_validate(p) for p in positions]

    # ---------------- CANDIDATE ----------------

    def create_candidate(self, position_id: str, data: CandidateCreate, current_user: dict) -> CandidateResponse:
        try:
            # Get election through position
            from app.models.position import Position
            position = self.repo.db.query(Position).filter(Position.id == position_id).first()
            if not position:
                raise HTTPException(status_code=404, detail="Position not found")
            
            election = self.repo.get_election(position.election_id)
            
            status = election.current_status
            is_super_admin = current_user.get("role") == "super_admin"

            if status == "COMPLETED" and not is_super_admin:
                raise HTTPException(status_code=400, detail="Cannot add candidates to a completed election")
            
            if status == "ONGOING" and not is_super_admin:
                raise HTTPException(status_code=400, detail="Cannot add candidates to an ongoing election")

            time_to_start = election.start_date - datetime.now()
            if status == "UPCOMING" and time_to_start < timedelta(minutes=60) and not is_super_admin:
                raise HTTPException(status_code=400, detail="Election is locked. Cannot add candidates 60 mins before start.")

            candidate = self.repo.create_candidate(position_id, data)

            self.repo.commit()
            self.repo.refresh(candidate)

            return CandidateResponse.model_validate(candidate)

        except HTTPException:
            raise
        except Exception:
            self.repo.rollback()
            raise

    def get_candidates(self, position_id: str) -> List[CandidateResponse]:
        candidates = self.repo.get_candidates(position_id)
        return [CandidateResponse.model_validate(c) for c in candidates]

    # ---------------- VOTERS ----------------

    async def bulk_add_eligible_voters_from_csv(
        self, election_id: str, file: UploadFile, identifier_column: str, current_user: dict
    ) -> BulkVoterUploadResponse:
        import os
        import httpx
        try:
            election = self.repo.get_election(election_id)
            if not election:
                raise HTTPException(status_code=404, detail="Election not found")

            status = election.current_status
            is_super_admin = current_user.get("role") == "super_admin"

            if status == "COMPLETED" and not is_super_admin:
                raise HTTPException(status_code=400, detail="Cannot add voters to a completed election")
            
            if status == "ONGOING" and not is_super_admin:
                raise HTTPException(status_code=400, detail="Cannot add voters to an ongoing election")

            time_to_start = election.start_date - datetime.now()
            if status == "UPCOMING" and time_to_start < timedelta(minutes=60) and not is_super_admin:
                raise HTTPException(status_code=400, detail="Election is locked. Cannot add voters 60 mins before start.")

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
            internal_key = os.getenv("INTERNAL_API_KEY", "internal-secret")

            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{auth_url}/api/v1/auth/internal/verify-org-identifiers",
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

    def link_voter_by_identifier(self, org_id: str, identifier_value: str, user_id: str) -> int:
        """Called internally when a voter maps their identity. Updates eligible_voters rows."""
        try:
            updated = self.repo.update_voter_id_by_identifier(org_id, identifier_value, user_id)
            self.repo.commit()
            return updated
        except Exception:
            self.repo.rollback()
            raise

    def get_voter_elections(self, voter_id: str) -> List[ElectionResponse]:
        """Get all elections where this user is an eligible voter."""
        self.repo.update_expired_statuses()
        self.repo.commit()
        elections = self.repo.get_elections_by_voter_id(voter_id)
        return [ElectionResponse.model_validate(e) for e in elections]