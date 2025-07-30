from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .api.api import api_router
from .core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
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
    allow_credentials=False,  # Set to False to avoid CORS issues
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