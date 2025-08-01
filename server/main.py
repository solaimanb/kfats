from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_tables
from app.routers import auth, users, courses, articles, products, role_applications, analytics, content_management

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API for Kushtia Finearts and Technology School LMS Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(courses.router, prefix="/api/v1")
app.include_router(articles.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(role_applications.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(content_management.router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup."""
    create_tables()


@app.get("/")
def read_root():
    return {
        "message": "Welcome to KFATS LMS API",
        "version": settings.app_version,
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "KFATS LMS API"}
