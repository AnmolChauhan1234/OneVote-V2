from fastapi import FastAPI
from app.api.v1.organisation import router as organisation_router
from app.api.v1.admin import router as admin_router
from app.api.v1.internal import router as internal_router
from shared.core.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

app = FastAPI(title="Organisation Service", version="1.0.0")

# ---------------- EXCEPTION HANDLERS ----------------
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(organisation_router, prefix="/api/v1/organisation", tags=["organisation"])
app.include_router(admin_router, prefix="/api/v1/organisation/admin", tags=["admin"])
app.include_router(internal_router, prefix="/api/v1/organisation/internal", tags=["internal"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
