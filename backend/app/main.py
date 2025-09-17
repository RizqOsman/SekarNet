import os
from fastapi.responses import FileResponse, RedirectResponse
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
import secure

from .api.api import api_router
from .core.config import settings
from .core.cache import CacheService
from .core.middleware import RateLimitMiddleware

DOCS_PATH = os.path.join(os.path.dirname(__file__), "docs", "docs.html")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.get("/", include_in_schema=False)
async def root():
    return FileResponse(DOCS_PATH)

# Initialize cache service
cache_service = CacheService()

# Security headers configuration
security_headers = secure.Secure()

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        security_headers.framework.fastapi(response)
        return response

# Security Middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Rate Limiting
app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=60,  # Default rate limit
    admin_requests_per_minute=300  # Higher limit for admin
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://localhost:5000",
        "http://192.168.1.7:5173",
        "http://192.168.1.7:3000", 
        "http://192.168.1.7:5000",
        "http://192.168.1.7:4173",
        "http://192.168.1.7:8080"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for QRIS images and other assets
if os.path.exists("public"):
    app.mount("/assets", StaticFiles(directory="public/assets"), name="assets")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

@app.get("/health")
def health_check():
    try:
        # You could add database check here 
        # by making a simple query
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "details": "Database connection error"}
