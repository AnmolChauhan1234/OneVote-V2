from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.schemas.organisation import OrganisationCreate, OrganisationUpdate, OrganisationStatus
from app.repositories.organisation_repo import organisation_repo
import uuid

def mock_upload_to_cloudflare(file: UploadFile) -> str:
    # Placeholder for actual Cloudflare R2 upload logic
    # We generate a fake URL for now
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    return f"https://cdn.cloudflare.example.com/uploads/{unique_filename}"

class OrganisationService:
    def get_organisation(self, db: Session, org_id: int):
        org = organisation_repo.get_by_id(db, org_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organisation not found")
        return org

    def list_organisations(self, db: Session, skip: int = 0, limit: int = 100):
        return organisation_repo.get_all(db, skip=skip, limit=limit)

    def create_organisation(self, db: Session, org_in: OrganisationCreate, file: UploadFile):
        # 1. Create org
        org = organisation_repo.create(db, org_in)
        # 2. Upload file
        file_url = mock_upload_to_cloudflare(file)
        # 3. Save document
        organisation_repo.add_document(db, org.id, file_url)
        return org

    def update_organisation(self, db: Session, org_id: int, org_in: OrganisationUpdate):
        org = self.get_organisation(db, org_id)
        return organisation_repo.update(db, org, org_in)

    def delete_organisation(self, db: Session, org_id: int):
        org = self.get_organisation(db, org_id)
        organisation_repo.delete(db, org)

    # Verification Lifecycle Methods
    def get_documents(self, db: Session, org_id: int):
        self.get_organisation(db, org_id) # Ensure it exists
        return organisation_repo.get_documents(db, org_id)

    def get_pending_organisations(self, db: Session):
        return organisation_repo.get_by_status(db, OrganisationStatus.PENDING_VERIFICATION)

    def approve_organisation(self, db: Session, org_id: int, admin_id: str, remarks: str = None):
        org = self.get_organisation(db, org_id)
        if org.status == OrganisationStatus.VERIFIED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already verified")
        
        return organisation_repo.update_verification_status(
            db=db, 
            org_id=org_id, 
            status=OrganisationStatus.VERIFIED, 
            admin_id=admin_id, 
            action="APPROVED", 
            remarks=remarks
        )

    def reject_organisation(self, db: Session, org_id: int, admin_id: str, reason: str):
        org = self.get_organisation(db, org_id)
        return organisation_repo.update_verification_status(
            db=db, 
            org_id=org_id, 
            status=OrganisationStatus.REJECTED, 
            admin_id=admin_id, 
            action="REJECTED", 
            remarks=reason
        )

    def reupload_document(self, db: Session, org_id: int, file: UploadFile):
        org = self.get_organisation(db, org_id)
        
        # Upload new file
        file_url = mock_upload_to_cloudflare(file)
        organisation_repo.add_document(db, org.id, file_url)
        
        # Reset status to PENDING_VERIFICATION
        org.status = OrganisationStatus.PENDING_VERIFICATION
        db.commit()
        db.refresh(org)
        
        return org

    def check_eligibility(self, db: Session, org_id: int):
        org = self.get_organisation(db, org_id)
        return {
            "orgId": org.id,
            "isVerified": org.status == OrganisationStatus.VERIFIED,
            "eligibleForElection": org.status == OrganisationStatus.VERIFIED
        }

organisation_service = OrganisationService()
