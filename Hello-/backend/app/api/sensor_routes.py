"""
Sensor Data API Routes.

Provides REST endpoints for accessing cached sensor data from Firestore.
All data is cached for 30 minutes to minimize Firestore API costs.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

from app.services.sensor_service import (
    get_latest_readings,
    get_latest_reading,
    get_daily_aggregates,
    get_readings_by_date_range,
    refresh_cache,
    get_cache_status
)


router = APIRouter()


class SensorType(str, Enum):
    indoor = "indoor"
    outdoor = "outdoor"


class SensorReading(BaseModel):
    """Model for a sensor reading."""
    id: str
    co2: float
    temperature: float
    humidity: float
    pressure: float
    light: float
    device: str
    time: str
    createdAt: Optional[str] = None


class DailyAggregate(BaseModel):
    """Model for daily aggregated data."""
    date: str
    avgCo2: float
    avgTemperature: float
    avgHumidity: float
    avgPressure: float
    avgLight: float
    readingCount: int


class SensorDataResponse(BaseModel):
    """Response model for sensor data endpoints."""
    success: bool
    data: Optional[List[Dict[str, Any]]] = None
    latest: Optional[Dict[str, Any]] = None
    dailyAggregates: Optional[List[Dict[str, Any]]] = None
    cached: bool = True
    error: Optional[str] = None


class CacheStatusResponse(BaseModel):
    """Response model for cache status."""
    status: str
    ttl_minutes: float
    cache_info: Dict[str, Any]


@router.get("/sensors/{sensor_type}/readings", response_model=SensorDataResponse)
async def get_sensor_readings(
    sensor_type: SensorType,
    limit: int = Query(default=50, ge=1, le=200, description="Number of readings to fetch")
):
    """
    Get latest sensor readings.

    Data is cached for 30 minutes to reduce Firestore costs.

    Args:
        sensor_type: 'indoor' or 'outdoor'
        limit: Number of readings (default 50, max 200)

    Returns:
        List of sensor readings with cache status
    """
    try:
        readings = await get_latest_readings(sensor_type.value, limit)
        return SensorDataResponse(
            success=True,
            data=readings,
            cached=True
        )
    except Exception as e:
        return SensorDataResponse(
            success=False,
            error=str(e)
        )


@router.get("/sensors/{sensor_type}/latest", response_model=SensorDataResponse)
async def get_sensor_latest(sensor_type: SensorType):
    """
    Get the most recent sensor reading.

    Args:
        sensor_type: 'indoor' or 'outdoor'

    Returns:
        Latest sensor reading
    """
    try:
        latest = await get_latest_reading(sensor_type.value)
        return SensorDataResponse(
            success=True,
            latest=latest,
            cached=True
        )
    except Exception as e:
        return SensorDataResponse(
            success=False,
            error=str(e)
        )


@router.get("/sensors/{sensor_type}/aggregates", response_model=SensorDataResponse)
async def get_sensor_aggregates(
    sensor_type: SensorType,
    days: int = Query(default=7, ge=1, le=30, description="Number of days to aggregate")
):
    """
    Get daily aggregated sensor data for charts.

    Args:
        sensor_type: 'indoor' or 'outdoor'
        days: Number of days (default 7, max 30)

    Returns:
        Daily averages for all metrics
    """
    try:
        aggregates = await get_daily_aggregates(sensor_type.value, days)
        return SensorDataResponse(
            success=True,
            dailyAggregates=aggregates,
            cached=True
        )
    except Exception as e:
        return SensorDataResponse(
            success=False,
            error=str(e)
        )


@router.get("/sensors/{sensor_type}/all", response_model=SensorDataResponse)
async def get_all_sensor_data(
    sensor_type: SensorType,
    limit: int = Query(default=50, ge=1, le=200),
    days: int = Query(default=7, ge=1, le=30)
):
    """
    Get all sensor data in a single request (readings, latest, aggregates).

    This is the most efficient endpoint for dashboard pages as it
    combines all data in one API call.

    Args:
        sensor_type: 'indoor' or 'outdoor'
        limit: Number of readings
        days: Number of days for aggregates

    Returns:
        Complete sensor data package
    """
    try:
        readings = await get_latest_readings(sensor_type.value, limit)
        latest = await get_latest_reading(sensor_type.value)
        aggregates = await get_daily_aggregates(sensor_type.value, days)

        return SensorDataResponse(
            success=True,
            data=readings,
            latest=latest,
            dailyAggregates=aggregates,
            cached=True
        )
    except Exception as e:
        return SensorDataResponse(
            success=False,
            error=str(e)
        )


@router.get("/sensors/compare", response_model=Dict[str, SensorDataResponse])
async def compare_sensor_data(
    limit: int = Query(default=50, ge=1, le=200),
    days: int = Query(default=7, ge=1, le=30)
):
    """
    Get both indoor and outdoor sensor data for comparison.

    Args:
        limit: Number of readings per type
        days: Number of days for aggregates

    Returns:
        Indoor and outdoor data in a single response
    """
    try:
        indoor_readings = await get_latest_readings("indoor", limit)
        indoor_latest = await get_latest_reading("indoor")
        indoor_aggregates = await get_daily_aggregates("indoor", days)

        outdoor_readings = await get_latest_readings("outdoor", limit)
        outdoor_latest = await get_latest_reading("outdoor")
        outdoor_aggregates = await get_daily_aggregates("outdoor", days)

        return {
            "indoor": SensorDataResponse(
                success=True,
                data=indoor_readings,
                latest=indoor_latest,
                dailyAggregates=indoor_aggregates,
                cached=True
            ),
            "outdoor": SensorDataResponse(
                success=True,
                data=outdoor_readings,
                latest=outdoor_latest,
                dailyAggregates=outdoor_aggregates,
                cached=True
            )
        }
    except Exception as e:
        return {
            "indoor": SensorDataResponse(success=False, error=str(e)),
            "outdoor": SensorDataResponse(success=False, error=str(e))
        }


@router.post("/sensors/refresh")
async def refresh_sensor_cache(
    sensor_type: Optional[SensorType] = None
):
    """
    Force refresh of cached sensor data.

    Use this endpoint to clear cache and fetch fresh data
    from Firestore before the 30-minute TTL expires.

    Args:
        sensor_type: Optional specific type to refresh (or all if not specified)

    Returns:
        Cache status after refresh
    """
    result = refresh_cache(sensor_type.value if sensor_type else None)
    return result


@router.get("/sensors/cache/status", response_model=CacheStatusResponse)
async def get_sensor_cache_status():
    """
    Get current cache status and statistics.

    Returns:
        Cache TTL, cached keys, and other info
    """
    return get_cache_status()
