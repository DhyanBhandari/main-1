"""
API Routes for Planetary Health Web Application.

Endpoints:
    POST /api/query - Query satellite data for a location
    POST /api/pdf - Generate and download PDF report
    GET /api/health - Health check
    GET /api/history - Get user's query history
    GET /api/external/air-quality - Get real-time air quality from external APIs
    GET /api/external/weather - Get weather forecast data
    GET /api/external/soil - Get soil moisture and temperature
    GET /api/external/comprehensive - Get all external data
    GET /api/imagery - Get remote sensing imagery URLs
    GET /api/imagery/types - Get available imagery types
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Query
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
import traceback

from app.services.earth_engine import query_location, is_initialized
from app.services.database import (
    log_query,
    get_user_query_history,
    get_query_by_id,
    update_pdf_status,
    mark_pdf_downloaded,
    upload_pdf_to_storage,
    get_user_stats
)
from app.api.pdf_generator import generate_report_pdf

router = APIRouter()


class QueryRequest(BaseModel):
    """Request model for location queries with user tracking."""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    mode: str = Field(default="simple", description="Query mode: 'simple' or 'comprehensive'")
    include_scores: bool = Field(default=True, description="Include pillar scores")
    # User tracking fields
    user_id: str = Field(default="anonymous", description="Firebase user ID")
    user_email: Optional[str] = Field(default=None, description="User email")


class QueryResponse(BaseModel):
    """Response model for location queries."""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    query_id: Optional[str] = None
    location_name: Optional[str] = None


class HistoryResponse(BaseModel):
    """Response model for query history."""
    queries: list
    total: int
    page: int
    per_page: int
    has_more: bool


@router.get("/health")
async def health_check():
    """API health check with Earth Engine status."""
    return {
        "status": "healthy",
        "earth_engine": "initialized" if is_initialized() else "not_initialized"
    }


@router.post("/query", response_model=QueryResponse)
async def query_satellite_data(request: QueryRequest, http_request: Request, background_tasks: BackgroundTasks):
    """
    Query satellite data for a location with Open-Meteo fallbacks.

    Returns all 5 planetary health pillars:
    - A: Atmospheric (AOD, AQI, UV)
    - B: Biodiversity (NDVI, EVI, LAI)
    - C: Carbon (Tree Cover, Biomass)
    - D: Degradation (LST, Soil Moisture)
    - E: Ecosystem (Population, Nightlights)

    Also includes weather data from Open-Meteo for enhanced metrics.
    """
    try:
        # Get client IP for logging
        client_ip = None
        if http_request.client:
            client_ip = http_request.client.host

        # Query Earth Engine
        result = query_location(
            lat=request.lat,
            lon=request.lon,
            mode=request.mode,
            include_scores=request.include_scores
        )

        # Fetch Open-Meteo data for fallbacks and weather info
        try:
            from app.services.external_apis.aggregator import get_aggregator
            aggregator = get_aggregator()

            # Get comprehensive external data (air quality + weather + soil)
            external_data = await aggregator.get_comprehensive_data(request.lat, request.lon)

            # Apply fallbacks for N/A metrics
            result = apply_open_meteo_fallbacks(result, external_data)

            # Add weather data to result
            result["weather"] = external_data.get("weather", {})
            result["external_sources"] = external_data.get("sources", [])

        except Exception as ext_error:
            print(f"External API fallback error: {ext_error}")
            # Continue without external data - satellite data still available

        # Log query with user tracking (returns query_id)
        query_id = await log_query(
            lat=request.lat,
            lon=request.lon,
            result=result,
            user_id=request.user_id,
            user_email=request.user_email,
            mode=request.mode,
            ip_address=client_ip
        )

        return QueryResponse(
            success=True,
            data=result,
            query_id=query_id
        )

    except Exception as e:
        traceback.print_exc()
        return QueryResponse(
            success=False,
            error=str(e)
        )


def apply_open_meteo_fallbacks(result: dict, external_data: dict) -> dict:
    """
    Apply Open-Meteo data to supplement satellite metrics.

    Adds ALL environmental metrics from Open-Meteo to appropriate pillars:
    - Pillar A: Atmospheric (visibility, humidity, clouds, pressure, wind, temp)
    - Pillar D: Degradation (soil moisture depths, soil temp, ET, VPD)

    Args:
        result: Satellite query result
        external_data: Open-Meteo comprehensive data

    Returns:
        Result with all metrics added to pillars
    """
    weather = external_data.get("weather", {})
    air_quality = external_data.get("air_quality", {})
    soil = external_data.get("soil", {})

    if not weather.get("available"):
        return result

    pillars = result.get("pillars", {})
    current = weather.get("current", {})
    hourly = weather.get("hourly", {})

    # ========================================
    # PILLAR A: Atmospheric Quality (12 metrics)
    # ========================================
    for key, pillar_data in pillars.items():
        if key.startswith("A_") or "atmospheric" in key.lower():
            metrics = pillar_data.get("metrics", {})

            # AQI from Open-Meteo Air Quality
            if air_quality.get("primary_aqi"):
                metrics["aqi"] = {
                    "value": air_quality.get("primary_aqi"),
                    "unit": "US AQI",
                    "description": "Air Quality Index",
                    "source": "Open-Meteo",
                    "quality": "good" if air_quality.get("confidence") == "high" else "moderate"
                }

            # UV Index
            uv_data = air_quality.get("uv_index") or {}
            if uv_data.get("value") is not None:
                uv_val = uv_data.get("value")
                uv_category = "Low" if uv_val < 3 else "Moderate" if uv_val < 6 else "High" if uv_val < 8 else "Very High" if uv_val < 11 else "Extreme"
                metrics["uv_index"] = {
                    "value": uv_val,
                    "category": uv_category,
                    "unit": "index",
                    "description": f"UV Index ({uv_category})",
                    "source": "Open-Meteo",
                    "quality": "good"
                }

            # Visibility
            if hourly.get("visibility") and len(hourly.get("visibility", [])) > 0:
                vis_val = hourly["visibility"][0]
                if vis_val is not None:
                    metrics["visibility"] = {
                        "value": vis_val / 1000,  # Convert m to km
                        "unit": "km",
                        "description": "Visibility Distance",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }

            # Humidity
            humidity = current.get("humidity", {}).get("value")
            if humidity is not None:
                metrics["humidity"] = {
                    "value": humidity,
                    "unit": "%",
                    "description": "Relative Humidity",
                    "source": "Open-Meteo",
                    "quality": "good"
                }

            # Cloud Cover (total)
            cloud_cover = current.get("cloud_cover", {}).get("value")
            if cloud_cover is not None:
                metrics["cloud_cover"] = {
                    "value": cloud_cover,
                    "unit": "%",
                    "description": "Total Cloud Cover",
                    "source": "Open-Meteo",
                    "quality": "good"
                }

            # Cloud layers (low, mid, high)
            if hourly.get("cloud_cover_low") and len(hourly.get("cloud_cover_low", [])) > 0:
                metrics["cloud_cover_low"] = {
                    "value": hourly["cloud_cover_low"][0],
                    "unit": "%",
                    "description": "Low Cloud Cover (0-3km)",
                    "source": "Open-Meteo",
                    "quality": "good"
                }
            if hourly.get("cloud_cover_mid") and len(hourly.get("cloud_cover_mid", [])) > 0:
                metrics["cloud_cover_mid"] = {
                    "value": hourly["cloud_cover_mid"][0],
                    "unit": "%",
                    "description": "Mid Cloud Cover (3-8km)",
                    "source": "Open-Meteo",
                    "quality": "good"
                }
            if hourly.get("cloud_cover_high") and len(hourly.get("cloud_cover_high", [])) > 0:
                metrics["cloud_cover_high"] = {
                    "value": hourly["cloud_cover_high"][0],
                    "unit": "%",
                    "description": "High Cloud Cover (8km+)",
                    "source": "Open-Meteo",
                    "quality": "good"
                }

            # Pressure
            pressure = current.get("pressure", {})
            if pressure.get("surface") is not None:
                metrics["pressure"] = {
                    "value": pressure.get("surface"),
                    "unit": "hPa",
                    "description": "Surface Pressure",
                    "source": "Open-Meteo",
                    "quality": "good"
                }

            # Wind Speed & Direction
            wind = current.get("wind", {})
            if wind.get("speed") is not None:
                wind_dir = wind.get("direction", 0)
                directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
                dir_index = int((wind_dir + 22.5) % 360 // 45)
                dir_text = directions[dir_index]
                metrics["wind_speed"] = {
                    "value": wind.get("speed"),
                    "direction": wind_dir,
                    "direction_text": dir_text,
                    "unit": "km/h",
                    "description": f"Wind Speed ({dir_text})",
                    "source": "Open-Meteo",
                    "quality": "good"
                }

            # Temperature
            temp = current.get("temperature", {}).get("value")
            if temp is not None:
                feels_like = current.get("temperature", {}).get("feels_like")
                metrics["temperature"] = {
                    "value": temp,
                    "feels_like": feels_like,
                    "unit": "°C",
                    "description": "Air Temperature",
                    "source": "Open-Meteo",
                    "quality": "good"
                }

    # ========================================
    # PILLAR D: Land Degradation (12 metrics)
    # ========================================
    for key, pillar_data in pillars.items():
        if key.startswith("D_") or "degradation" in key.lower():
            metrics = pillar_data.get("metrics", {})

            # LST fallback from current temperature
            temp = current.get("temperature", {}).get("value")
            if metrics.get("lst", {}).get("value") is None and temp is not None:
                metrics["lst"] = {
                    "value": temp,
                    "unit": "°C",
                    "description": "Land Surface Temperature",
                    "source": "Open-Meteo",
                    "quality": "moderate"
                }

            # Soil Moisture - Average
            soil_moisture = soil.get("soil_moisture", {}).get("value")
            if soil_moisture is not None:
                metrics["soil_moisture"] = {
                    "value": round(soil_moisture * 100, 1),  # Convert to %
                    "unit": "%",
                    "description": "Soil Moisture (Average)",
                    "source": "Open-Meteo",
                    "quality": "good"
                }

            # Soil Moisture at different depths
            if hourly.get("soil_moisture_0_to_1cm") and len(hourly.get("soil_moisture_0_to_1cm", [])) > 0:
                val = hourly["soil_moisture_0_to_1cm"][0]
                if val is not None:
                    metrics["soil_moisture_0_1cm"] = {
                        "value": round(val * 100, 1),
                        "unit": "%",
                        "description": "Soil Moisture (0-1cm)",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }
            if hourly.get("soil_moisture_1_to_3cm") and len(hourly.get("soil_moisture_1_to_3cm", [])) > 0:
                val = hourly["soil_moisture_1_to_3cm"][0]
                if val is not None:
                    metrics["soil_moisture_1_3cm"] = {
                        "value": round(val * 100, 1),
                        "unit": "%",
                        "description": "Soil Moisture (1-3cm)",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }
            if hourly.get("soil_moisture_3_to_9cm") and len(hourly.get("soil_moisture_3_to_9cm", [])) > 0:
                val = hourly["soil_moisture_3_to_9cm"][0]
                if val is not None:
                    metrics["soil_moisture_3_9cm"] = {
                        "value": round(val * 100, 1),
                        "unit": "%",
                        "description": "Soil Moisture (3-9cm)",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }
            if hourly.get("soil_moisture_9_to_27cm") and len(hourly.get("soil_moisture_9_to_27cm", [])) > 0:
                val = hourly["soil_moisture_9_to_27cm"][0]
                if val is not None:
                    metrics["soil_moisture_9_27cm"] = {
                        "value": round(val * 100, 1),
                        "unit": "%",
                        "description": "Soil Moisture (9-27cm)",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }

            # Soil Temperature at different depths
            if hourly.get("soil_temperature_0cm") and len(hourly.get("soil_temperature_0cm", [])) > 0:
                val = hourly["soil_temperature_0cm"][0]
                if val is not None:
                    metrics["soil_temp_surface"] = {
                        "value": val,
                        "unit": "°C",
                        "description": "Soil Temperature (Surface)",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }
            if hourly.get("soil_temperature_6cm") and len(hourly.get("soil_temperature_6cm", [])) > 0:
                val = hourly["soil_temperature_6cm"][0]
                if val is not None:
                    metrics["soil_temp_6cm"] = {
                        "value": val,
                        "unit": "°C",
                        "description": "Soil Temperature (6cm depth)",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }

            # Evapotranspiration
            if hourly.get("evapotranspiration") and len(hourly.get("evapotranspiration", [])) > 0:
                val = hourly["evapotranspiration"][0]
                if val is not None:
                    metrics["evapotranspiration"] = {
                        "value": val,
                        "unit": "mm",
                        "description": "Evapotranspiration",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }

            # Vapor Pressure Deficit
            vpd = hourly.get("vapour_pressure_deficit")
            if vpd and len(vpd) > 0:
                vpd_current = vpd[0]
                if vpd_current is not None:
                    metrics["vapor_pressure_deficit"] = {
                        "value": vpd_current,
                        "unit": "kPa",
                        "description": "Vapor Pressure Deficit",
                        "source": "Open-Meteo",
                        "quality": "good"
                    }

                    # Also calculate evaporative stress from VPD
                    esi = (vpd_current - 1.0) / 1.5
                    esi = max(-2, min(2, esi))
                    metrics["evaporative_stress"] = {
                        "value": round(esi, 2),
                        "unit": "index",
                        "description": "Evaporative Stress Index",
                        "source": "Calculated",
                        "quality": "moderate"
                    }

            # Drought index calculation
            sm = metrics.get("soil_moisture", {}).get("value")
            lst = metrics.get("lst", {}).get("value")
            if sm is not None and lst is not None:
                sm_val = sm / 100 if sm > 1 else sm  # Normalize if percentage
                sm_norm = (sm_val - 0.2) / 0.3
                lst_norm = (lst - 25) / 15
                drought_index = -sm_norm + (lst_norm * 0.5)
                drought_index = max(-3, min(3, drought_index))

                metrics["drought_index"] = {
                    "value": round(drought_index, 2),
                    "unit": "index",
                    "description": "Drought Index",
                    "interpretation": interpret_drought(drought_index),
                    "source": "Calculated",
                    "quality": "moderate"
                }

    return result


def interpret_drought(value: float) -> str:
    """Interpret drought index value."""
    if value < -1.5:
        return "Very Wet"
    elif value < -0.5:
        return "Wet"
    elif value < 0.5:
        return "Normal"
    elif value < 1.5:
        return "Dry"
    else:
        return "Severe Drought"


@router.post("/pdf")
async def generate_pdf_report(request: QueryRequest, http_request: Request, background_tasks: BackgroundTasks):
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
        # Get client IP
        client_ip = None
        if http_request.client:
            client_ip = http_request.client.host

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

        # Log query with user tracking
        query_id = await log_query(
            lat=request.lat,
            lon=request.lon,
            result=result,
            user_id=request.user_id,
            user_email=request.user_email,
            report_generated=True,
            mode="comprehensive",
            ip_address=client_ip
        )

        # Upload PDF to storage and update record (if user is authenticated)
        if query_id and request.user_id != "anonymous":
            filename = f"planetary_health_{request.lat:.4f}_{request.lon:.4f}.pdf"
            pdf_url = await upload_pdf_to_storage(pdf_path, request.user_id, filename)
            if pdf_url:
                await update_pdf_status(query_id, pdf_url, filename)

        return FileResponse(
            path=pdf_path,
            filename=f"planetary_health_{request.lat:.4f}_{request.lon:.4f}.pdf",
            media_type="application/pdf"
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=HistoryResponse)
async def get_query_history(
    user_id: str = Query(..., description="Firebase user ID"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page")
):
    """
    Get paginated query history for a user.

    Returns list of past queries with location, score, and PDF status.
    """
    result = await get_user_query_history(
        user_id=user_id,
        page=page,
        per_page=per_page
    )
    return HistoryResponse(**result)


@router.get("/query/{query_id}")
async def get_query_details(query_id: str):
    """
    Get details of a specific query by ID.
    """
    query = await get_query_by_id(query_id)
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    return query


@router.post("/query/{query_id}/downloaded")
async def mark_query_downloaded(query_id: str):
    """
    Mark a PDF as downloaded and increment download count.
    """
    success = await mark_pdf_downloaded(query_id)
    if not success:
        raise HTTPException(status_code=404, detail="Query not found or update failed")
    return {"success": True, "query_id": query_id}


@router.get("/user/{user_id}/stats")
async def get_user_statistics(user_id: str):
    """
    Get statistics for a specific user.
    """
    stats = await get_user_stats(user_id)
    if "error" in stats:
        raise HTTPException(status_code=500, detail=stats["error"])
    return stats


@router.get("/external/air-quality")
async def get_external_air_quality(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude")
):
    """
    Get real-time air quality from external APIs (Open-Meteo + OpenAQ).

    Returns:
    - Real-time AQI from Open-Meteo (model-based, always available)
    - Ground-truth AQI from OpenAQ (if monitoring stations nearby)
    - PM2.5, PM10, O3, NO2, CO values
    - UV Index
    """
    try:
        from app.services.external_apis.aggregator import get_realtime_aqi
        data = await get_realtime_aqi(lat, lon)
        return data
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="External API service not available"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/external/status")
async def get_external_api_status():
    """
    Get status of external API services.
    """
    try:
        from app.services.external_apis.aggregator import get_aggregator
        aggregator = get_aggregator()
        return aggregator.get_api_status()
    except ImportError:
        return {"error": "External API service not available"}
    except Exception as e:
        return {"error": str(e)}


@router.get("/external/weather")
async def get_weather_data(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    forecast_days: int = Query(7, ge=1, le=16, description="Number of forecast days")
):
    """
    Get comprehensive weather forecast data from Open-Meteo.

    Returns:
    - Current weather conditions (temperature, humidity, wind, etc.)
    - Hourly forecast (7 days) with soil data
    - Daily forecast (temperature, UV, precipitation, sunrise/sunset)

    All data is free and requires no API key.
    """
    try:
        from app.services.external_apis.aggregator import get_weather_forecast
        data = await get_weather_forecast(lat, lon, days=forecast_days)
        return data
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Weather API service not available"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/external/soil")
async def get_soil_data(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude")
):
    """
    Get soil moisture and temperature data.

    Returns:
    - Soil moisture at multiple depths (0-1cm, 1-3cm, 3-9cm, 9-27cm)
    - Soil temperature at surface and depth
    - Average soil moisture value

    This data can be used to supplement satellite soil data that may have gaps.
    """
    try:
        from app.services.external_apis.aggregator import get_soil_conditions
        data = await get_soil_conditions(lat, lon)
        return data
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Soil data service not available"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/external/comprehensive")
async def get_comprehensive_external_data(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude")
):
    """
    Get all external data in one request.

    Returns combined data from:
    - Air quality (Open-Meteo + OpenAQ)
    - Weather forecast (Open-Meteo)
    - Soil conditions (Open-Meteo)

    This is the most efficient way to get all external data at once.
    """
    try:
        from app.services.external_apis.aggregator import get_all_external_data
        data = await get_all_external_data(lat, lon)
        return data
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="External data service not available"
        )
    except Exception as e:
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
        },
        "external_apis": {
            "open_meteo_air_quality": "Real-time air quality (model-based)",
            "open_meteo_weather": "Weather forecasts, soil data, UV index",
            "openaq": "Ground-truth air quality (monitoring stations)"
        },
        "weather_variables": {
            "current": ["temperature", "humidity", "wind", "precipitation", "cloud_cover", "pressure"],
            "hourly": ["temperature", "precipitation", "soil_moisture", "soil_temperature", "visibility", "evapotranspiration"],
            "daily": ["temperature_max", "temperature_min", "uv_index_max", "sunrise", "sunset", "precipitation_sum"]
        }
    }


@router.get("/imagery")
async def get_imagery(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    buffer_km: float = Query(5.0, ge=1, le=50, description="Buffer radius in km"),
    image_size: int = Query(512, ge=256, le=1024, description="Image size in pixels")
):
    """
    Get remote sensing imagery URLs for a location.

    Returns thumbnail URLs for:
    - True Color (Sentinel-2 RGB)
    - NDVI (Vegetation Index)
    - LST (Land Surface Temperature)
    - Land Cover (ESA WorldCover)
    - Forest Cover (Hansen)

    Images are generated via Earth Engine and cached for performance.
    """
    try:
        from app.services.imagery import get_imagery_urls
        data = get_imagery_urls(
            lat=lat,
            lon=lon,
            buffer_km=buffer_km,
            image_size=image_size
        )
        return data
    except ImportError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Imagery service not available: {str(e)}"
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/imagery/types")
async def get_imagery_types():
    """
    Get list of available imagery types with descriptions.

    Returns metadata about each imagery type including:
    - ID and display name
    - Data source
    - Technology used
    - Description
    """
    try:
        from app.services.imagery import get_available_imagery_types
        return {"types": get_available_imagery_types()}
    except ImportError:
        # Return static list if service not available
        return {
            "types": [
                {
                    "id": "true_color",
                    "name": "True Color",
                    "source": "Sentinel-2",
                    "description": "Natural color satellite view (RGB)",
                    "technology": "Multispectral Imaging"
                },
                {
                    "id": "ndvi",
                    "name": "Vegetation Health",
                    "source": "Sentinel-2",
                    "description": "NDVI showing vegetation density and health",
                    "technology": "Multispectral Analysis"
                },
                {
                    "id": "lst",
                    "name": "Surface Temperature",
                    "source": "MODIS",
                    "description": "Land surface temperature heatmap",
                    "technology": "Thermal Imaging"
                },
                {
                    "id": "land_cover",
                    "name": "Land Classification",
                    "source": "ESA WorldCover",
                    "description": "Land use/land cover classification",
                    "technology": "Machine Learning Classification"
                },
                {
                    "id": "forest_cover",
                    "name": "Forest Density",
                    "source": "Hansen/UMD",
                    "description": "Tree canopy cover percentage",
                    "technology": "LiDAR & Optical Analysis"
                }
            ]
        }
