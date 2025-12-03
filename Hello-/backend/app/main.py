"""
Planetary Health Web API - Main Application Entry Point

FastAPI backend for the Planetary Health Monitor web application.
Provides real-time satellite data queries and PDF report generation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

from app.api import routes
from app.api import sensor_routes
from app.api import satellite_routes
from app.services.earth_engine import initialize_ee
from app.config import PDF_OUTPUT_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - initialize services on startup."""
    print("Initializing Earth Engine...")
    try:
        initialize_ee()
        print("Earth Engine initialized successfully!")
    except Exception as e:
        print(f"Warning: Earth Engine initialization failed: {e}")
        print("API will attempt to initialize on first request.")

    # Initialize Firestore (for sensor data)
    print("Initializing Firestore for sensor data...")
    try:
        from app.services.sensor_service import get_firestore
        get_firestore()
    except Exception as e:
        print(f"Warning: Firestore initialization failed: {e}")
        print("Sensor API will attempt to initialize on first request.")

    yield
    print("Shutting down...")


app = FastAPI(
    title="Planetary Health API",
    description="Real-time satellite data for environmental health monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for PDF downloads
app.mount("/downloads", StaticFiles(directory=str(PDF_OUTPUT_DIR)), name="downloads")

# Include API routes
app.include_router(routes.router, prefix="/api", tags=["Planetary Health"])
app.include_router(sensor_routes.router, prefix="/api", tags=["Sensor Data"])
app.include_router(satellite_routes.router, prefix="/api", tags=["Satellite Imagery"])


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "running",
        "name": "Planetary Health API",
        "version": "1.0.0",
        "endpoints": {
            "query": "/api/query",
            "pdf": "/api/pdf",
            "health": "/api/health",
            "satellite": {
                "images": "/api/satellite/images",
                "image": "/api/satellite/image",
                "legend": "/api/satellite/legend",
                "types": "/api/satellite/types"
            },
            "sensors": {
                "indoor_readings": "/api/sensors/indoor/readings",
                "outdoor_readings": "/api/sensors/outdoor/readings",
                "indoor_latest": "/api/sensors/indoor/latest",
                "outdoor_latest": "/api/sensors/outdoor/latest",
                "indoor_all": "/api/sensors/indoor/all",
                "outdoor_all": "/api/sensors/outdoor/all",
                "compare": "/api/sensors/compare",
                "cache_status": "/api/sensors/cache/status"
            }
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
