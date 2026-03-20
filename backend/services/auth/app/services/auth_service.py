from sqlalchemy.orm import Session as DBSession
from fastapi import HTTPException, status
from app.schemas.auth import UserCreate, UserLogin, UserResponse, OTPRequest, OTPVerify
from app.repositories.user_repo import user_repo
from app.repositories.otp_repo import otp_repo
# from shared.utils.hashing import verify_password
# from shared.core.jwt import create_access_token
# from shared.utils.otp import generate_otp
from datetime import datetime, timedelta, timezone

# Mocks until shared utils are provided by Senior
def verify_password(plain, hashed): return True
def create_access_token(data): return "mock_access_token"
def generate_otp(): return str(123456)

class AuthService:
    def register_user(self, db: DBSession, user_in: UserCreate) -> UserResponse:
        existing_user = user_repo.get_user_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        user = user_repo.create_user(db, user_in)
        return user

    def authenticate_user(self, db: DBSession, user_in: UserLogin) -> dict:
        user = user_repo.get_user_by_email(db, user_in.email)
        if not user or not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": access_token, "user": user}

    def request_otp(self, db: DBSession, otp_req: OTPRequest) -> dict:
        user = user_repo.get_user_by_email(db, otp_req.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        code = generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        otp_repo.create_otp(db, user.id, code, expires_at)
        
        return {"message": "OTP sent successfully"}

    def verify_otp(self, db: DBSession, otp_ver: OTPVerify) -> dict:
        user = user_repo.get_user_by_email(db, otp_ver.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        latest_otp = otp_repo.get_latest_otp_for_user(db, user.id)
        if not latest_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No OTP requested"
            )
            
        if latest_otp.expires_at < datetime.now(timezone.utc) or latest_otp.code != otp_ver.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
            
        otp_repo.delete_otps_for_user(db, user.id)
        access_token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": access_token, "user": user}

auth_service = AuthService()
