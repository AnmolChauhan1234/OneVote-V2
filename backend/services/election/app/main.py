from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.db.base import Base
from app.db.session import engine
from app.api.v1.election import router as election_router
from app.api.v1.admin import router as admin_router
from app.api.v1.internal import router as internal_router
import app.models  # ensure models are loaded for metadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Database initialization handled by Alembic migrations
    yield
    # Cleanup (if any)

app = FastAPI(
    title="Election Service",
    version="1.0.0",
    description="Microservice for handling Elections, Positions, Candidates and Eligible Voters.",
    lifespan=lifespan
)

app.include_router(election_router, prefix="/api/v1/election", tags=["election"])
app.include_router(admin_router, prefix="/api/v1/election", tags=["admin"])
app.include_router(internal_router, prefix="/api/v1/election/internal", tags=["internal"])

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "election"}
