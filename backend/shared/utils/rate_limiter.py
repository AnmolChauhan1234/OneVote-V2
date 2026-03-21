from shared.core.redis import get_redis


def is_rate_limited(key: str, limit: int = 5, window: int = 60) -> bool:
    redis_client = get_redis()

    current = redis_client.get(key)

    if current and int(current) >= limit:
        return True

    pipe = redis_client.pipeline()
    pipe.incr(key, 1)
    pipe.expire(key, window)
    pipe.execute()

    return False