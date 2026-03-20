from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session as DBSession
from app.schemas.auth import UserCreate, UserLogin, UserResponse, OTPRequest, OTPVerify
from app.services.auth_service import auth_service
from app.db.session import get_db
import os

router = APIRouter()

@router.get("/health")
def health():
    return {"message": "Auth Service running..."}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: DBSession = Depends(get_db)):
    return auth_service.register_user(db, user_in)

@router.post("/login")
def login(user_in: UserLogin, response: Response, db: DBSession = Depends(get_db)):
    auth_data = auth_service.authenticate_user(db, user_in)
    
    is_development = os.getenv("DEV_ENV", "production").lower() == "development"
    
    # Set HTTP-only Cookie
    response.set_cookie(
        key="access_token",
        value=auth_data["access_token"],
        httponly=True,
        secure=not is_development, # False for local HTTP, True for PROD HTTPS
        samesite="lax",
        max_age=3600 # 1 hour validity for demonstration
    )
    
    # Notice we return the authenticated user's ID and Email, not the token itself
    return {"message": "Login successful", "user": {"id": str(auth_data["user"].id) if auth_data["user"] else None}}

@router.post("/otp/send")
def request_otp(otp_req: OTPRequest, db: DBSession = Depends(get_db)):
    return auth_service.request_otp(db, otp_req)

@router.post("/otp/verify")
def verify_otp(otp_ver: OTPVerify, response: Response, db: DBSession = Depends(get_db)):
    auth_data = auth_service.verify_otp(db, otp_ver)
    
    is_development = os.getenv("DEV_ENV", "production").lower() == "development"
    
    # Set HTTP-only Cookie for seamless OTP login
    response.set_cookie(
        key="access_token",
        value=auth_data["access_token"],
        httponly=True,
        secure=not is_development,
        samesite="lax",
        max_age=3600
    )
    
    return {"message": "OTP verified and logged in", "user": {"id": str(auth_data["user"].id) if auth_data["user"] else None}}

@router.post("/logout")
def logout(response: Response):
    is_development = os.getenv("DEV_ENV", "production").lower() == "development"
    response.delete_cookie(key="access_token", httponly=True, secure=not is_development, samesite="lax")
    return {"message": "Logged out successfully"}
