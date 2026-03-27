import random
import string
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from app.repositories.user_repo import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest
from shared.core.security import hash_password as get_password_hash, verify_password
from shared.core.jwt import create_access_token, create_refresh_token, decode_token as decode_jwt
from shared.core.config import settings
from app.db.redis import get_redis

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
        self.redis = get_redis()
        
    def generate_otp_code(self) -> str:
        return ''.join(random.choices(string.digits, k=6))

    def register_user(self, user_data: RegisterRequest) -> dict:
        existing_user = self.user_repo.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            
        hashed_password = get_password_hash(user_data.password)
        user = self.user_repo.create_user(user_data, hashed_password)
        
        # otp_code = self.generate_otp_code()
        # expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        # self.user_repo.create_otp(user.id, otp_code, expires_at)
        
        # TODO: Integrate with Notification Microservice
        # send_to_notification_service(user.email, otp_code)
        
        return {
            "id": user.id,
            "email": user.email,
            "message": "User registered.",
            # "otp_test_only": otp_code # Exposing for test purposes
        }
        
    def generate_new_otp(self, email: str) -> dict:
        user = self.user_repo.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        rate_limit_key = f"otp_rate_limit:{user.id}"
        if self.redis.get(rate_limit_key):
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another OTP")
            
        otp_code = self.generate_otp_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        self.user_repo.create_otp(user.id, otp_code, expires_at)
        
        self.redis.setex(rate_limit_key, 60, "limited")
        
        # TODO: Integrate with Notification Microservice
        # send_to_notification_service(user.email, otp_code)
        
        return {"message": "OTP generated and sent", "otp_test_only": otp_code}

    def verify_otp(self, email: str, otp_code: str) -> dict:
        user = self.user_repo.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        otp_record = self.user_repo.get_otp(user.id)
        if not otp_record:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No OTP found for this user")
            
        if otp_record.otp_code != otp_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
            
        if otp_record.expires_at < datetime.now(timezone.utc):
            self.user_repo.delete_otp(otp_record.id)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP Expired")
            
        self.user_repo.mark_user_verified(user)
        self.user_repo.delete_otp(otp_record.id)
        
        return {"message": "User verified successfully"}

    def login(self, login_data: LoginRequest) -> dict:
        user = self.user_repo.get_user_by_email(login_data.email)
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
            
        if not user.is_verified:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please verify OTP.")
            
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_REFRESH_EXPIRY_MINUTES)
        self.user_repo.create_session(user.id, refresh_token, expires_at)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    def refresh_token(self, refresh_token: str) -> dict:
        session = self.user_repo.get_session_by_token(refresh_token)
        if not session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
            
        if session.expires_at < datetime.now(timezone.utc):
            self.user_repo.delete_session(session.id)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session Expired. Please login again.")
            
        try:
            payload = decode_jwt(refresh_token)
            user_id = str(payload.get("sub"))
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token format")
            
        new_access_token = create_access_token({"sub": user_id})
        
        return {
            "access_token": new_access_token,
        }

    def logout(self, user_id: int, refresh_token: str, access_token: str) -> dict:
        if refresh_token:
            session = self.user_repo.get_session_by_token(refresh_token)
            if session:
                self.user_repo.delete_session(session.id)
            
        if access_token:
            try:
                payload = decode_jwt(access_token)
                exp = payload.get("exp")
                if exp:
                    current_time = datetime.now(timezone.utc).timestamp()
                    time_left = int(exp - current_time)
                    if time_left > 0:
                        self.redis.setex(f"blacklist:{access_token}", time_left, "true")
            except Exception:
                pass
                
        return {"message": "Logged out successfully"}

    def list_users(self) -> list:
        return self.user_repo.get_all_users()

    def get_user(self, user_id: int):
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    def update_user(self, user_id: int, update_data: dict):
        user = self.get_user(user_id)
        return self.user_repo.update_user(user, update_data)

    def delete_user(self, user_id: int):
        user = self.get_user(user_id)
        self.user_repo.delete_user(user)
        return {"message": "User deleted successfully"}
