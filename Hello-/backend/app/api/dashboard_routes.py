"""
Dashboard API Routes.

Unified endpoints for real-time + satellite data dashboard.

Endpoints:
- /dashboard/all - Get ALL data for a location
- /dashboard/realtime - Get real-time weather + AQI (poll frequently)
- /dashboard/satellite - Get satellite/PHI data (poll daily)
- /dashboard/weather/history - Historical weather data
- /dashboard/aqi/history - Historical air quality data
- /dashboard/status - Service status
"""

from fastapi import APIRouter, Query, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.services.dashboard_service import get_dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ==================== RESPONSE MODELS ====================

class LocationModel(BaseModel):
    """Location information."""
    latitude: float
    longitude: float


class DashboardResponse(BaseModel):
    """Standard dashboard response."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    sources: List[str] = []
    cached: bool = False
    timestamp: Optional[str] = None
    error: Optional[str] = None


class HistoryResponse(BaseModel):
    """Historical data response."""
    success: bool
    data: List[Dict[str, Any]] = []
    count: int = 0
    time_range: str = ""
    error: Optional[str] = None


class StatusResponse(BaseModel):
    """Service status response."""
    status: str
    gee_available: bool
    polling_active: bool
    cache_stats: Dict[str, Any] = {}
    db_stats: Dict[str, Any] = {}


# ==================== MAIN ENDPOINTS ====================

@router.get("/all", response_model=DashboardResponse)
async def get_all_dashboard_data(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    include_satellite: bool = Query(True, description="Include satellite/PHI data"),
    include_history: bool = Query(True, description="Include historical data"),
    history_hours: int = Query(24, ge=1, le=168, description="Hours of history to include")
):
    """
    Get ALL dashboard data for a location.

    Returns combined:
    - Real-time weather (Open-Meteo)
    - Real-time air quality (Open-Meteo)
    - Satellite/PHI data (GEE) - optional
    - Historical trends (SQLite) - optional

    Note: Satellite data query takes 15-30 seconds on first request.
    """
    try:
        service = get_dashboard_service()
        data = await service.get_all_data(
            lat=lat,
            lon=lon,
            include_satellite=include_satellite,
            include_history=include_history,
            history_hours=history_hours
        )

        return DashboardResponse(
            success=True,
            data=data,
            sources=data.get("sources", []),
            timestamp=data.get("timestamp")
        )

    except Exception as e:
        return DashboardResponse(
            success=False,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )


@router.get("/realtime", response_model=DashboardResponse)
async def get_realtime_data(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude")
):
    """
    Get real-time weather + air quality data.

    Fast endpoint for frequent polling (every 1-5 minutes).
    Uses Open-Meteo APIs (FREE, no key required).

    Data includes:
    - Temperature, humidity, pressure, wind
    - Weather conditions and description
    - AQI, PM2.5, PM10, ozone
    - UV index
    """
    try:
        service = get_dashboard_service()
        data = await service.get_realtime_combined(lat, lon)

        return DashboardResponse(
            success=True,
            data=data,
            sources=data.get("sources", []),
            cached=data.get("weather", {}).get("cached", False),
            timestamp=data.get("timestamp")
        )

    except Exception as e:
        return DashboardResponse(
            success=False,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )


@router.get("/weather", response_model=DashboardResponse)
async def get_weather_data(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180)
):
    """
    Get current weather data only.

    Returns detailed weather information from Open-Meteo.
    """
    try:
        service = get_dashboard_service()
        data = await service.get_realtime_weather(lat, lon)

        return DashboardResponse(
            success=data.get("available", False),
            data=data,
            sources=[data.get("source", "open_meteo_weather")],
            cached=data.get("cached", False),
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        return DashboardResponse(
            success=False,
            error=str(e)
        )


@router.get("/aqi", response_model=DashboardResponse)
async def get_aqi_data(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180)
):
    """
    Get current air quality data only.

    Returns AQI, pollutants, and UV index from Open-Meteo.
    """
    try:
        service = get_dashboard_service()
        data = await service.get_realtime_aqi(lat, lon)

        return DashboardResponse(
            success=data.get("available", False),
            data=data,
            sources=[data.get("source", "open_meteo")],
            cached=data.get("cached", False),
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        return DashboardResponse(
            success=False,
            error=str(e)
        )


@router.get("/satellite", response_model=DashboardResponse)
async def get_satellite_data(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    mode: str = Query("comprehensive", description="Query mode: 'simple' or 'comprehensive'"),
    force_refresh: bool = Query(False, description="Skip cache and fetch fresh data")
):
    """
    Get satellite/PHI data from Google Earth Engine.

    Returns Planetary Health Index across 5 pillars:
    - A: Atmospheric (AOD, AQI)
    - B: Biodiversity (NDVI, EVI, LAI)
    - C: Carbon (Tree Cover, Biomass)
    - D: Degradation (LST, Soil Moisture)
    - E: Ecosystem (Population, Nightlights)

    **Note**: First request takes 15-30 seconds.
    Subsequent requests are cached for 24 hours.
    """
    try:
        service = get_dashboard_service()
        data = await service.get_satellite_data(
            lat=lat,
            lon=lon,
            mode=mode,
            force_refresh=force_refresh
        )

        return DashboardResponse(
            success=data.get("available", False),
            data=data,
            sources=[data.get("source", "google_earth_engine")],
            cached=data.get("cached", False),
            timestamp=data.get("timestamp"),
            error=data.get("error")
        )

    except Exception as e:
        return DashboardResponse(
            success=False,
            error=str(e)
        )


# ==================== HISTORY ENDPOINTS ====================

@router.get("/weather/history", response_model=HistoryResponse)
async def get_weather_history(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    hours: int = Query(24, ge=1, le=168, description="Hours of history (max 7 days)")
):
    """
    Get historical weather data from SQLite.

    Returns stored weather readings for trend graphs.
    """
    try:
        service = get_dashboard_service()
        data = await service.get_weather_history(lat, lon, hours)

        return HistoryResponse(
            success=True,
            data=data,
            count=len(data),
            time_range=f"{hours} hours"
        )

    except Exception as e:
        return HistoryResponse(
            success=False,
            error=str(e)
        )


@router.get("/aqi/history", response_model=HistoryResponse)
async def get_aqi_history(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    hours: int = Query(24, ge=1, le=168, description="Hours of history (max 7 days)")
):
    """
    Get historical air quality data from SQLite.

    Returns stored AQI readings for trend graphs.
    """
    try:
        service = get_dashboard_service()
        data = await service.get_aqi_history(lat, lon, hours)

        return HistoryResponse(
            success=True,
            data=data,
            count=len(data),
            time_range=f"{hours} hours"
        )

    except Exception as e:
        return HistoryResponse(
            success=False,
            error=str(e)
        )


@router.get("/satellite/history", response_model=HistoryResponse)
async def get_satellite_history(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    days: int = Query(7, ge=1, le=30, description="Days of history (max 30 days)")
):
    """
    Get historical satellite/PHI data from SQLite.

    Returns stored PHI snapshots for trend analysis.
    """
    try:
        service = get_dashboard_service()
        data = await service.get_satellite_history(lat, lon, days)

        return HistoryResponse(
            success=True,
            data=data,
            count=len(data),
            time_range=f"{days} days"
        )

    except Exception as e:
        return HistoryResponse(
            success=False,
            error=str(e)
        )


# ==================== CONTROL ENDPOINTS ====================

@router.post("/polling/start")
async def start_polling(
    background_tasks: BackgroundTasks,
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    interval: int = Query(300, ge=60, le=300, description="Polling interval in seconds (1-5 min)")
):
    """
    Start background polling for a location.

    Automatically fetches real-time data at specified interval.
    Data is stored in SQLite for historical trends.
    """
    service = get_dashboard_service()

    background_tasks.add_task(
        service.start_polling,
        lat, lon, interval
    )

    return {
        "status": "polling_started",
        "location": {"latitude": lat, "longitude": lon},
        "interval_seconds": interval
    }


@router.post("/polling/stop")
async def stop_polling():
    """Stop background polling."""
    service = get_dashboard_service()
    await service.stop_polling()

    return {"status": "polling_stopped"}


# ==================== STORED DATA ENDPOINTS ====================

@router.get("/stored", response_model=DashboardResponse)
async def get_stored_data(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180)
):
    """
    Get stored satellite/PHI data from database WITHOUT fetching from GEE.

    This is fast - just reads from SQLite.
    Use this for initial page load, then fetch live weather/AQI separately.
    """
    try:
        service = get_dashboard_service()

        # Get latest stored satellite data
        stored = await service.db.get_latest_satellite(lat, lon)

        if stored:
            # Parse raw_data JSON to get full pillars
            raw_data = None
            if stored.get("raw_data"):
                import json
                try:
                    raw_data = json.loads(stored["raw_data"])
                except:
                    pass

            return DashboardResponse(
                success=True,
                data={
                    "available": True,
                    "source": "database",
                    "stored": True,
                    "timestamp": stored.get("timestamp"),
                    "pillars": raw_data.get("pillars") if raw_data else None,
                    "summary": raw_data.get("summary") if raw_data else {
                        "overall_score": stored.get("overall_score"),
                        "pillar_scores": {
                            "A": stored.get("pillar_a_score"),
                            "B": stored.get("pillar_b_score"),
                            "C": stored.get("pillar_c_score"),
                            "D": stored.get("pillar_d_score"),
                            "E": stored.get("pillar_e_score"),
                        },
                        "ecosystem_type": stored.get("ecosystem_type"),
                    },
                    "key_metrics": {
                        "ndvi": stored.get("ndvi"),
                        "evi": stored.get("evi"),
                        "tree_cover": stored.get("tree_cover"),
                        "soil_moisture": stored.get("soil_moisture"),
                        "lst": stored.get("lst"),
                        "aod": stored.get("aod"),
                        "population": stored.get("population"),
                        "nightlights": stored.get("nightlights"),
                        "human_modification": stored.get("human_modification"),
                    }
                },
                sources=["database"],
                cached=True,
                timestamp=stored.get("timestamp")
            )
        else:
            return DashboardResponse(
                success=False,
                data={"available": False, "stored": False},
                sources=[],
                error="No stored data found for this location. Fetch satellite data first."
            )

    except Exception as e:
        return DashboardResponse(
            success=False,
            error=str(e)
        )


@router.post("/store")
async def store_location_data(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    name: str = Query("Dashboard Location", description="Location name")
):
    """
    Register a location and fetch initial data.

    This stores the location in DB and fetches satellite data once.
    Future requests to /stored will return this data instantly.
    """
    try:
        service = get_dashboard_service()

        # Add location to tracking
        location_id = await service.db.add_location(name, lat, lon)

        # Fetch and store satellite data (this takes time)
        satellite = await service.get_satellite_data(lat, lon, mode="comprehensive")

        return {
            "success": True,
            "location_id": location_id,
            "message": f"Location '{name}' registered and satellite data stored",
            "satellite_available": satellite.get("available", False)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ==================== STATUS ENDPOINTS ====================

@router.get("/status", response_model=StatusResponse)
async def get_dashboard_status():
    """
    Get dashboard service status.

    Returns information about:
    - GEE availability
    - Cache statistics
    - Polling status
    - Database stats
    """
    service = get_dashboard_service()
    status = service.get_status()
    db_stats = await service.get_db_stats()

    return StatusResponse(
        status=status.get("status", "running"),
        gee_available=status.get("gee_available", False),
        polling_active=status.get("polling_active", False),
        cache_stats={
            "realtime": status.get("realtime_cache_stats", {}),
            "satellite": status.get("satellite_cache_stats", {})
        },
        db_stats=db_stats
    )


@router.post("/init")
async def initialize_dashboard():
    """
    Initialize the dashboard service.

    Creates database tables and initializes services.
    Called automatically on first request, but can be called manually.
    """
    try:
        service = get_dashboard_service()
        await service.initialize()

        return {
            "status": "initialized",
            "message": "Dashboard service initialized successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize dashboard: {str(e)}"
        )
