from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from typing import List

from app.api.deps import get_election_service
from app.services.election_service import ElectionService
from app.schemas.election import (
    ElectionCreate, ElectionUpdate, ElectionResponse,
    PositionCreate, PositionResponse,
    CandidateCreate, CandidateResponse,
    EligibleVoterResponse, BulkVoterUploadResponse,
    ElectionResultResponse
)

from shared.core.dependencies import get_current_user

router = APIRouter(tags=["Elections"])


# ----------------------------------------
# 🗳 ELECTIONS
# ----------------------------------------

@router.post("/", response_model=ElectionResponse, status_code=status.HTTP_201_CREATED)
def create_election(
    data: ElectionCreate,
    service: ElectionService = Depends(get_election_service),
):
    return service.create_election(data)


@router.get("/", response_model=List[ElectionResponse])
def get_elections(
    skip: int = 0,
    limit: int = 100,
    service: ElectionService = Depends(get_election_service),
    current_user=Depends(get_current_user)
):
    org_ids = current_user.get("org_ids", [])
    return service.get_elections(org_ids, skip, limit)


@router.get("/my-elections", response_model=List[ElectionResponse])
def get_my_elections(
    service: ElectionService = Depends(get_election_service),
    current_user=Depends(get_current_user)
):
    """Get elections where the current user is an eligible voter."""
    voter_id = current_user.get("sub")
    return service.get_voter_elections(voter_id)


@router.get("/{election_id}", response_model=ElectionResponse)
def get_election(
    election_id: str,
    service: ElectionService = Depends(get_election_service),
):
    return service.get_election(election_id)


@router.patch("/{election_id}", response_model=ElectionResponse)
def update_election(
    election_id: str,
    data: ElectionUpdate,
    service: ElectionService = Depends(get_election_service),
):
    return service.update_election(election_id, data)


@router.get("/{election_id}/results", response_model=ElectionResultResponse)
async def get_results(
    election_id: str,
    service: ElectionService = Depends(get_election_service),
    current_user=Depends(get_current_user)
):
    return await service.get_election_results(election_id)


# ----------------------------------------
# 📍 POSITIONS
# ----------------------------------------

@router.post("/{election_id}/positions", response_model=PositionResponse, status_code=status.HTTP_201_CREATED)
def create_position(
    election_id: str,
    data: PositionCreate,
    service: ElectionService = Depends(get_election_service),
):
    return service.create_position(election_id, data)


@router.get("/{election_id}/positions", response_model=List[PositionResponse])
def get_positions(
    election_id: str,
    service: ElectionService = Depends(get_election_service),
):
    return service.get_positions(election_id)


# ----------------------------------------
# 🧑‍💼 CANDIDATES
# ----------------------------------------

@router.post("/positions/{position_id}/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(
    position_id: str,
    data: CandidateCreate,
    service: ElectionService = Depends(get_election_service),
):
    return service.create_candidate(position_id, data)


@router.get("/positions/{position_id}/candidates", response_model=List[CandidateResponse])
def get_candidates(
    position_id: str,
    service: ElectionService = Depends(get_election_service),
):
    return service.get_candidates(position_id)


# ----------------------------------------
# 👥 ELIGIBLE VOTERS
# ----------------------------------------

@router.post(
    "/{election_id}/voters",
    response_model=BulkVoterUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_eligible_voters(
    election_id: str,
    file: UploadFile = File(...),
    identifier_column: str = Form(...),
    service: ElectionService = Depends(get_election_service),
):
    return await service.bulk_add_eligible_voters_from_csv(election_id, file, identifier_column)


@router.get("/{election_id}/voters", response_model=List[EligibleVoterResponse])
def get_eligible_voters(
    election_id: str,
    service: ElectionService = Depends(get_election_service),
):
    return service.get_eligible_voters(election_id)