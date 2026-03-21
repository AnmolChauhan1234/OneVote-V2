import redis

REDIS_HOST = "redis"
REDIS_PORT = 6379
REDIS_DB = 0


def get_redis():
    return redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        decode_responses=True,
    )


# -----------------------------
# Session helpers
# -----------------------------

def set_session(redis_client, session_id: str, user_id: str, ttl: int = 3600):
    key = f"session:{session_id}"
    redis_client.set(key, user_id, ex=ttl)


def get_session(redis_client, session_id: str):
    key = f"session:{session_id}"
    return redis_client.get(key)


def delete_session(redis_client, session_id: str):
    key = f"session:{session_id}"
    redis_client.delete(key)