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

# from app.api.v1 import voting, voting_token

app = FastAPI(title="Notification Service")

# ---------------- EXCEPTION HANDLERS ----------------
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# app.include_router(
#     ...,
#     prefix="/api/v1/notification",
#     tags=["notification"],
# )


@app.get("/health")
def health_check():
    return {"status": "ok"}
