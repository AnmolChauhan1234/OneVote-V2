import uuid
from typing import List, Optional
from app.repositories.user_repo import UserRepository
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest
from shared.core.security import hash_password as get_password_hash


class UserService:
    def __init__(self, user_repo: UserRepository):
        self.repo = user_repo

    def register_user(self, user_data: RegisterRequest) -> User:
        if self.repo.get_by_email(user_data.email):
            raise Exception("User with this email already exists")
        
        hashed_password = get_password_hash(user_data.password)
        user = self.repo.create(user_data, hashed_password)
        
        return user

    def create_admin(self, admin_data) -> User:
        if self.repo.get_by_email(admin_data.email):
            raise Exception("User with this email already exists")
        
        hashed_password = get_password_hash(admin_data.password)
        user = self.repo.create_admin(admin_data, hashed_password)
        
        return user

    def create_super_admin(self, email: str, password: str) -> User:
        hashed_password = get_password_hash(password)
        # We handle 'exists' check internally gracefully in repo to allow idempotent startup
        return self.repo.create_super_admin(email, hashed_password)
    def update_identity_status(self, user_id: uuid.UUID, status: bool) -> bool:
        user = self.repo.get_by_id(user_id)
        if not user:
            return False
        
        self.repo.update(user, {"identity_verified": status})
        
        # If both are verified, mark the user as fully verified
        if user.identity_verified and user.biometric_verified:
            self.repo.mark_verified(user)
            
        return True

    def update_biometric_status(self, user_id: uuid.UUID, status: bool) -> bool:
        user = self.repo.get_by_id(user_id)
        if not user:
            return False
        
        self.repo.update(user, {"biometric_verified": status})
        
        # If both are verified, mark the user as fully verified
        if user.identity_verified and user.biometric_verified:
            self.repo.mark_verified(user)
            
        return True

    def verify_user(self, email: str) -> bool:
        user = self.repo.get_by_email(email)
        if not user:
            return False
        self.repo.mark_verified(user)
        return True

    def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return self.repo.get_by_id(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.repo.get_by_email(email)

    def get_all_users(self) -> List[User]:
        return self.repo.get_all()

    def block_user(self, user_id: uuid.UUID, requestor_role: str) -> bool:
        user = self.repo.get_by_id(user_id)
        if not user:
            return False
            
        if user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN] and requestor_role != UserRole.SUPER_ADMIN:
            raise Exception("Insufficient permissions to modify an administrator")
            
        self.repo.update(user, {"is_blocked": True})
        return True

    def suspend_user(self, user_id: uuid.UUID, requestor_role: str) -> bool:
        user = self.repo.get_by_id(user_id)
        if not user:
            return False
            
        if user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN] and requestor_role != UserRole.SUPER_ADMIN:
            raise Exception("Insufficient permissions to modify an administrator")
            
        self.repo.update(user, {"is_suspended": True})
        return True

    def delete_user(self, user_id: uuid.UUID, requestor_role: str) -> bool:
        user = self.repo.get_by_id(user_id)
        if not user:
            return False
            
        if user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN] and requestor_role != UserRole.SUPER_ADMIN:
            raise Exception("Insufficient permissions to modify an administrator")
            
        self.repo.delete(user)
        return True
