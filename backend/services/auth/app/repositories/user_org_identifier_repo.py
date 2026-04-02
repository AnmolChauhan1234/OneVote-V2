from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.models.user_org_identifier import UserOrgIdentifier

class UserOrgIdentifierRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: uuid.UUID) -> List[UserOrgIdentifier]:
        return self.db.query(UserOrgIdentifier).filter(UserOrgIdentifier.user_id == user_id).all()

    def get_by_org_and_identifier(self, org_id: uuid.UUID, identifier_value: str) -> Optional[UserOrgIdentifier]:
        return self.db.query(UserOrgIdentifier).filter(
            UserOrgIdentifier.org_id == org_id,
            UserOrgIdentifier.identifier_value == identifier_value
        ).first()

    def get_by_org_and_identifiers(self, org_id: uuid.UUID, identifier_values: List[str]) -> List[UserOrgIdentifier]:
        return self.db.query(UserOrgIdentifier).filter(
            UserOrgIdentifier.org_id == org_id,
            UserOrgIdentifier.identifier_value.in_(identifier_values)
        ).all()

    def create(self, user_id: uuid.UUID, org_id: uuid.UUID, identifier_value: str) -> UserOrgIdentifier:
        obj = UserOrgIdentifier(
            user_id=user_id,
            org_id=org_id,
            identifier_value=identifier_value
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: UserOrgIdentifier):
        self.db.delete(obj)
        self.db.commit()
