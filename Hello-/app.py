#!/usr/bin/env python3
"""
FastAPI Server for Planetary Health Index Query System

Provides REST API endpoints for querying satellite data via Google Earth Engine.

Usage:
    uvicorn app:app --reload --port 8000

Endpoints:
    POST /api/phi/query - Query PHI data for a location
    GET /api/phi/health - Health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime

from planetary_health_query import GEEQueryEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Planetary Health Index API",
    description="Query real satellite data for any location worldwide using Google Earth Engine",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize GEE Engine (singleton)
engine: Optional[GEEQueryEngine] = None


def get_engine() -> GEEQueryEngine:
    """Get or create GEE Query Engine singleton."""
    global engine
    if engine is None:
        logger.info("Initializing GEE Query Engine...")
        engine = GEEQueryEngine(auto_init=True)
        logger.info("GEE Query Engine initialized successfully")
    return engine


# Request/Response Models
class PHIQueryRequest(BaseModel):
    """Request model for PHI query."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude (-90 to 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude (-180 to 180)")
    mode: str = Field(default="comprehensive", description="Query mode: 'simple' (10 metrics) or 'comprehensive' (24 metrics)")
    temporal: str = Field(default="latest", description="Temporal mode: 'latest', 'monthly', or 'annual'")
    buffer_radius: int = Field(default=500, ge=100, le=10000, description="Buffer radius in meters (100-10000)")
    pillars: Optional[List[str]] = Field(default=None, description="Optional list of pillars to query (A, B, C, D, E)")

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 28.6139,
                "longitude": 77.2090,
                "mode": "comprehensive",
                "temporal": "latest",
                "buffer_radius": 500
            }
        }


class MetricData(BaseModel):
    """Model for a single metric."""
    value: Optional[float] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    quality: Optional[str] = None
    source: Optional[str] = None


class PillarData(BaseModel):
    """Model for a single pillar's data."""
    metrics: Dict[str, Any]
    pillar_id: str
    pillar_name: str
    pillar_color: str
    score: Optional[int] = None
    data_date: Optional[str] = None
    mode: str
    query_time: str


class PHISummary(BaseModel):
    """Model for PHI summary."""
    overall_score: int
    pillar_scores: Dict[str, int]
    data_completeness: float
    quality_flags: List[str]


class PHIQueryResponse(BaseModel):
    """Response model for PHI query."""
    query: Dict[str, Any]
    pillars: Dict[str, Any]
    summary: PHISummary
    time_series: Dict[str, Any]


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    message: str
    timestamp: str
    gee_initialized: bool


# API Endpoints
@app.get("/api/phi/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.

    Returns the status of the API and GEE initialization.
    """
    global engine
    return HealthResponse(
        status="ok",
        message="Planetary Health Index API is running",
        timestamp=datetime.now().isoformat(),
        gee_initialized=engine is not None and engine._initialized
    )


@app.post("/api/phi/query", response_model=PHIQueryResponse, tags=["PHI Query"])
async def query_phi(request: PHIQueryRequest):
    """
    Query Planetary Health Index for a location.

    Queries real satellite data from Google Earth Engine for the specified
    coordinates and returns metrics across 5 pillars:

    - **A - Atmospheric**: Air quality, AOD, UV Index
    - **B - Biodiversity**: NDVI, EVI, LAI, Land Cover
    - **C - Carbon**: Forest Cover, Biomass, Carbon Stock
    - **D - Degradation**: LST, Soil Moisture, Drought
    - **E - Ecosystem**: Population, Nightlights, Human Modification

    **Note**: Query takes 15-30 seconds due to satellite data processing.
    """
    try:
        logger.info(f"PHI Query: lat={request.latitude}, lon={request.longitude}, mode={request.mode}")

        # Get engine
        query_engine = get_engine()

        # Validate pillars if provided
        if request.pillars:
            valid_pillars = {"A", "B", "C", "D", "E"}
            invalid = set(request.pillars) - valid_pillars
            if invalid:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid pillars: {invalid}. Must be A, B, C, D, or E"
                )

        # Run query
        start_time = datetime.now()
        result = query_engine.query(
            lat=request.latitude,
            lon=request.longitude,
            mode=request.mode,
            temporal=request.temporal,
            buffer_radius=request.buffer_radius,
            pillars=request.pillars,
            include_scores=True,
            include_raw=True,
            parallel=True
        )
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"PHI Query completed in {elapsed:.1f} seconds")

        return result

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query PHI data: {str(e)}"
        )


@app.get("/api/phi/metrics", tags=["PHI Query"])
async def get_available_metrics(mode: str = "comprehensive"):
    """
    Get list of available metrics by pillar.

    Returns the metrics that will be queried for each pillar
    in the specified mode.
    """
    try:
        query_engine = get_engine()
        return query_engine.get_available_metrics(mode=mode)
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize GEE on startup."""
    logger.info("Starting Planetary Health Index API...")
    try:
        get_engine()
        logger.info("API ready to accept requests")
    except Exception as e:
        logger.warning(f"GEE initialization deferred: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
