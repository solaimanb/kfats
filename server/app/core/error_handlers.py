"""
Centralized error handlers for KFATS LMS application.
Provides consistent error response formatting and logging.
"""

import logging
from typing import Any, Dict, Union
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, DataError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .exceptions import (
    KFATSException,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    DatabaseError,
    BusinessLogicError,
    ExternalServiceError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    PaymentRequiredError,
    FileUploadError,
    ConfigurationError
)

logger = logging.getLogger(__name__)


def create_error_response(
    status_code: int,
    message: str,
    error_code: str,
    details: Dict[str, Any] = None
) -> JSONResponse:
    """
    Create a standardized error response.

    Args:
        status_code: HTTP status code
        message: Human-readable error message
        error_code: Machine-readable error code
        details: Additional error context

    Returns:
        JSONResponse with standardized error format
    """
    response_data = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
            "details": details or {}
        }
    }

    return JSONResponse(
        status_code=status_code,
        content=response_data
    )


async def kfats_exception_handler(request: Request, exc: KFATSException) -> JSONResponse:
    """
    Handle custom KFATS exceptions.

    Args:
        request: FastAPI request object
        exc: KFATS exception instance

    Returns:
        Standardized JSON error response
    """
    logger.error(
        f"KFATS Exception: {exc.error_code} - {exc.message}",
        extra={
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "details": exc.details,
            "path": str(request.url),
            "method": request.method
        }
    )

    return create_error_response(
        status_code=exc.status_code,
        message=exc.message,
        error_code=exc.error_code,
        details=exc.details
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle FastAPI HTTPException.

    Args:
        request: FastAPI request object
        exc: HTTPException instance

    Returns:
        Standardized JSON error response
    """
    logger.warning(
        f"HTTP Exception: {exc.status_code} - {exc.detail}",
        extra={
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": str(request.url),
            "method": request.method
        }
    )

    return create_error_response(
        status_code=exc.status_code,
        message=exc.detail,
        error_code=f"HTTP_{exc.status_code}",
        details={"headers": dict(exc.headers) if exc.headers else {}}
    )


async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handle Starlette HTTPException.

    Args:
        request: FastAPI request object
        exc: Starlette HTTPException instance

    Returns:
        Standardized JSON error response
    """
    logger.warning(
        f"Starlette HTTP Exception: {exc.status_code} - {exc.detail}",
        extra={
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": str(request.url),
            "method": request.method
        }
    )

    return create_error_response(
        status_code=exc.status_code,
        message=exc.detail,
        error_code=f"HTTP_{exc.status_code}"
    )


async def pydantic_validation_error_handler(request: Request, exc: PydanticValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors.

    Args:
        request: FastAPI request object
        exc: Pydantic ValidationError instance

    Returns:
        Standardized JSON error response
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    logger.warning(
        f"Pydantic Validation Error: {len(errors)} validation errors",
        extra={
            "validation_errors": errors,
            "path": str(request.url),
            "method": request.method
        }
    )

    return create_error_response(
        status_code=400,
        message="Validation failed",
        error_code="VALIDATION_ERROR",
        details={"validation_errors": errors}
    )


async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """
    Handle SQLAlchemy database errors.

    Args:
        request: FastAPI request object
        exc: SQLAlchemy error instance

    Returns:
        Standardized JSON error response
    """
    status_code = 500
    error_code = "DATABASE_ERROR"
    message = "Database operation failed"

    if isinstance(exc, IntegrityError):
        status_code = 409
        error_code = "DATABASE_INTEGRITY_ERROR"
        message = "Data integrity constraint violated"
    elif isinstance(exc, DataError):
        status_code = 400
        error_code = "DATABASE_DATA_ERROR"
        message = "Invalid data provided"

    logger.error(
        f"SQLAlchemy Error: {type(exc).__name__} - {str(exc)}",
        extra={
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
            "path": str(request.url),
            "method": request.method
        },
        exc_info=True
    )

    return create_error_response(
        status_code=status_code,
        message=message,
        error_code=error_code,
        details={"original_error": str(exc)}
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions.

    Args:
        request: FastAPI request object
        exc: Generic exception instance

    Returns:
        Standardized JSON error response
    """
    logger.critical(
        f"Unexpected Exception: {type(exc).__name__} - {str(exc)}",
        extra={
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
            "path": str(request.url),
            "method": request.method
        },
        exc_info=True
    )

    return create_error_response(
        status_code=500,
        message="Internal server error",
        error_code="INTERNAL_SERVER_ERROR",
        details={"exception_type": type(exc).__name__}
    )


# Exception handler registry for easy registration
EXCEPTION_HANDLERS = [
    (KFATSException, kfats_exception_handler),
    (HTTPException, http_exception_handler),
    (StarletteHTTPException, starlette_http_exception_handler),
    (PydanticValidationError, pydantic_validation_error_handler),
    (SQLAlchemyError, sqlalchemy_error_handler),
    (Exception, generic_exception_handler),
]
