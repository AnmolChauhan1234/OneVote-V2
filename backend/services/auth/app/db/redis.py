from shared.core.redis import redis_client

def get_redis():
    """
    FastAPI dependency that returns the singleton Redis client.
    """
    return redis_client