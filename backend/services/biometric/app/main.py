from fastapi import FastAPI
from app.api.v1 import biometric, internal
# Database initialization handled by Alembic migrations

app = FastAPI(
    title="OneVote-V2 Biometric Service",
    description="Microservice for handling facial recognition and liveness detection.",
    version="1.0.0"
)

app.include_router(biometric.router, prefix="/api/v1/biometric", tags=["biometric"])
app.include_router(internal.router, prefix="/api/v1/internal", tags=["internal"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
