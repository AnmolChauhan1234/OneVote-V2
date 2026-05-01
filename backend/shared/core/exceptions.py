from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel
from typing import Any, Optional, Dict

class ErrorResponse(BaseModel):
    success: bool = False
    error_code: str
    message: str
    details: Optional[Any] = None

class AppException(Exception):
    def __init__(
        self, 
        message: str, 
        error_code: str = "INTERNAL_SERVER_ERROR", 
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Any = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details
        ).model_dump()
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Map common HTTP status codes to custom error codes
    error_code = "HTTP_ERROR"
    if exc.status_code == 401: error_code = "UNAUTHORIZED"
    elif exc.status_code == 403: error_code = "FORBIDDEN"
    elif exc.status_code == 404: error_code = "NOT_FOUND"
    elif exc.status_code == 400: error_code = "BAD_REQUEST"

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=error_code,
            message=str(exc.detail),
        ).model_dump()
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error_code="VALIDATION_ERROR",
            message="Input validation failed",
            details=exc.errors()
        ).model_dump()
    )

async def generic_exception_handler(request: Request, exc: Exception):
    # Log the real error for internal debugging
    print(f"CRITICAL UNHANDLED ERROR: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error_code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred on the server.",
        ).model_dump()
    )
