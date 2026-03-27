import os
import secrets
from fastapi import APIRouter, Depends, Response, Request, status, HTTPException, Header

from app.api.deps import get_user_service, get_session_service, get_otp_service
from app.services.user_service import UserService
from app.services.session_service import SessionService
from app.services.otp_service import OTPService

from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    OTPVerifyRequest,
    GenerateOTPRequest,
    UserResponse,
    MessageResponse,
)

from app.models.user import User
from shared.core.security import verify_password

# 🔥 UPDATED IMPORTS (shared instead of middleware)
from shared.core.dependencies import get_current_user, validate_csrf
from shared.core.redis import redis_client
from shared.core.config import settings

router = APIRouter()

API_ENV = os.getenv("API_ENV", "development")
SECURE_COOKIE = API_ENV == "production"


ACCESS_TOKEN_AGE = settings.JWT_ACCESS_EXPIRY_MINUTES * 60  # in seconds
REFRESH_TOKEN_AGE = settings.JWT_REFRESH_EXPIRY_MINUTES * 60  # in seconds


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
@router.post("/login", response_model=MessageResponse)
def login(
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
        tokens = session_service.create_session(user.id, login_data.device_id)

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

        return {"message": "Login successful"}

    except Exception:
        raise HTTPException(
            status_code=500, detail="An error occurred during login. Please try again."
        )


# ---------------- REFRESH ----------------
@router.post(
    "/refresh", response_model=MessageResponse, dependencies=[Depends(validate_csrf)]
)
def refresh(
    request: Request,
    response: Response,
    session_service: SessionService = Depends(get_session_service),
):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        tokens = session_service.refresh_session(refresh_token)

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

    session_service.logout(current_user["user_id"], access_token)

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
    user = user_service.get_user_by_id(current_user["user_id"])
    return user


# ---------------- OTP ----------------
@router.post("/generate-otp", response_model=MessageResponse)
def generate_otp(
    request_data: GenerateOTPRequest, otp_service: OTPService = Depends(get_otp_service)
):
    otp = otp_service.generate_otp(request_data.purpose, request_data.email)

    response = {"message": f"OTP generated for {request_data.purpose}"}

    if API_ENV == "development":
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
