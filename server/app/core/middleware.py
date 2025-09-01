"""
Middleware components for KFATS LMS application.
Provides request logging, error handling, and other cross-cutting concerns.
"""

import logging
import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests and responses.

    Logs request details, response status, and timing information.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())

        # Add request ID to request state for use in handlers
        request.state.request_id = request_id

        # Log incoming request
        start_time = time.time()
        logger.info(
            f"Request started: {request.method} {request.url}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "headers": dict(request.headers),
                "client_ip": request.client.host if request.client else None,
            }
        )

        try:
            # Process the request
            response = await call_next(request)

            # Calculate processing time
            process_time = time.time() - start_time

            # Log successful response
            logger.info(
                f"Request completed: {request.method} {request.url} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "url": str(request.url),
                    "status_code": response.status_code,
                    "process_time": f"{process_time:.4f}s",
                }
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as exc:
            # Calculate processing time for failed requests
            process_time = time.time() - start_time

            # Log error response
            logger.error(
                f"Request failed: {request.method} {request.url} - {type(exc).__name__}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "url": str(request.url),
                    "exception_type": type(exc).__name__,
                    "exception_message": str(exc),
                    "process_time": f"{process_time:.4f}s",
                },
                exc_info=True
            )

            # Re-raise the exception to be handled by error handlers
            raise


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware for adding security headers to responses.

    Adds various security-related HTTP headers.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Basic rate limiting middleware.

    Tracks request counts per client IP and enforces limits.
    Note: This is a simple in-memory implementation.
    For production, consider using Redis or similar.
    """

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = {}  # In production, use Redis

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "unknown"

        # Get current minute
        current_minute = int(time.time() // 60)

        # Initialize or clean up old entries
        if client_ip not in self.requests:
            self.requests[client_ip] = {}
        elif current_minute not in self.requests[client_ip]:
            # Clean up old minutes
            self.requests[client_ip] = {current_minute: 0}

        # Check rate limit
        if current_minute in self.requests[client_ip]:
            self.requests[client_ip][current_minute] += 1
        else:
            self.requests[client_ip][current_minute] = 1

        if self.requests[client_ip][current_minute] > self.requests_per_minute:
            logger.warning(
                f"Rate limit exceeded for IP: {client_ip}",
                extra={
                    "client_ip": client_ip,
                    "request_count": self.requests[client_ip][current_minute],
                    "limit": self.requests_per_minute
                }
            )

            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests. Please try again later.",
                        "details": {
                            "limit": self.requests_per_minute,
                            "window": "minute"
                        }
                    }
                }
            )

        response = await call_next(request)
        return response
