"""
External Data Aggregator.

Combines data from multiple external APIs with:
- Fallback chain (OpenAQ -> Open-Meteo -> satellite)
- Parallel requests for speed
- Caching to reduce API calls
- Data quality indicators
- Weather forecast integration
"""

from typing import Dict, Any, Optional
import asyncio
import os

from .open_meteo import OpenMeteoAPI
from .open_meteo_weather import OpenMeteoWeatherAPI
from .openaq import OpenAQAPI
from .cache import ExternalAPICache


class ExternalDataAggregator:
    """Aggregates data from multiple external APIs with fallback logic."""

    def __init__(self, config: Optional[Dict[str, str]] = None):
        """
        Initialize aggregator with API clients.

        Args:
            config: Dict with API keys (OPENAQ_API_KEY, etc.)
        """
        config = config or {}

        # Get API keys from config or environment
        openaq_key = config.get("OPENAQ_API_KEY") or os.environ.get("OPENAQ_API_KEY")

        # Initialize API clients
        self.open_meteo = OpenMeteoAPI()
        self.open_meteo_weather = OpenMeteoWeatherAPI()
        self.openaq = OpenAQAPI(openaq_key) if openaq_key else None

        # Cache instance (10 minute TTL for real-time data)
        self.cache = ExternalAPICache(ttl_seconds=600)

        # Track which APIs are available
        self._api_status = {
            "open_meteo": True,  # Always available (no auth)
            "open_meteo_weather": True,  # Always available (no auth)
            "openaq": openaq_key is not None
        }

    async def get_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get air quality data with fallback chain.

        Priority:
        1. OpenAQ (ground-truth if stations nearby)
        2. Open-Meteo (model-based, always available)

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Aggregated air quality data
        """
        cache_key = self.cache.make_key("aqi", round(lat, 3), round(lon, 3))

        # Check cache first
        cached = self.cache.get(cache_key)
        if cached is not None:
            cached["cached"] = True
            return cached

        results = {
            "sources": [],
            "primary_aqi": None,
            "confidence": "low",
            "pollutants": {},
            "ground_truth_available": False,
            "cached": False
        }

        # Fetch from multiple sources in parallel
        tasks = [self.open_meteo.get_data(lat, lon)]
        if self.openaq:
            tasks.append(self.openaq.get_data(lat, lon))

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Process Open-Meteo response (always first in tasks)
        open_meteo_data = None
        if not isinstance(responses[0], Exception) and responses[0].get("available"):
            open_meteo_data = responses[0]
            results["sources"].append("open_meteo")
            results["primary_aqi"] = open_meteo_data["aqi"]["us_aqi"]
            results["aqi_category"] = open_meteo_data["aqi"]["category"]
            results["pollutants"] = open_meteo_data["pollutants"]
            results["uv_index"] = open_meteo_data.get("uv_index")
            results["confidence"] = "medium"
            results["data_quality"] = "modeled"

        # Process OpenAQ response if available (takes priority for AQI)
        openaq_data = None
        if len(responses) > 1 and not isinstance(responses[1], Exception):
            openaq_data = responses[1]
            if openaq_data.get("available"):
                results["sources"].append("openaq")
                results["ground_truth_available"] = True
                results["ground_stations"] = openaq_data.get("stations", [])
                results["nearest_station"] = openaq_data.get("nearest_station")
                results["confidence"] = "high"
                results["data_quality"] = "measured"

                # OpenAQ AQI takes priority (ground truth)
                if openaq_data.get("aqi", {}).get("value") is not None:
                    results["primary_aqi"] = openaq_data["aqi"]["value"]
                    results["aqi_category"] = openaq_data["aqi"]["category"]
                    results["dominant_pollutant"] = openaq_data["aqi"]["dominant_pollutant"]

                # Merge pollutant data (OpenAQ takes priority)
                for param, data in openaq_data.get("pollutants", {}).items():
                    results["pollutants"][param] = data

        # Store raw responses for detailed access
        results["raw_responses"] = {
            "open_meteo": open_meteo_data,
            "openaq": openaq_data
        }

        # Cache the result
        self.cache.set(cache_key, results)

        return results

    async def get_uv_index(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get UV index data.

        Currently only Open-Meteo provides UV data.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            UV index data
        """
        cache_key = self.cache.make_key("uv", round(lat, 3), round(lon, 3))

        # Check cache
        cached = self.cache.get(cache_key)
        if cached is not None:
            cached["cached"] = True
            return cached

        # Fetch from Open-Meteo
        data = await self.open_meteo.get_data(lat, lon, parameters=["uv_index", "uv_index_clear_sky"])

        result = {
            "source": "open_meteo",
            "available": data.get("available", False),
            "uv_index": data.get("uv_index", {}),
            "cached": False
        }

        self.cache.set(cache_key, result)
        return result

    async def get_enhanced_atmospheric_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get comprehensive atmospheric data for Pillar A enhancement.

        Returns data formatted for integration with the satellite-based
        AtmosphericPillar metrics.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Enhanced atmospheric data compatible with pillar system
        """
        # Get aggregated air quality
        aqi_data = await self.get_air_quality(lat, lon)

        return {
            "external_sources": aqi_data.get("sources", []),
            "aqi": {
                "value": aqi_data.get("primary_aqi"),
                "unit": "US AQI",
                "category": aqi_data.get("aqi_category"),
                "description": "Real-time Air Quality Index",
                "quality": "good" if aqi_data.get("confidence") == "high" else "moderate",
                "ground_truth": aqi_data.get("ground_truth_available", False),
                "dominant_pollutant": aqi_data.get("dominant_pollutant")
            },
            "uv_index": aqi_data.get("uv_index", {}),
            "pollutants": aqi_data.get("pollutants", {}),
            "data_confidence": aqi_data.get("confidence", "low"),
            "data_quality": aqi_data.get("data_quality", "unknown"),
            "nearest_station": aqi_data.get("nearest_station"),
            "timestamp": None  # Will be set from individual responses
        }

    async def get_weather_data(self, lat: float, lon: float, forecast_days: int = 7) -> Dict[str, Any]:
        """
        Get comprehensive weather data including forecasts.

        Args:
            lat: Latitude
            lon: Longitude
            forecast_days: Number of forecast days (1-16)

        Returns:
            Weather data with current, hourly, and daily forecasts
        """
        cache_key = self.cache.make_key("weather", round(lat, 3), round(lon, 3), forecast_days)

        # Check cache
        cached = self.cache.get(cache_key)
        if cached is not None:
            cached["cached"] = True
            return cached

        # Fetch weather data
        data = await self.open_meteo_weather.get_data(
            lat, lon,
            forecast_days=forecast_days
        )

        if data.get("available"):
            data["cached"] = False
            self.cache.set(cache_key, data)

        return data

    async def get_soil_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get soil temperature and moisture data.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Soil data from weather API
        """
        cache_key = self.cache.make_key("soil", round(lat, 3), round(lon, 3))

        cached = self.cache.get(cache_key)
        if cached is not None:
            cached["cached"] = True
            return cached

        # Fetch soil data
        soil_params = [
            "soil_temperature_0cm",
            "soil_temperature_6cm",
            "soil_moisture_0_to_1cm",
            "soil_moisture_1_to_3cm",
            "soil_moisture_3_to_9cm",
            "soil_moisture_9_to_27cm"
        ]

        data = await self.open_meteo_weather.get_data(
            lat, lon,
            include_current=False,
            include_daily=False,
            hourly_params=soil_params,
            forecast_days=1,
            past_days=0
        )

        if data.get("available"):
            # Extract current soil values
            hourly = data.get("hourly", {})
            soil_moisture = self.open_meteo_weather.get_soil_moisture_average(hourly)

            result = {
                "source": "open_meteo_weather",
                "available": True,
                "soil_moisture": {
                    "value": soil_moisture,
                    "unit": "m³/m³",
                    "quality": "good" if soil_moisture is not None else "unavailable"
                },
                "soil_temperature": {
                    "surface": hourly.get("soil_temperature_0cm", [None])[0] if hourly.get("soil_temperature_0cm") else None,
                    "depth_6cm": hourly.get("soil_temperature_6cm", [None])[0] if hourly.get("soil_temperature_6cm") else None,
                    "unit": "°C"
                },
                "cached": False
            }
            self.cache.set(cache_key, result)
            return result

        return {
            "source": "open_meteo_weather",
            "available": False,
            "cached": False
        }

    async def get_comprehensive_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get all external data in one call (air quality + weather + soil).

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Comprehensive data from all sources
        """
        # Fetch all data in parallel
        tasks = [
            self.get_air_quality(lat, lon),
            self.get_weather_data(lat, lon),
            self.get_soil_data(lat, lon)
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        air_quality = results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])}
        weather = results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])}
        soil = results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])}

        return {
            "air_quality": air_quality,
            "weather": weather,
            "soil": soil,
            "sources": list(set(
                air_quality.get("sources", []) +
                (["open_meteo_weather"] if weather.get("available") else [])
            ))
        }

    def get_api_status(self) -> Dict[str, Any]:
        """
        Get status of all external APIs.

        Returns:
            Dict with API availability and stats
        """
        return {
            "apis": {
                "open_meteo": {
                    "available": self._api_status["open_meteo"],
                    "requires_auth": False,
                    "stats": self.open_meteo.get_stats()
                },
                "open_meteo_weather": {
                    "available": self._api_status["open_meteo_weather"],
                    "requires_auth": False,
                    "stats": self.open_meteo_weather.get_stats()
                },
                "openaq": {
                    "available": self._api_status["openaq"],
                    "requires_auth": True,
                    "stats": self.openaq.get_stats() if self.openaq else None
                }
            },
            "cache_stats": self.cache.get_stats()
        }

    def clear_cache(self) -> Dict[str, Any]:
        """Clear all cached data."""
        self.cache.clear()
        return {"status": "cache_cleared", "cache_stats": self.cache.get_stats()}


# Global aggregator instance (initialized lazily)
_aggregator: Optional[ExternalDataAggregator] = None


def get_aggregator() -> ExternalDataAggregator:
    """
    Get or create global aggregator instance.

    Returns:
        ExternalDataAggregator instance
    """
    global _aggregator
    if _aggregator is None:
        _aggregator = ExternalDataAggregator()
    return _aggregator


# Convenience functions
async def get_realtime_aqi(lat: float, lon: float) -> Dict[str, Any]:
    """Quick access to real-time AQI data."""
    return await get_aggregator().get_air_quality(lat, lon)


async def get_enhanced_atmospheric(lat: float, lon: float) -> Dict[str, Any]:
    """Quick access to enhanced atmospheric data for Pillar A."""
    return await get_aggregator().get_enhanced_atmospheric_data(lat, lon)


async def get_weather_forecast(lat: float, lon: float, days: int = 7) -> Dict[str, Any]:
    """Quick access to weather forecast data."""
    return await get_aggregator().get_weather_data(lat, lon, forecast_days=days)


async def get_soil_conditions(lat: float, lon: float) -> Dict[str, Any]:
    """Quick access to soil moisture and temperature data."""
    return await get_aggregator().get_soil_data(lat, lon)


async def get_all_external_data(lat: float, lon: float) -> Dict[str, Any]:
    """Quick access to all external data (AQI + weather + soil)."""
    return await get_aggregator().get_comprehensive_data(lat, lon)
