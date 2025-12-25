"""
Unified Dashboard Service.

Aggregates data from multiple sources:
- Real-time weather data (Open-Meteo Weather API)
- Air quality data (Open-Meteo AQI API)
- Satellite data (Google Earth Engine via planetary_health_query)

All existing classes are IMPORTED, not recreated.
"""

import asyncio
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

# Import existing Open-Meteo clients
from app.services.external_apis.open_meteo import OpenMeteoAPI
from app.services.external_apis.open_meteo_weather import OpenMeteoWeatherAPI
from app.services.external_apis.cache import ExternalAPICache

# Import dashboard database
from app.models.dashboard_models import DashboardDatabase, get_dashboard_db

# Import Supabase sync for cloud backup
from app.services.dashboard_supabase import (
    sync_satellite_reading,
    get_latest_satellite_from_cloud,
    is_supabase_available,
    get_cloud_stats
)

# Add planetary_health_query to path for importing
HELLO_DIR = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(HELLO_DIR))

# Import GEE Query Engine (lazy import to avoid startup delay)
_gee_engine = None


def get_gee_engine():
    """Lazy initialization of GEE Query Engine."""
    global _gee_engine
    if _gee_engine is None:
        try:
            from planetary_health_query import GEEQueryEngine
            _gee_engine = GEEQueryEngine(auto_init=True)
            print("GEE Query Engine initialized for dashboard")
        except Exception as e:
            print(f"Warning: GEE initialization failed: {e}")
            _gee_engine = None
    return _gee_engine


class UnifiedDashboardService:
    """
    Unified service that combines ALL data sources for a location.

    Real-time data (updates every 1-5 min):
    - Weather: temperature, humidity, pressure, wind, cloud cover
    - Air Quality: AQI, PM2.5, PM10, ozone, UV index

    Satellite data (updates daily, cached for 24 hours):
    - PHI Score across 5 pillars
    - NDVI, EVI, tree cover, soil moisture, LST
    """

    def __init__(self):
        # Real-time API clients (reuse existing classes)
        self.weather_api = OpenMeteoWeatherAPI()
        self.aqi_api = OpenMeteoAPI()

        # Short TTL cache for real-time data (1 minute)
        self.realtime_cache = ExternalAPICache(ttl_seconds=60)

        # Longer TTL cache for satellite data (24 hours)
        self.satellite_cache = ExternalAPICache(ttl_seconds=86400)

        # Database for historical storage
        self.db = get_dashboard_db()

        # Background polling task
        self._polling_task: Optional[asyncio.Task] = None
        self._is_polling = False

    async def initialize(self) -> None:
        """Initialize the service (database)."""
        await self.db.init_db()
        print("Dashboard service initialized")

    # ==================== REAL-TIME DATA ====================

    async def get_realtime_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get current weather data.

        Uses Open-Meteo Weather API (FREE, no key required).
        Cached for 1 minute.
        """
        cache_key = self.realtime_cache.make_key("weather", round(lat, 3), round(lon, 3))

        # Check cache
        cached = self.realtime_cache.get(cache_key)
        if cached:
            cached["cached"] = True
            return cached

        # Fetch from Open-Meteo
        weather_data = await self.weather_api.get_data(
            lat, lon,
            include_current=True,
            include_hourly=False,
            include_daily=True,
            forecast_days=1
        )

        if weather_data.get("available"):
            # Store in SQLite
            try:
                await self.db.store_weather_reading(lat, lon, weather_data)
            except Exception as e:
                print(f"Warning: Failed to store weather reading: {e}")

            # Cache
            self.realtime_cache.set(cache_key, weather_data)

        weather_data["cached"] = False
        return weather_data

    async def get_realtime_aqi(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get current air quality data.

        Uses Open-Meteo Air Quality API (FREE, no key required).
        Cached for 1 minute.
        """
        cache_key = self.realtime_cache.make_key("aqi", round(lat, 3), round(lon, 3))

        # Check cache
        cached = self.realtime_cache.get(cache_key)
        if cached:
            cached["cached"] = True
            return cached

        # Fetch from Open-Meteo
        aqi_data = await self.aqi_api.get_data(lat, lon)

        if aqi_data.get("available"):
            # Store in SQLite
            try:
                await self.db.store_aqi_reading(lat, lon, aqi_data)
            except Exception as e:
                print(f"Warning: Failed to store AQI reading: {e}")

            # Cache
            self.realtime_cache.set(cache_key, aqi_data)

        aqi_data["cached"] = False
        return aqi_data

    async def get_realtime_combined(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get all real-time data (weather + AQI) in parallel.

        Efficient for dashboard page loads.
        """
        # Fetch both in parallel
        weather_task = self.get_realtime_weather(lat, lon)
        aqi_task = self.get_realtime_aqi(lat, lon)

        weather, aqi = await asyncio.gather(weather_task, aqi_task)

        return {
            "weather": weather,
            "air_quality": aqi,
            "timestamp": datetime.now().isoformat(),
            "sources": ["open_meteo_weather", "open_meteo_aqi"]
        }

    # ==================== SATELLITE DATA ====================

    async def get_satellite_data(
        self,
        lat: float,
        lon: float,
        mode: str = "comprehensive",
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Get satellite/PHI data from Google Earth Engine.

        Uses GEEQueryEngine from planetary_health_query.
        Cached for 24 hours (satellite data updates daily/weekly).

        Args:
            lat: Latitude
            lon: Longitude
            mode: "simple" or "comprehensive"
            force_refresh: Skip cache and fetch fresh data

        Returns:
            PHI data with all 5 pillars
        """
        cache_key = self.satellite_cache.make_key("satellite", round(lat, 3), round(lon, 3), mode)

        # Check cache (unless force refresh)
        if not force_refresh:
            cached = self.satellite_cache.get(cache_key)
            if cached:
                cached["cached"] = True
                return cached

        # Get GEE engine
        engine = get_gee_engine()

        if engine is None:
            # Return cached data from SQLite or Supabase if GEE unavailable
            latest = await self.db.get_latest_satellite(lat, lon)
            if latest:
                return {
                    "available": True,
                    "source": "sqlite_cache",
                    "cached": True,
                    "data": latest,
                    "warning": "GEE unavailable, using cached data from SQLite"
                }

            # Try Supabase cloud as fallback
            cloud_data = await get_latest_satellite_from_cloud(lat, lon)
            if cloud_data:
                return {
                    "available": True,
                    "source": "supabase_cache",
                    "cached": True,
                    "data": cloud_data,
                    "warning": "GEE unavailable, using cached data from Supabase cloud"
                }

            return {
                "available": False,
                "source": "google_earth_engine",
                "error": "GEE engine not initialized and no cached data available",
                "cached": False
            }

        try:
            # Query GEE (this takes 15-30 seconds)
            result = engine.query(
                lat=lat,
                lon=lon,
                mode=mode,
                temporal="latest",
                include_scores=True,
                include_raw=True,
                parallel=True
            )

            satellite_data = {
                "available": True,
                "source": "google_earth_engine",
                "cached": False,
                "query": result.get("query"),
                "pillars": result.get("pillars"),
                "summary": result.get("summary"),
                "timestamp": datetime.now().isoformat()
            }

            # Store in SQLite
            sqlite_id = None
            try:
                sqlite_id = await self.db.store_satellite_reading(lat, lon, result)
            except Exception as e:
                print(f"Warning: Failed to store satellite reading: {e}")

            # Sync to Supabase cloud backup (non-blocking)
            try:
                await sync_satellite_reading(lat, lon, result, sqlite_id)
            except Exception as e:
                print(f"Warning: Failed to sync to Supabase: {e}")

            # Cache
            self.satellite_cache.set(cache_key, satellite_data)

            return satellite_data

        except Exception as e:
            return {
                "available": False,
                "source": "google_earth_engine",
                "error": str(e),
                "cached": False
            }

    # ==================== COMBINED DATA ====================

    async def get_all_data(
        self,
        lat: float,
        lon: float,
        include_satellite: bool = True,
        include_history: bool = True,
        history_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Get ALL dashboard data for a location.

        Returns:
            Combined real-time + satellite + historical data
        """
        result = {
            "location": {
                "latitude": lat,
                "longitude": lon
            },
            "timestamp": datetime.now().isoformat(),
            "realtime": None,
            "satellite": None,
            "history": None,
            "sources": []
        }

        # Get real-time data (always)
        realtime = await self.get_realtime_combined(lat, lon)
        result["realtime"] = realtime
        result["sources"].extend(realtime.get("sources", []))

        # Get satellite data (if requested)
        if include_satellite:
            satellite = await self.get_satellite_data(lat, lon)
            result["satellite"] = satellite
            if satellite.get("available"):
                result["sources"].append(satellite.get("source", "google_earth_engine"))

        # Get historical data (if requested)
        if include_history:
            weather_history = await self.db.get_weather_history(lat, lon, hours=history_hours)
            aqi_history = await self.db.get_aqi_history(lat, lon, hours=history_hours)
            satellite_history = await self.db.get_satellite_history(lat, lon, days=7)

            result["history"] = {
                "weather": weather_history,
                "air_quality": aqi_history,
                "satellite": satellite_history,
                "weather_count": len(weather_history),
                "aqi_count": len(aqi_history),
                "satellite_count": len(satellite_history)
            }

        return result

    # ==================== HISTORICAL DATA ====================

    async def get_weather_history(
        self,
        lat: float,
        lon: float,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Get historical weather readings from SQLite."""
        return await self.db.get_weather_history(lat, lon, hours)

    async def get_aqi_history(
        self,
        lat: float,
        lon: float,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Get historical air quality readings from SQLite."""
        return await self.db.get_aqi_history(lat, lon, hours)

    async def get_satellite_history(
        self,
        lat: float,
        lon: float,
        days: int = 7
    ) -> List[Dict[str, Any]]:
        """Get historical satellite readings from SQLite."""
        return await self.db.get_satellite_history(lat, lon, days)

    # ==================== POLLING ====================

    async def start_polling(
        self,
        lat: float,
        lon: float,
        interval_seconds: int = 300
    ) -> None:
        """
        Start background polling for a location.

        Args:
            lat: Latitude
            lon: Longitude
            interval_seconds: Polling interval (60-300 seconds)
        """
        interval = max(60, min(300, interval_seconds))

        if self._polling_task:
            self._polling_task.cancel()

        self._is_polling = True
        self._polling_task = asyncio.create_task(
            self._poll_loop(lat, lon, interval)
        )

    async def stop_polling(self) -> None:
        """Stop background polling."""
        self._is_polling = False
        if self._polling_task:
            self._polling_task.cancel()
            self._polling_task = None

    async def _poll_loop(self, lat: float, lon: float, interval: int) -> None:
        """Background polling loop."""
        print(f"Starting polling for ({lat}, {lon}) every {interval}s")

        while self._is_polling:
            try:
                # Fetch real-time data
                await self.get_realtime_combined(lat, lon)
                print(f"Polled data for ({lat}, {lon}) at {datetime.now().isoformat()}")
            except Exception as e:
                print(f"Polling error: {e}")

            await asyncio.sleep(interval)

    # ==================== STATUS ====================

    def get_status(self) -> Dict[str, Any]:
        """Get dashboard service status."""
        return {
            "status": "running",
            "gee_available": get_gee_engine() is not None,
            "supabase_available": is_supabase_available(),
            "realtime_cache_stats": self.realtime_cache.get_stats(),
            "satellite_cache_stats": self.satellite_cache.get_stats(),
            "polling_active": self._is_polling
        }

    async def get_db_stats(self) -> Dict[str, Any]:
        """Get database statistics (SQLite + Supabase)."""
        sqlite_stats = await self.db.get_db_stats()
        cloud_stats = await get_cloud_stats()

        return {
            "sqlite": sqlite_stats,
            "supabase": cloud_stats
        }


# Singleton instance
_dashboard_service: Optional[UnifiedDashboardService] = None


def get_dashboard_service() -> UnifiedDashboardService:
    """Get or create the dashboard service singleton."""
    global _dashboard_service
    if _dashboard_service is None:
        _dashboard_service = UnifiedDashboardService()
    return _dashboard_service
