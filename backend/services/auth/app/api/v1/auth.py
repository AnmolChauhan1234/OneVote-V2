import os
import secrets
from fastapi import APIRouter, Depends, Response, Request, status, HTTPException
from app.api.deps import get_user_service, get_session_service, get_otp_service
from app.services.user_service import UserService
from app.services.session_service import SessionService
from app.services.otp_service import OTPService
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    OTPVerifyRequest,
    GenerateOTPRequest,
    UserResponse,
    MessageResponse,
    UserUpdate,
)
from app.api.middlewares.auth import get_current_user, validate_csrf
from app.models.user import User
from app.utils.security import verify_password

router = APIRouter()

API_ENV = os.getenv("API_ENV", "development")
SECURE_COOKIE = API_ENV == "production"
ACCESS_TOKEN_AGE = 5 * 60  # 5 minutes
REFRESH_TOKEN_AGE = 20 * 60  # 20 minutes


@router.post(
    "/register", status_code=status.HTTP_201_CREATED, response_model=MessageResponse
)
def register(
    user_data: RegisterRequest, user_service: UserService = Depends(get_user_service)
):
    try:
        user_service.register_user(user_data)
        return {"message": "User registered successfully. Verification pending."}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email or User ID required"
        )

    if otp_service.verify_otp(request_data.purpose, identifier, request_data.otp):
        # OTP is now only for 2FA or future step-up, not for registration verification
        return {"message": "OTP verified successfully"}

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP"
    )


@router.post("/login", response_model=MessageResponse)
def login(
    login_data: LoginRequest,
    response: Response,
    user_service: UserService = Depends(get_user_service),
    session_service: SessionService = Depends(get_session_service),
):
    user = user_service.get_user_by_email(login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not verified"
        )

    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended"
        )
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is blocked"
        )

    try:
        tokens = session_service.create_session(user.id, login_data.device_id)

        # Set Tokens in HTTP-only Cookies
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

        # CSRF Protection: Generate secure random token
        csrf_token = secrets.token_urlsafe(32)
        response.set_cookie(
            key="csrf_token",
            value=csrf_token,
            httponly=False,  # Must be accessible by JS
            secure=SECURE_COOKIE,
            samesite="lax",
        )

        return {"message": "Login successful"}
    except Exception as e:
        # Log the error internally if needed
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An error occurred during login. Please try again."
        )


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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing"
        )

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post(
    "/logout", response_model=MessageResponse, dependencies=[Depends(validate_csrf)]
)
def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    session_service: SessionService = Depends(get_session_service),
):
    access_token = request.cookies.get("access_token")
    session_service.logout(current_user.id, access_token)

    # Clear all cookies
    response.delete_cookie(key="access_token", secure=SECURE_COOKIE, samesite="lax")
    response.delete_cookie(key="refresh_token", secure=SECURE_COOKIE, samesite="lax")
    response.delete_cookie(key="csrf_token", secure=SECURE_COOKIE, samesite="lax")

    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
