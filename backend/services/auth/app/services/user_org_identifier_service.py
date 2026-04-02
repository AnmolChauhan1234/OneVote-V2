from fastapi import HTTPException, status
from typing import List, Optional
import uuid
from app.repositories.user_org_identifier_repo import UserOrgIdentifierRepository
from app.schemas.user_org_identifier import UserOrgIdentifierCreate, InternalVoterVerificationResponse

class UserOrgIdentifierService:
    def __init__(self, repo: UserOrgIdentifierRepository):
        self.repo = repo

    def add_identifier(self, user_id: uuid.UUID, org_id: uuid.UUID, identifier_value: str):
        existing = self.repo.get_by_org_and_identifier(org_id, identifier_value)
        if existing:
            if str(existing.user_id) == str(user_id):
                 return existing
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This identifier is already linked to another account."
            )
        
        return self.repo.create(user_id, org_id, identifier_value)

    def get_user_identifiers(self, user_id: uuid.UUID):
        return self.repo.get_by_user_id(user_id)

    def verify_identifiers(self, org_id: uuid.UUID, identifiers: List[str]) -> InternalVoterVerificationResponse:
        found_records = self.repo.get_by_org_and_identifiers(org_id, identifiers)
        
        found_map = {r.identifier_value: r.user_id for r in found_records}
        
        found_list = []
        not_found_list = []
        
        for identifier in identifiers:
            if identifier in found_map:
                found_list.append({"identifier": identifier, "user_id": found_map[identifier]})
            else:
                not_found_list.append(identifier)
        
        return InternalVoterVerificationResponse(
            found=found_list,
            not_found=not_found_list
        )
