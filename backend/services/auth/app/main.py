import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth_router, admin_router, internal_router


# ---------------- APP INIT ----------------
app = FastAPI(
    title="Auth Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ---------------- CONFIG ----------------
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")


# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CLIENT_URL],     # 🔥 frontend URL
    allow_credentials=True,         # 🔥 required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- HEALTH CHECK ----------------
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "auth"}


# ---------------- ROUTES ----------------
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(internal_router, prefix="/api/v1/internal", tags=["internal"])