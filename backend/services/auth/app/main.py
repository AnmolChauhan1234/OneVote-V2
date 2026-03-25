import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth_router, admin_router, internal_router

app = FastAPI(title="Auth Service")

CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")

# Setup CORS to allow credentials for HttpOnly cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(internal_router, prefix="/api/v1/internal", tags=["internal"])
