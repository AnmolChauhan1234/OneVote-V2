import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.services.user_service import UserService
from app.api.deps import get_user_service
from app.schemas.auth import UserResponse, MessageResponse, UserUpdate
from app.models.user import User

from shared.core.dependencies import require_admin, require_super_admin, validate_csrf
from app.schemas.auth import UserResponse, MessageResponse, AdminCreate

router = APIRouter(dependencies=[Depends(require_admin), Depends(validate_csrf)])


@router.post("/admins", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_super_admin)])
def create_admin(
    admin_data: AdminCreate, user_service: UserService = Depends(get_user_service)
):
    try:
        user = user_service.create_admin(admin_data)
        return user
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/admins", response_model=List[UserResponse], dependencies=[Depends(require_super_admin)])
def get_all_admins(user_service: UserService = Depends(get_user_service)):
    # Returns all standard admins
    return [u for u in user_service.get_all_users() if u.role == "admin"]


@router.get("/users", response_model=List[UserResponse])
def get_all_users(user_service: UserService = Depends(get_user_service)):
    return user_service.get_all_users()


@router.post("/users/{user_id}/block", response_model=MessageResponse)
def block_user(
    user_id: uuid.UUID, 
    user_service: UserService = Depends(get_user_service),
    current_user: dict = Depends(require_admin)
):
    try:
        if user_service.block_user(user_id, current_user.get("role")):
            return {"message": "User blocked successfully"}
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.post("/users/{user_id}/suspend", response_model=MessageResponse)
def suspend_user(
    user_id: uuid.UUID, 
    user_service: UserService = Depends(get_user_service),
    current_user: dict = Depends(require_admin)
):
    try:
        if user_service.suspend_user(user_id, current_user.get("role")):
            return {"message": "User suspended successfully"}
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: uuid.UUID, 
    user_service: UserService = Depends(get_user_service),
    current_user: dict = Depends(require_admin)
):
    try:
        if user_service.delete_user(user_id, current_user.get("role")):
            return {"message": "User deleted successfully"}
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
