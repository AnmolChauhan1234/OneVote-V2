from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import pytz
import uuid

from app.models.organisation import Organisation, OrganisationDocument, VerificationLog, OrganisationStatus
from app.schemas.organisation import OrganisationCreate, OrganisationUpdate


class OrganisationRepository:
    def __init__(self, db: Session):
        self.db = db

    # ---------------- ORG ----------------

    def get_by_id(self, org_id: uuid.UUID) -> Optional[Organisation]:
        return self.db.query(Organisation).filter(Organisation.id == org_id).first()

    def get_all_by_owner_id(self, owner_id: str) -> List[Organisation]:
        return self.db.query(Organisation).filter(Organisation.owner_id == owner_id).all()

    def get_all(self, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Organisation]:
        query = self.db.query(Organisation)
        if search is not None and search.strip() != "":
            query = query.filter(Organisation.name.ilike(f"%{search.strip()}%"))
        return query.offset(skip).limit(limit).all()

    def create(self, org_in: OrganisationCreate) -> Organisation:
        org = Organisation(
            name=org_in.name,
            type=org_in.type,
            description=org_in.description,
            owner_id=org_in.owner_id,
            status=OrganisationStatus.PENDING_VERIFICATION,
        )
        self.db.add(org)
        self.db.flush()
        return org

    def update(self, org: Organisation, org_in: OrganisationUpdate) -> Organisation:
        update_data = org_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(org, field, value)

        self.db.flush()
        return org

    def delete(self, org: Organisation):
        self.db.delete(org)
        self.db.flush()

    # ---------------- DOCUMENT ----------------

    def add_document(self, org_id: uuid.UUID, file_url: str) -> OrganisationDocument:
        doc = OrganisationDocument(org_id=org_id, file_url=file_url)
        self.db.add(doc)
        self.db.flush()
        return doc

    def get_documents(self, org_id: uuid.UUID) -> List[OrganisationDocument]:
        return self.db.query(OrganisationDocument).filter(
            OrganisationDocument.org_id == org_id
        ).all()

    # ---------------- VERIFICATION ----------------

    def get_by_status(self, status: OrganisationStatus) -> List[Organisation]:
        return self.db.query(Organisation).filter(Organisation.status == status).all()

    def update_verification_status(
        self,
        org: Organisation,
        status: OrganisationStatus,
        admin_id: str,
        action: str,
        remarks: Optional[str] = None,
    ) -> Organisation:
        org.status = status

        if status == OrganisationStatus.VERIFIED:
            org.verified_at = datetime.now(pytz.utc)

        log = VerificationLog(
            org_id=org.id,
            action=action,
            admin_id=admin_id,
            remarks=remarks,
        )

        self.db.add(log)
        self.db.flush()

        return org

    # ---------------- TRANSACTION ----------------

    def commit(self):
        self.db.commit()

    def rollback(self):
        self.db.rollback()

    def refresh(self, obj):
        self.db.refresh(obj)