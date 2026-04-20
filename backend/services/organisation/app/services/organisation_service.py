from fastapi import HTTPException, status, UploadFile
import uuid

from app.repositories.organisation_repo import OrganisationRepository
from app.schemas.organisation import OrganisationCreate, OrganisationUpdate, OrganisationStatus
import httpx
import os
from shared.core.config import settings

AUTH_SERVICE_INTERNAL_URL = os.getenv("AUTH_SERVICE_INTERNAL_URL", "http://auth:8000")


def mock_upload_to_cloudflare(file: UploadFile) -> str:
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    return f"https://cdn.cloudflare.example.com/uploads/{unique_filename}"


class OrganisationService:
    def __init__(self, repo: OrganisationRepository):
        self.repo = repo

    # ---------------- ORG ----------------

    def get_organisation(self, org_id: uuid.UUID):
        org = self.repo.get_by_id(org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organisation not found")
        return org

    def get_organisation_by_owner(self, owner_id: str):
        return self.repo.get_all_by_owner_id(owner_id)

    def list_organisations(self, skip: int = 0, limit: int = 100):
        return self.repo.get_all(skip, limit)

    def create_organisation(self, org_in: OrganisationCreate, file: UploadFile):
        try:
            org = self.repo.create(org_in)

            file_url = mock_upload_to_cloudflare(file)
            self.repo.add_document(org.id, file_url)

            self.repo.commit()
            self.repo.refresh(org)

            # Update Auth service
            try:
                with httpx.Client() as client:
                    client.post(
                        f"{AUTH_SERVICE_INTERNAL_URL}/api/v1/auth/internal/update-user-type",
                        json={"user_id": org_in.owner_id, "user_type": "org_admin"},
                        headers={"X-INTERNAL-KEY": settings.INTERNAL_API_KEY},
                        timeout=5.0
                    )
            except Exception as e:
                print(f"WARNING: Auth update failed: {e}")

            return org

        except Exception:
            self.repo.rollback()
            raise

    def update_organisation(self, org_id: uuid.UUID, org_in: OrganisationUpdate):
        try:
            org = self.get_organisation(org_id)

            org = self.repo.update(org, org_in)

            self.repo.commit()
            self.repo.refresh(org)

            return org

        except Exception:
            self.repo.rollback()
            raise

    def delete_organisation(self, org_id: uuid.UUID):
        try:
            org = self.get_organisation(org_id)

            self.repo.delete(org)

            self.repo.commit()

        except Exception:
            self.repo.rollback()
            raise

    # ---------------- VERIFICATION ----------------

    def get_documents(self, org_id: uuid.UUID):
        self.get_organisation(org_id)
        return self.repo.get_documents(org_id)

    def get_pending_organisations(self):
        return self.repo.get_by_status(OrganisationStatus.PENDING_VERIFICATION)

    def approve_organisation(self, org_id: uuid.UUID, admin_id: str, remarks: str = None):
        try:
            org = self.get_organisation(org_id)

            if org.status == OrganisationStatus.VERIFIED:
                raise HTTPException(status_code=400, detail="Already verified")

            org = self.repo.update_verification_status(
                org=org,
                status=OrganisationStatus.VERIFIED,
                admin_id=admin_id,
                action="APPROVED",
                remarks=remarks,
            )

            self.repo.commit()
            self.repo.refresh(org)

            return org

        except Exception:
            self.repo.rollback()
            raise

    def reject_organisation(self, org_id: uuid.UUID, admin_id: str, reason: str):
        try:
            org = self.get_organisation(org_id)

            org = self.repo.update_verification_status(
                org=org,
                status=OrganisationStatus.REJECTED,
                admin_id=admin_id,
                action="REJECTED",
                remarks=reason,
            )

            self.repo.commit()
            self.repo.refresh(org)

            return org

        except Exception:
            self.repo.rollback()
            raise

    def reupload_document(self, org_id: uuid.UUID, file: UploadFile):
        try:
            org = self.get_organisation(org_id)

            file_url = mock_upload_to_cloudflare(file)
            self.repo.add_document(org.id, file_url)

            org.status = OrganisationStatus.PENDING_VERIFICATION

            self.repo.commit()
            self.repo.refresh(org)

            return org

        except Exception:
            self.repo.rollback()
            raise

    def check_eligibility(self, org_id: uuid.UUID):
        org = self.get_organisation(org_id)

        return {
            "orgId": org.id,
            "isVerified": org.status == OrganisationStatus.VERIFIED,
            "eligibleForElection": org.status == OrganisationStatus.VERIFIED,
        }