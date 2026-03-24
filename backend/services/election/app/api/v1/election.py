from fastapi import APIRouter, Depends, Query, UploadFile, File, status
from typing import List
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.election_repo import ElectionRepository
from app.services.election_service import ElectionService
from app.schemas.election import (
    ElectionCreate, ElectionUpdate, ElectionResponse,
    PositionCreate, PositionResponse,
    CandidateCreate, CandidateResponse,
    EligibleVoterResponse, BulkVoterUploadResponse
)

router = APIRouter(prefix="/elections", tags=["Elections"])

def get_election_service(db: Session = Depends(get_db)) -> ElectionService:
    repo = ElectionRepository(db)
    return ElectionService(repo)

@router.post("/", response_model=ElectionResponse, status_code=status.HTTP_201_CREATED)
def create_election(data: ElectionCreate, service: ElectionService = Depends(get_election_service)):
    return service.create_election(data)

@router.get("/", response_model=List[ElectionResponse])
def get_elections(skip: int = 0, limit: int = 100, service: ElectionService = Depends(get_election_service)):
    return service.get_elections(skip, limit)

@router.get("/{election_id}", response_model=ElectionResponse)
def get_election(election_id: str, service: ElectionService = Depends(get_election_service)):
    return service.get_election(election_id)

@router.patch("/{election_id}", response_model=ElectionResponse)
def update_election(election_id: str, data: ElectionUpdate, service: ElectionService = Depends(get_election_service)):
    return service.update_election(election_id, data)

@router.post("/{election_id}/positions", response_model=PositionResponse, status_code=status.HTTP_201_CREATED)
def create_position(election_id: str, data: PositionCreate, service: ElectionService = Depends(get_election_service)):
    return service.create_position(election_id, data)

@router.get("/{election_id}/positions", response_model=List[PositionResponse])
def get_positions(election_id: str, service: ElectionService = Depends(get_election_service)):
    return service.get_positions(election_id)

@router.post("/positions/{position_id}/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(position_id: str, data: CandidateCreate, service: ElectionService = Depends(get_election_service)):
    return service.create_candidate(position_id, data)

@router.get("/positions/{position_id}/candidates", response_model=List[CandidateResponse])
def get_candidates(position_id: str, service: ElectionService = Depends(get_election_service)):
    return service.get_candidates(position_id)

@router.post("/{election_id}/voters", response_model=BulkVoterUploadResponse, status_code=status.HTTP_201_CREATED, summary="Upload Eligible Voters via CSV")
async def add_eligible_voters(election_id: str, file: UploadFile = File(...), service: ElectionService = Depends(get_election_service)):
    """Upload a CSV file with 'roll_no' and 'phone' columns to bulk-add eligible voters."""
    return await service.bulk_add_eligible_voters_from_csv(election_id, file)

@router.get("/{election_id}/voters", response_model=List[EligibleVoterResponse])
def get_eligible_voters(election_id: str, service: ElectionService = Depends(get_election_service)):
    return service.get_eligible_voters(election_id)
