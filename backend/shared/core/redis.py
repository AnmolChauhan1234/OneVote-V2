import redis

REDIS_HOST = "redis"
REDIS_PORT = 6379
REDIS_DB = 0

# 🔥 Singleton Redis client
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    decode_responses=True,
)


# -----------------------------
# SESSION MANAGEMENT
# -----------------------------


def set_session(session_id: str, user_id: str, ttl: int = 3600):
    key = f"session:{session_id}"
    redis_client.set(key, user_id, ex=ttl)


def get_session(session_id: str):
    key = f"session:{session_id}"
    return redis_client.get(key)


def delete_session(session_id: str):
    key = f"session:{session_id}"
    redis_client.delete(key)


# -----------------------------
# TOKEN BLACKLIST (🔥 IMPORTANT)
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
