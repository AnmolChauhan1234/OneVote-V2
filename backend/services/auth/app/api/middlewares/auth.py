import uuid
import secrets
from fastapi import Request, HTTPException, status, Depends
from app.services.user_service import UserService
from app.services.session_service import SessionService
from app.api.deps import get_user_service, get_session_service
from app.utils.security import decode_jwt
from jose import JWTError
from app.models.user import User, UserRole


async def validate_csrf(request: Request):
    """
    Double Submit Cookie Strategy:
    Compare 'csrf_token' from cookies with 'X-CSRF-Token' from headers.
    Skip for safe HTTP methods.
    """
    if request.method in ["GET", "HEAD", "OPTIONS", "TRACE"]:
        return

    csrf_cookie = request.cookies.get("csrf_token")
    csrf_header = request.headers.get("X-CSRF-Token")

    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token validation failed"
        )


async def get_current_user(
    request: Request,
    user_service: UserService = Depends(get_user_service),
    session_service: SessionService = Depends(get_session_service)
) -> User:
    token = request.cookies.get("access_token")
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Access token missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check blacklist
    if session_service.is_access_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is blacklisted. Please login again."
        )
        
    try:
        payload = decode_jwt(token)
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user identity")
        
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    user = user_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    if user.is_blocked:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is blocked")
    
    if user.is_suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is suspended")
        
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin role required."
        )
    return current_user
