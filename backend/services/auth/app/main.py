import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth_router, admin_router, internal_router

# Database initialization handled by Alembic migrations


from contextlib import asynccontextmanager

from app.db.session import SessionLocal
from app.repositories.user_repo import UserRepository
from app.services.user_service import UserService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Bootstrap Super Admin from Env
    super_email = os.getenv("SUPERADMIN_EMAIL")
    super_password = os.getenv("SUPERADMIN_PASSWORD")
    if super_email and super_password:

        db = SessionLocal()
        try:
            repo = UserRepository(db)
            service = UserService(repo)
            service.create_super_admin(super_email, super_password)
            print(f"Super Admin bootstrapped successfully: {super_email}")
        except Exception as e:
            print(f" Failed to bootstrap super admin: {e}")
        finally:
            db.close()
    yield


# ---------------- APP INIT ----------------
app = FastAPI(
    title="Auth Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ---------------- CONFIG ----------------
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")


# ---------------- HEALTH CHECK ----------------
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "auth"}


# ---------------- ROUTES ----------------
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(internal_router, prefix="/api/v1/internal", tags=["internal"])
