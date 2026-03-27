import redis
from shared.core.config import settings


def get_redis_client():
    """
    Create Redis client based on environment configuration.

    Priority:
    1. REDIS_URL (recommended for production & also works for dev)
    2. Fallback to host/port (local Docker)
    """

    # 🔥 Preferred way (works for both dev & prod)
    if settings.REDIS_URL:
        return redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )

    # ⚠️ Fallback (only if REDIS_URL not provided)
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        decode_responses=True,
    )


# 🔥 Singleton Redis client
redis_client = get_redis_client()


# -----------------------------
# SESSION MANAGEMENT
# -----------------------------

def set_session(session_id: str, user_id: str, ttl: int = 3600):
    redis_client.set(f"session:{session_id}", user_id, ex=ttl)


def get_session(session_id: str):
    return redis_client.get(f"session:{session_id}")


def delete_session(session_id: str):
    redis_client.delete(f"session:{session_id}")


# -----------------------------
# TOKEN BLACKLIST
# -----------------------------

def blacklist_token(token: str, ttl: int = 3600):
    """
    Add token to blacklist (used during logout)
    """
    redis_client.set(f"blacklist:{token}", "1", ex=ttl)


def is_token_blacklisted(token: str) -> bool:
    """
    Check if token is blacklisted
    """
    return redis_client.get(f"blacklist:{token}") is not None


# -----------------------------
# OPTIONAL: HEALTH CHECK
# -----------------------------

def check_redis_connection():
    """
    Useful for debugging / health endpoint
    """
    try:
        redis_client.ping()
        return True
    except Exception:
        return False