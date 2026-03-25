from sqlalchemy.orm import Session
from app.models.organisation import Organisation, OrganisationDocument, VerificationLog, OrganisationStatus
from app.schemas.organisation import OrganisationCreate, OrganisationUpdate
from typing import List, Optional
from datetime import datetime
import pytz

class OrganisationRepository:
    def get_by_id(self, db: Session, org_id: int) -> Optional[Organisation]:
        return db.query(Organisation).filter(Organisation.id == org_id).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Organisation]:
        return db.query(Organisation).offset(skip).limit(limit).all()

    def create(self, db: Session, org_in: OrganisationCreate) -> Organisation:
        db_org = Organisation(
            name=org_in.name,
            type=org_in.type,
            description=org_in.description,
            owner_id=org_in.owner_id,
            status=OrganisationStatus.PENDING_VERIFICATION
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

    def add_document(self, db: Session, org_id: int, file_url: str) -> OrganisationDocument:
        doc = OrganisationDocument(org_id=org_id, file_url=file_url)
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc
        
    def get_documents(self, db: Session, org_id: int) -> List[OrganisationDocument]:
        return db.query(OrganisationDocument).filter(OrganisationDocument.org_id == org_id).all()

    def get_by_status(self, db: Session, status: OrganisationStatus) -> List[Organisation]:
        return db.query(Organisation).filter(Organisation.status == status).all()

    def update_verification_status(self, db: Session, org_id: int, status: OrganisationStatus, admin_id: str, action: str, remarks: Optional[str] = None) -> Organisation:
        org = self.get_by_id(db, org_id)
        if not org:
            return None
        
        org.status = status
        if status == OrganisationStatus.VERIFIED:
            org.verified_at = datetime.now(pytz.utc)
            
        log = VerificationLog(
            org_id=org_id,
            action=action,
            admin_id=admin_id,
            remarks=remarks
        )
        db.add(log)
        db.commit()
        db.refresh(org)
        return org

organisation_repo = OrganisationRepository()
