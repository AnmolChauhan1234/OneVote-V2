from fastapi import FastAPI
from app.api.v1.organisation import router as organisation_router
from app.api.v1.admin import router as admin_router
from app.api.v1.internal import router as internal_router
from app.db.base import Base
from app.db.session import engine

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Organisation Service", version="1.0.0")

app.include_router(organisation_router, prefix="/api/v1/organizations", tags=["organizations"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(internal_router, prefix="/internal", tags=["internal"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
