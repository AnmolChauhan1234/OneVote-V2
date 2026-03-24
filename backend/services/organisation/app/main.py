from fastapi import FastAPI
from app.api.v1.organisation import router as organisation_router
from app.db.base import Base
from app.db.session import engine

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Organisation Service", version="1.0.0")

app.include_router(organisation_router, prefix="/api/v1/organisations", tags=["organisations"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
