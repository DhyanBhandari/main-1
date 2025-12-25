"""
Open-Meteo Air Quality API Client.

Free API - No authentication required!
Provides real-time air quality data including:
- PM2.5, PM10
- CO, NO2, SO2, O3
- US AQI, European AQI
- UV Index

Documentation: https://open-meteo.com/en/docs/air-quality-api
"""

from typing import Dict, Any, List, Optional
import aiohttp
from .base import BaseExternalAPI


class OpenMeteoAPI(BaseExternalAPI):
    """Open-Meteo Air Quality API - No authentication required."""

    API_NAME = "open_meteo"
    BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
    REQUIRES_AUTH = False
    CACHE_TTL_SECONDS = 600  # 10 minutes - data updates hourly
    REQUEST_TIMEOUT = 10

    # Available parameters from Open-Meteo
    AVAILABLE_PARAMETERS = [
        "pm10", "pm2_5",
        "carbon_monoxide", "nitrogen_dioxide", "sulphur_dioxide", "ozone",
        "aerosol_optical_depth", "dust",
        "uv_index", "uv_index_clear_sky",
        "european_aqi", "us_aqi",
        "european_aqi_pm2_5", "european_aqi_pm10",
        "european_aqi_nitrogen_dioxide", "european_aqi_ozone", "european_aqi_sulphur_dioxide"
    ]

    # Default parameters for a comprehensive query
    DEFAULT_PARAMETERS = [
        "pm10", "pm2_5",
        "carbon_monoxide", "nitrogen_dioxide", "ozone",
        "us_aqi", "european_aqi",
        "uv_index"
    ]

    async def fetch_data(
        self,
        lat: float,
        lon: float,
        parameters: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Fetch air quality data from Open-Meteo.

        Args:
            lat: Latitude
            lon: Longitude
            parameters: List of parameters to fetch (default: DEFAULT_PARAMETERS)

        Returns:
            Raw API response
        """
        params = parameters or self.DEFAULT_PARAMETERS

        url_params = {
            "latitude": lat,
            "longitude": lon,
            "current": ",".join(params),
            "timezone": "auto"
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(
                self.BASE_URL,
                params=url_params,
                timeout=aiohttp.ClientTimeout(total=self.REQUEST_TIMEOUT)
            ) as response:
                response.raise_for_status()
                return await response.json()

    def normalize_response(self, raw_data: Dict) -> Dict[str, Any]:
        """
        Normalize Open-Meteo response to standard format.

        Args:
            raw_data: Raw API response

        Returns:
            Normalized data with consistent structure
        """
        current = raw_data.get("current", {})

        # Extract AQI values
        us_aqi = current.get("us_aqi")
        european_aqi = current.get("european_aqi")

        # Determine AQI category
        aqi_category = self._get_aqi_category(us_aqi)

        return {
            "source": self.API_NAME,
            "available": True,
            "timestamp": current.get("time"),
            "timezone": raw_data.get("timezone"),
            "location": {
                "latitude": raw_data.get("latitude"),
                "longitude": raw_data.get("longitude"),
                "elevation": raw_data.get("elevation")
            },
            "aqi": {
                "us_aqi": us_aqi,
                "european_aqi": european_aqi,
                "category": aqi_category,
                "unit": "index"
            },
            "pollutants": {
                "pm2_5": {
                    "value": current.get("pm2_5"),
                    "unit": "ug/m3",
                    "description": "Fine particulate matter"
                },
                "pm10": {
                    "value": current.get("pm10"),
                    "unit": "ug/m3",
                    "description": "Coarse particulate matter"
                },
                "ozone": {
                    "value": current.get("ozone"),
                    "unit": "ug/m3",
                    "description": "Ground-level ozone (O3)"
                },
                "carbon_monoxide": {
                    "value": current.get("carbon_monoxide"),
                    "unit": "ug/m3",
                    "description": "Carbon monoxide (CO)"
                },
                "nitrogen_dioxide": {
                    "value": current.get("nitrogen_dioxide"),
                    "unit": "ug/m3",
                    "description": "Nitrogen dioxide (NO2)"
                },
                "sulphur_dioxide": {
                    "value": current.get("sulphur_dioxide"),
                    "unit": "ug/m3",
                    "description": "Sulphur dioxide (SO2)"
                }
            },
            "uv_index": {
                "value": current.get("uv_index"),
                "unit": "index",
                "category": self._get_uv_category(current.get("uv_index")),
                "description": "UV Index"
            },
            "data_quality": "modeled",
            "update_frequency": "hourly"
        }

    def _get_aqi_category(self, aqi: Optional[float]) -> str:
        """
        Get AQI category from US AQI value.

        Args:
            aqi: US AQI value

        Returns:
            Category string
        """
        if aqi is None:
            return "unknown"
        if aqi <= 50:
            return "good"
        elif aqi <= 100:
            return "moderate"
        elif aqi <= 150:
            return "unhealthy_sensitive"
        elif aqi <= 200:
            return "unhealthy"
        elif aqi <= 300:
            return "very_unhealthy"
        else:
            return "hazardous"

    def _get_uv_category(self, uv: Optional[float]) -> str:
        """
        Get UV index category.

        Args:
            uv: UV index value

        Returns:
            Category string
        """
        if uv is None:
            return "unknown"
        if uv < 3:
            return "low"
        elif uv < 6:
            return "moderate"
        elif uv < 8:
            return "high"
        elif uv < 11:
            return "very_high"
        else:
            return "extreme"


# Convenience function for quick fetches
async def get_air_quality(lat: float, lon: float) -> Dict[str, Any]:
    """
    Quick fetch of air quality data.

    Args:
        lat: Latitude
        lon: Longitude

    Returns:
        Normalized air quality data
    """
    api = OpenMeteoAPI()
    return await api.get_data(lat, lon)
