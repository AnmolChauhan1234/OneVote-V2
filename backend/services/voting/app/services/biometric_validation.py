import redis
import os

redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379")
)


def validate_biometric_token(user_id: str, token: str):
    key = f"biometric:token:{token}"

    stored_user = redis_client.get(key)

    if not stored_user:
        raise Exception("Invalid or expired biometric token")

    if stored_user.decode() != str(user_id):
        raise Exception("Biometric token does not belong to user")

    return True