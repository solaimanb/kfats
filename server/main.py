from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_tables_async
from app.core.logging import setup_logging
from app.core.middleware import (
    RequestLoggingMiddleware,
    SecurityHeadersMiddleware,
    RateLimitMiddleware
)
from app.core.error_handlers import EXCEPTION_HANDLERS
from app.routers import (
    auth, users, courses, articles, products, role_applications,
    analytics, content_management, mentors, search, password, orders, seller_analytics
)

# Async lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    setup_logging()
    if settings.debug:
        await create_tables_async()
    yield

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API for Kushtia Finearts and Technology School LMS Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware FIRST (order matters for CORS headers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware AFTER CORS
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

# Register exception handlers
for exception_class, handler_func in EXCEPTION_HANDLERS:
    app.add_exception_handler(exception_class, handler_func)

# Include routers with async consistency
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(courses.router, prefix="/api/v1")
app.include_router(articles.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(role_applications.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(content_management.router, prefix="/api/v1")
app.include_router(mentors.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(password.router, prefix="/api/v1")
app.include_router(seller_analytics.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")

@app.get("/")
async def read_root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to KFATS LMS API",
        "version": settings.app_version,
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "KFATS LMS API"}
