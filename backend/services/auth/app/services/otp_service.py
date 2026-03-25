import random
import string
from redis import Redis
from typing import Optional


class OTPService:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.otp_expiry = 300  # 5 minutes

    def _generate_otp(self, length: int = 6) -> str:
        return "".join(random.choices(string.digits, k=length))

    def generate_otp(self, purpose: str, identifier: str) -> str:
        """
        purpose: register, 2fa, voting
        identifier: email (for register) or user_id (for 2fa/voting)
        """
        otp = self._generate_otp()
        key = f"otp:{purpose}:{identifier}"
        self.redis.setex(key, self.otp_expiry, otp)
        return otp

    def verify_otp(self, purpose: str, identifier: str, otp: str) -> bool:
        key = f"otp:{purpose}:{identifier}"
        stored_otp = self.redis.get(key)

        if stored_otp and stored_otp == otp:
            self.redis.delete(key)
            return True
        return False
