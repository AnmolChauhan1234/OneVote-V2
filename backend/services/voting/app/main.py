from fastapi import FastAPI
from app.api.v1 import voting, voting_token, internal
from shared.core.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

app = FastAPI(title="Voting Service")

# ---------------- EXCEPTION HANDLERS ----------------
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(
    voting.router,
    prefix="/api/v1/voting",
    tags=["Voting"],
)

app.include_router(
    voting_token.router,
    prefix="/api/v1/voting/token",
    tags=["Token"],
)
app.include_router(
    internal.router,
    prefix="/api/v1/voting/internal",
    tags=["internal"],
)