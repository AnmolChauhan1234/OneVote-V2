from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.db.base import Base
from app.db.session import engine
from app.api.v1.election import router as election_router
from app.api.v1.admin import router as admin_router
from app.api.v1.internal import router as internal_router
import app.models  # ensure models are loaded for metadata

import asyncio
from app.db.session import SessionLocal
from app.repositories.election_repo import ElectionRepository

async def update_election_statuses():
    """Background task to update election statuses every minute."""
    while True:
        db = SessionLocal()
        try:
            repo = ElectionRepository(db)
            repo.update_expired_statuses()
            repo.commit()
            # print("DEBUG: Background status sync completed")
        except Exception as e:
            print(f"ERROR in background status sync: {e}")
        finally:
            db.close()
        await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background task
    task = asyncio.create_task(update_election_statuses())
    yield
    # Cancel background task on shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="Election Service",
    version="1.0.0",
    description="Microservice for handling Elections, Positions, Candidates and Eligible Voters.",
    lifespan=lifespan
)

app.include_router(admin_router, prefix="/api/v1/election", tags=["admin"])
app.include_router(election_router, prefix="/api/v1/election", tags=["election"])
app.include_router(internal_router, prefix="/api/v1/election/internal", tags=["internal"])

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "election"}
