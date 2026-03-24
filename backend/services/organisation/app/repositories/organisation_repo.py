from sqlalchemy.orm import Session
from app.models.organisation import Organisation
from app.schemas.organisation import OrganisationCreate, OrganisationUpdate
from typing import List, Optional

class OrganisationRepository:
    def get_by_id(self, db: Session, org_id: int) -> Optional[Organisation]:
        return db.query(Organisation).filter(Organisation.id == org_id).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Organisation]:
        return db.query(Organisation).offset(skip).limit(limit).all()

    def create(self, db: Session, org_in: OrganisationCreate) -> Organisation:
        db_org = Organisation(
            name=org_in.name,
            description=org_in.description
        )
        db.add(db_org)
        db.commit()
        db.refresh(db_org)
        return db_org

    def update(self, db: Session, db_org: Organisation, org_in: OrganisationUpdate) -> Organisation:
        update_data = org_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_org, field, value)
        
        db.commit()
        db.refresh(db_org)
        return db_org

    def delete(self, db: Session, db_org: Organisation) -> None:
        db.delete(db_org)
        db.commit()

organisation_repo = OrganisationRepository()
