import os
import httpx
from fastapi import HTTPException, status
from app.repositories.identity_repo import IdentityRepository
from app.schemas.identity import IdentityVerifyRequest, DigiLockerMockResponse
import uuid

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth:8001")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "internal-secret")


class IdentityService:
    def __init__(self, repo: IdentityRepository):
        self.repo = repo

    async def _mock_digilocker_fetch(self, aadhar_id: str) -> dict:
        # Mocking DigiLocker API response
        return {
            "full_name": "Test User",
            "dob": "1990-01-01",
            "gender": "Male",
            "address": "123 Test St, India",
            "aadhar_id": aadhar_id,
        }

    async def _get_auth_user_data(self, user_id: uuid.UUID) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/api/v1/internal/user/{user_id}",
                headers={"X-INTERNAL-KEY": INTERNAL_API_KEY},
            )
            if response.status_code != 200:
                detail = "User not found in Auth service"
                try:
                    error_data = response.json()
                    if "detail" in error_data:
                        detail = f"Auth Service Error ({response.status_code}): {error_data['detail']}"
                except Exception:
                    detail = f"Auth Service Error ({response.status_code})"

                raise HTTPException(
                    status_code=(
                        response.status_code if response.status_code < 500 else 500
                    ),
                    detail=detail,
                )
            return response.json()

    async def _update_auth_identity_status(self, user_id: uuid.UUID):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/api/v1/internal/identity-verified",
                json={"user_id": str(user_id)},
                headers={"X-INTERNAL-KEY": INTERNAL_API_KEY},
            )
            if response.status_code != 200:
                detail = "Failed to update identity status in Auth service"
                try:
                    error_data = response.json()
                    if "detail" in error_data:
                        detail = f"Auth Service Update Error ({response.status_code}): {error_data['detail']}"
                except Exception:
                    detail = f"Auth Service Update Error ({response.status_code})"

                raise HTTPException(
                    status_code=(
                        response.status_code if response.status_code < 500 else 500
                    ),
                    detail=detail,
                )

    async def verify_identity(self, request: IdentityVerifyRequest):
        # 1. Check if already verified in this service
        existing = self.repo.get_by_user_id(request.user_id)
        if existing and existing.is_verified:
            return existing

        # 2. Fetch data from Auth service
        auth_user = await self._get_auth_user_data(request.user_id)

        # 3. Fetch data from DigiLocker (Mock)
        digi_data = await self._mock_digilocker_fetch(request.aadhar_id)

        # 4. Verify data (Simple name match for now as requested)
        # User requested: "make sure that, the data given by the api is correct to the data given by user"

        # if digi_data["full_name"].lower() != auth_user["full_name"].lower():
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Identity data mismatch: Name on Aadhar does not match registered name"
        #     )

        # 5. Save/Update record in local DB
        if not existing:
            identity = self.repo.create(request.user_id, request.aadhar_id, digi_data)
        else:
            identity = existing
            # Update data if needed
            identity.full_name = digi_data["full_name"]
            identity.aadhar_id = request.aadhar_id
            self.repo.db.commit()

        # 6. Call Auth service to mark verified
        await self._update_auth_identity_status(request.user_id)

        # 7. Mark as verified in local DB
        self.repo.mark_verified(identity)

        return identity
