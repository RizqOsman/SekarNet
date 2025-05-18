from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.exc import SQLAlchemyError

from .api.api import api_router
from .core.config import settings
from .db.session import engine
from .db.base import Base

# Create all tables in the database
# Comment this out if you're using migrations
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

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