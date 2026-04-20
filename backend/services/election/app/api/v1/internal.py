from fastapi import APIRouter, Depends
from pydantic import BaseModel
from shared.core.dependencies import validate_internal_key
from app.api.deps import get_election_service
from app.services.election_service import ElectionService

router = APIRouter(dependencies=[Depends(validate_internal_key)])


class LinkVoterRequest(BaseModel):
    org_id: str
    identifier_value: str
    user_id: str


@router.get("/health")
def internal_health_check():
    return {"status": "ok", "service": "election"}


@router.post("/link-voter")
def link_voter(
    data: LinkVoterRequest,
    service: ElectionService = Depends(get_election_service),
):
    """Called by auth service when a voter maps their org identifier.
    Updates eligible_voters rows so voter_id is set."""
    updated = service.link_voter_by_identifier(data.org_id, data.identifier_value, data.user_id)
    return {"message": f"Linked voter to {updated} election(s)", "updated_count": updated}
