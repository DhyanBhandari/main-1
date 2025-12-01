"""
API Routes for Planetary Health Web Application.

Endpoints:
    POST /api/query - Query satellite data for a location
    POST /api/pdf - Generate and download PDF report
    GET /api/health - Health check
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
import traceback

from app.services.earth_engine import query_location, is_initialized
from app.services.database import log_query
from app.api.pdf_generator import generate_report_pdf

router = APIRouter()


class QueryRequest(BaseModel):
    """Request model for location queries."""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    mode: str = Field(default="simple", description="Query mode: 'simple' or 'comprehensive'")
    include_scores: bool = Field(default=True, description="Include pillar scores")


class QueryResponse(BaseModel):
    """Response model for location queries."""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


@router.get("/health")
async def health_check():
    """API health check with Earth Engine status."""
    return {
        "status": "healthy",
        "earth_engine": "initialized" if is_initialized() else "not_initialized"
    }


@router.post("/query", response_model=QueryResponse)
async def query_satellite_data(request: QueryRequest, background_tasks: BackgroundTasks):
    """
    Query satellite data for a location.

    Returns all 5 planetary health pillars:
    - A: Atmospheric (AOD, AQI, UV)
    - B: Biodiversity (NDVI, EVI, LAI)
    - C: Carbon (Tree Cover, Biomass)
    - D: Degradation (LST, Soil Moisture)
    - E: Ecosystem (Population, Nightlights)
    """
    try:
        # Query Earth Engine
        result = query_location(
            lat=request.lat,
            lon=request.lon,
            mode=request.mode,
            include_scores=request.include_scores
        )

        # Log query in background (non-blocking)
        background_tasks.add_task(
            log_query,
            lat=request.lat,
            lon=request.lon,
            result=result
        )

        return QueryResponse(success=True, data=result)

    except Exception as e:
        traceback.print_exc()
        return QueryResponse(
            success=False,
            error=str(e)
        )


@router.post("/pdf")
async def generate_pdf_report(request: QueryRequest, background_tasks: BackgroundTasks):
    """
    Generate a PDF report for a location.

    Returns a downloadable PDF with:
    - Location map
    - Overall health score
    - 5-pillar radar chart
    - Detailed metrics
    - Recommendations
    """
    try:
        # Query with comprehensive mode for full data
        result = query_location(
            lat=request.lat,
            lon=request.lon,
            mode="comprehensive",
            include_scores=True
        )

        # Generate PDF
        pdf_path = generate_report_pdf(
            lat=request.lat,
            lon=request.lon,
            data=result
        )

        # Log query in background
        background_tasks.add_task(
            log_query,
            lat=request.lat,
            lon=request.lon,
            result=result,
            report_generated=True
        )

        return FileResponse(
            path=pdf_path,
            filename=f"planetary_health_{request.lat:.4f}_{request.lon:.4f}.pdf",
            media_type="application/pdf"
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/datasets")
async def get_available_datasets():
    """Get list of available datasets and their descriptions."""
    return {
        "pillars": {
            "A": {
                "name": "Atmospheric",
                "color": "#3498db",
                "metrics": ["AOD", "AQI", "UV Index", "Cloud Fraction"]
            },
            "B": {
                "name": "Biodiversity",
                "color": "#27ae60",
                "metrics": ["NDVI", "EVI", "LAI", "Land Cover", "FPAR"]
            },
            "C": {
                "name": "Carbon",
                "color": "#8e44ad",
                "metrics": ["Tree Cover", "Forest Loss", "Canopy Height", "Biomass", "Carbon Stock"]
            },
            "D": {
                "name": "Degradation",
                "color": "#e74c3c",
                "metrics": ["LST", "Soil Moisture", "Water Occurrence", "Drought Index", "Evaporative Stress"]
            },
            "E": {
                "name": "Ecosystem",
                "color": "#f39c12",
                "metrics": ["Population", "Nightlights", "Human Modification", "Elevation", "Distance to Water"]
            }
        },
        "modes": {
            "simple": "10 metrics (2 per pillar) - faster queries",
            "comprehensive": "24 metrics (4-5 per pillar) - full analysis"
        }
    }
