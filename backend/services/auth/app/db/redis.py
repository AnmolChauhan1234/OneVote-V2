import os
import redis

# Connection URL from docker-compose
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Setup connection pool
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def get_redis():
    return redis_client
