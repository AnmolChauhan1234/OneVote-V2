from fastapi import APIRouter, Depends
from shared.core.dependencies import validate_internal_key
from app.api.deps import get_voting_service
from app.services.voting_service import VotingService

router = APIRouter(dependencies=[Depends(validate_internal_key)])

@router.get("/health")
def internal_health_check():
    return {"status": "ok", "service": "voting"}

@router.get("/elections/{election_id}/results")
def internal_election_results(
    election_id: str,
    service: VotingService = Depends(get_voting_service)
):
    return service.get_election_results_data(election_id)
