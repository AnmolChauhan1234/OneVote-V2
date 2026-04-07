import os
import secrets
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Response, Request, status, HTTPException, Header

from app.api.deps import (
    get_user_service,
    get_session_service,
    get_otp_service,
    get_user_org_identifier_service,
)
import httpx
from app.services.user_service import UserService
from app.services.session_service import SessionService
from app.services.otp_service import OTPService
from app.services.user_org_identifier_service import UserOrgIdentifierService

from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    OTPVerifyRequest,
    GenerateOTPRequest,
    UserResponse,
    MessageResponse,
)
from app.schemas.user_org_identifier import (
    UserOrgIdentifierCreate,
    UserOrgIdentifierResponse,
)

from app.models.user import User
from shared.core.security import verify_password

# 🔥 UPDATED IMPORTS (shared instead of middleware)
from shared.core.dependencies import get_current_user, validate_csrf
from shared.core.redis import redis_client
from shared.core.config import settings

router = APIRouter()

GLOBAL_ENV = os.getenv("GLOBAL_ENV", "development")
SECURE_COOKIE = GLOBAL_ENV == "production"


ACCESS_TOKEN_AGE = settings.JWT_ACCESS_EXPIRY_MINUTES * 60  # in seconds
REFRESH_TOKEN_AGE = settings.JWT_REFRESH_EXPIRY_MINUTES * 60  # in seconds

ORGANISATION_SERVICE_URL = os.getenv("ORGANISATION_SERVICE_URL", "http://organisation:8000")
INTERNAL_API_KEY = settings.INTERNAL_API_KEY


async def _get_org_ids(user_id: str) -> List[uuid.UUID]:
    """
    Helper to fetch org_ids from organisation service.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ORGANISATION_SERVICE_URL}/api/v1/internal/owners/{user_id}/org",
                headers={"X-INTERNAL-KEY": INTERNAL_API_KEY},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                ids = data.get("org_ids", [])
                return [uuid.UUID(oid) for oid in ids]
    except Exception as e:
        print(f"Error fetching org_ids for user {user_id}: {e}")
    return []


# ---------------- REGISTER ----------------
@router.post(
    "/register", status_code=status.HTTP_201_CREATED, response_model=RegisterResponse
)
def register(
    user_data: RegisterRequest, user_service: UserService = Depends(get_user_service)
):
    try:
        user = user_service.register_user(user_data)
        return RegisterResponse(
            message="User registered successfully. Verification pending.",
            user_id=str(user.id),
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------- LOGIN ----------------
@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    response: Response,
    user_service: UserService = Depends(get_user_service),
    session_service: SessionService = Depends(get_session_service),
):
    user = user_service.get_user_by_email(login_data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="User not verified")

    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Account is suspended")

    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Account is blocked")

    try:
        # Fetch org_ids for any user who might own organizations
        org_ids = await _get_org_ids(str(user.id))

        tokens = session_service.create_session(
            user_id=user.id,
            role=user.role,
            user_type=user.user_type,
            org_ids=org_ids,
            device_id=login_data.device_id
        )

        # 🔥 Access Token Cookie
        response.set_cookie(
            key="access_token",
            value=tokens["access_token"],
            httponly=True,
            secure=SECURE_COOKIE,
            samesite="lax",
            max_age=ACCESS_TOKEN_AGE,
        )

        # 🔥 Refresh Token Cookie
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=SECURE_COOKIE,
            samesite="lax",
            max_age=REFRESH_TOKEN_AGE,
        )

        # 🔥 CSRF Token
        csrf_token = secrets.token_urlsafe(32)

        response.set_cookie(
            key="csrf_token",
            value=csrf_token,
            httponly=False,
            secure=SECURE_COOKIE,
            samesite="lax",
        )

        return {
            "message": "Login successful",
            "user_id": user.id,
            "role": user.role,
            "user_type": user.user_type,
            "org_ids": org_ids
        }

    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred during login. Please try again."
        )


# ---------------- REFRESH ----------------
@router.post(
    "/refresh", response_model=MessageResponse, dependencies=[Depends(validate_csrf)]
)
async def refresh(
    request: Request,
    response: Response,
    user_service: UserService = Depends(get_user_service),
    session_service: SessionService = Depends(get_session_service),
):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        # To refresh, we need the user data to populate the new access token
        # Get user ID from refresh token (it only contains 'sub')
        from shared.core.jwt import decode_token
        payload = decode_token(refresh_token)
        if not payload:
             raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        user_id = payload.get("sub")
        user = user_service.get_user_by_id(uuid.UUID(user_id))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        # Fetch org_ids for any user who might own organizations
        org_ids = await _get_org_ids(str(user.id))

        tokens = session_service.refresh_session(
            old_refresh_token=refresh_token,
            role=user.role,
            user_type=user.user_type,
            org_ids=org_ids
        )

        response.set_cookie(
            key="access_token",
            value=tokens["access_token"],
            httponly=True,
            secure=SECURE_COOKIE,
            samesite="lax",
            max_age=ACCESS_TOKEN_AGE,
        )

        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=SECURE_COOKIE,
            samesite="lax",
            max_age=REFRESH_TOKEN_AGE,
        )

        return {"message": "Token refreshed"}

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# ---------------- LOGOUT ----------------
@router.post(
    "/logout", response_model=MessageResponse, dependencies=[Depends(validate_csrf)]
)
def logout(
    request: Request,
    response: Response,
    current_user=Depends(get_current_user),
    session_service: SessionService = Depends(get_session_service),
):
    access_token = request.cookies.get("access_token")

    # 🔥 Redis blacklist (NEW)
    if access_token:
        redis_client.set(f"blacklist:{access_token}", "1", ex=3600)

    session_service.logout(current_user.get("sub"), access_token)

    # 🔥 Clear cookies
    response.delete_cookie("access_token", secure=SECURE_COOKIE, samesite="lax")
    response.delete_cookie("refresh_token", secure=SECURE_COOKIE, samesite="lax")
    response.delete_cookie("csrf_token", secure=SECURE_COOKIE, samesite="lax")

    return {"message": "Logged out successfully"}


# ---------------- GET CURRENT USER ----------------
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user=Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    user_id = current_user.get("sub")
    user = user_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Map database user to schema and inject data from token for consistency
    # (Or just use database data if we want most up-to-date)
    response_data = UserResponse.model_validate(user)
    
    # Ensure org_ids from token is used
    org_ids = current_user.get("org_ids", [])
    response_data.org_ids = [uuid.UUID(oid) for oid in org_ids]
    
    return response_data


# ---------------- OTP ----------------
@router.post("/generate-otp", response_model=MessageResponse)
def generate_otp(
    request_data: GenerateOTPRequest, otp_service: OTPService = Depends(get_otp_service)
):
    otp = otp_service.generate_otp(request_data.purpose, request_data.email)

    response = {"message": f"OTP generated for {request_data.purpose}"}

    if GLOBAL_ENV == "development":
        response["test_otp"] = otp

    return response


@router.post("/verify-otp", response_model=MessageResponse)
def verify_otp(
    request_data: OTPVerifyRequest,
    user_service: UserService = Depends(get_user_service),
    otp_service: OTPService = Depends(get_otp_service),
):
    identifier = request_data.email or str(request_data.user_id)

    if not identifier:
        raise HTTPException(status_code=400, detail="Email or User ID required")

    if otp_service.verify_otp(request_data.purpose, identifier, request_data.otp):
        return {"message": "OTP verified successfully"}

    raise HTTPException(status_code=400, detail="Invalid or expired OTP")


# ---------------- ORG IDENTIFIERS ----------------
@router.post("/me/org-identifiers", response_model=UserOrgIdentifierResponse)
def add_user_org_identifier(
    data: UserOrgIdentifierCreate,
    current_user=Depends(get_current_user),
    service: UserOrgIdentifierService = Depends(get_user_org_identifier_service),
):
    return service.add_identifier(
        user_id=current_user.get("sub"),
        org_id=data.org_id,
        identifier_value=data.identifier_value,
    )
