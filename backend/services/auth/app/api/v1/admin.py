import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.user_service import UserService
from app.api.deps import get_user_service
from app.schemas.auth import UserResponse, MessageResponse, UserUpdate
from app.api.middlewares.auth import require_admin, validate_csrf
from app.models.user import User

router = APIRouter(dependencies=[Depends(require_admin), Depends(validate_csrf)])


@router.get("/users", response_model=List[UserResponse])
def get_all_users(user_service: UserService = Depends(get_user_service)):
    return user_service.get_all_users()


@router.post("/users/{user_id}/block", response_model=MessageResponse)
def block_user(user_id: uuid.UUID, user_service: UserService = Depends(get_user_service)):
    if user_service.block_user(user_id):
        return {"message": "User blocked successfully"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.post("/users/{user_id}/suspend", response_model=MessageResponse)
def suspend_user(user_id: uuid.UUID, user_service: UserService = Depends(get_user_service)):
    if user_service.suspend_user(user_id):
        return {"message": "User suspended successfully"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(user_id: uuid.UUID, user_service: UserService = Depends(get_user_service)):
    if user_service.delete_user(user_id):
        return {"message": "User deleted successfully"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
