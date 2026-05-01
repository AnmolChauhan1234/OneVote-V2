from app.api.v1.identity import router as identity_router
import os
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

app = FastAPI(title="Identity Service")

# ---------------- EXCEPTION HANDLERS ----------------
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Database initialization handled by Alembic migrations

GLOBAL_ENV = os.getenv("GLOBAL_ENV", "development")
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")


# Root endpoint for health check
@app.get("/")
def read_root():
    return {"status": "Identity Service is running", "env": GLOBAL_ENV}


# Include versioned API router
app.include_router(identity_router, prefix="/api/v1/identity", tags=["identity"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
