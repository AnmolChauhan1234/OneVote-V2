from fastapi import Request, HTTPException, Header, Depends
from typing import Optional

from shared.core.jwt import decode_token
from shared.core.redis import redis_client


# ---------------- GET CURRENT USER ----------------
def get_current_user(
    request: Request,
    Authorization: Optional[str] = Header(None),
):
    """
    Extract user from access token.
    Supports:
    - Cookie-based auth (primary)
    - Authorization header (fallback for services / testing)
    """

    # 🔥 1. Get token from cookie (PRIMARY)
    token = request.cookies.get("access_token")

    # 🔁 2. Fallback to Authorization header
    if not token and Authorization:
        if Authorization.startswith("Bearer "):
            token = Authorization.split(" ")[1]
        else:
            token = Authorization

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # 🔥 3. Decode JWT
    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # 🔥 4. Redis blacklist check
    if redis_client.get(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token revoked")

    return payload


# ---------------- OPTIONAL: GET CURRENT USER ID ----------------
def get_current_user_id(
    current_user: dict = Depends(get_current_user)
):
    """
    Shortcut dependency if you only need user_id
    """
    return current_user.get("user_id")


# ---------------- CSRF VALIDATION ----------------
def validate_csrf(request: Request):
    """
    CSRF protection for state-changing requests (POST, PUT, DELETE)
    """

    csrf_cookie = request.cookies.get("csrf_token")
    csrf_header = request.headers.get("X-CSRF-Token")

    if not csrf_cookie or not csrf_header:
        raise HTTPException(status_code=403, detail="CSRF token missing")

    if csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="CSRF validation failed")


# ---------------- OPTIONAL: ADMIN CHECK ----------------
def require_admin(current_user: dict = Depends(get_current_user)):
    """
    Role-based access control (future use)
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return current_user


# ---------------- INTERNAL SERVICE VALIDATION ----------------
def validate_internal_key(request: Request):
    """
    Validate internal API key for service-to-service communication.
    """
    from shared.core.config import settings
    internal_key = request.headers.get("X-INTERNAL-KEY")
    if not internal_key or internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=403, detail="Invalid internal key"
        )