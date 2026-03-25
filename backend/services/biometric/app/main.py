from fastapi import FastAPI
from app.api.v1 import biometric
from app.db.base import Base
from app.db.session import engine

# Create database tables if they don't exist
# In a real environment, you'd use Alembic migrations instead
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OneVote-V2 Biometric Service",
    description="Microservice for handling facial recognition and liveness detection.",
    version="1.0.0"
)

app.include_router(biometric.router, prefix="/biometric", tags=["biometric"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
