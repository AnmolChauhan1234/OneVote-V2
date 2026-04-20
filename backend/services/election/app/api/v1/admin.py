from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.api.deps import get_election_service
from app.services.election_service import ElectionService
from app.schemas.election import ElectionResponse

from shared.core.dependencies import get_current_user

router = APIRouter(tags=["Admin Elections"])

@router.get("/admin", response_model=List[ElectionResponse])
def get_all_elections_admin(
    skip: int = 0,
    limit: int = 100,
    service: ElectionService = Depends(get_election_service),
    current_user=Depends(get_current_user)
):
    # Security check: Ensure user is an ADMIN or SUPER_ADMIN
    if current_user.get("role") not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Only Admins can access this endpoint")
        
    return service.get_all_elections(skip, limit)
