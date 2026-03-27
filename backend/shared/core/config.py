import os


class Settings:
    # ---------------- ENV ----------------
    ENV: str = os.getenv("GLOBAL_ENV", "development")

    # ---------------- JWT ----------------
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRY_MINUTES: int = int(os.getenv("JWT_EXPIRY_MINUTES", 60))

    # ---------------- REDIS ----------------
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # fallback (for local/dev only)
    REDIS_HOST: str = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB: int = int(os.getenv("REDIS_DB", 0))

    # ---------------- DATABASE ----------------
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # ---------------- CLIENT ----------------
    CLIENT_URL: str = os.getenv("CLIENT_URL", "http://localhost:3000")

    # ---------------- INTERNAL ----------------
    INTERNAL_API_KEY: str = os.getenv("INTERNAL_API_KEY", "internal-secret")


settings = Settings()