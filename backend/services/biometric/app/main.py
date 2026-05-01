from fastapi import FastAPI
from shared.core.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from app.api.v1 import biometric, internal
# Database initialization handled by Alembic migrations

app = FastAPI(
    title="OneVote-V2 Biometric Service",
    description="Microservice for handling facial recognition and liveness detection.",
    version="1.0.0"
)

# ---------------- EXCEPTION HANDLERS ----------------
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(biometric.router, prefix="/api/v1/biometric", tags=["biometric"])
app.include_router(internal.router, prefix="/api/v1/biometric/internal", tags=["internal"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
