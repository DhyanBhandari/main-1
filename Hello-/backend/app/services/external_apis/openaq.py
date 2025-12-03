"""
OpenAQ API Client.

Ground-truth air quality measurements from monitoring stations worldwide.
Provides real measurements (not modeled data) from government and research sensors.

API Key Required: Yes
Documentation: https://docs.openaq.org/

Key advantage over Open-Meteo: Actual measured values from physical sensors.
"""

from typing import Dict, Any, List, Optional
import aiohttp
from .base import BaseExternalAPI


class OpenAQAPI(BaseExternalAPI):
    """OpenAQ - Ground-truth air quality measurements from monitoring stations."""

    API_NAME = "openaq"
    BASE_URL = "https://api.openaq.org/v2/latest"
    REQUIRES_AUTH = True
    CACHE_TTL_SECONDS = 900  # 15 minutes - sensors report every 15-60 min
    REQUEST_TIMEOUT = 15

    def __init__(self, api_key: str):
        """
        Initialize OpenAQ client.

        Args:
            api_key: OpenAQ API key
        """
        super().__init__(api_key)
        self.headers = {
            "X-API-Key": api_key,
            "Accept": "application/json"
        }

    async def fetch_data(
        self,
        lat: float,
        lon: float,
        radius: int = 25000,
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Fetch nearest monitoring stations within radius.

        Args:
            lat: Latitude
            lon: Longitude
            radius: Search radius in meters (default 25km)
            limit: Maximum number of stations to return

        Returns:
            Raw API response with station data
        """
        params = {
            "coordinates": f"{lat},{lon}",
            "radius": radius,
            "limit": limit,
            "order_by": "distance"
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(
                self.BASE_URL,
                params=params,
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=self.REQUEST_TIMEOUT)
            ) as response:
                response.raise_for_status()
                return await response.json()

    def normalize_response(self, raw_data: Dict) -> Dict[str, Any]:
        """
        Normalize OpenAQ response to standard format.

        Args:
            raw_data: Raw API response

        Returns:
            Normalized data with station info and measurements
        """
        results = raw_data.get("results", [])

        if not results:
            return {
                "source": self.API_NAME,
                "available": False,
                "ground_truth": True,
                "message": "No monitoring stations found nearby",
                "stations": [],
                "measurements": {}
            }

        # Aggregate measurements from nearest stations
        measurements = {}
        stations = []
        nearest_station = None

        for station in results:
            # Station info
            station_info = {
                "name": station.get("location"),
                "id": station.get("id"),
                "distance_km": round(station.get("distance", 0) / 1000, 2),
                "city": station.get("city"),
                "country": station.get("country"),
                "is_mobile": station.get("isMobile", False),
                "entity": station.get("entity")
            }
            stations.append(station_info)

            if nearest_station is None:
                nearest_station = station_info

            # Extract measurements (prioritize nearest stations)
            for measurement in station.get("measurements", []):
                param = measurement.get("parameter")

                # Only store if not already captured (nearest station wins)
                if param and param not in measurements:
                    measurements[param] = {
                        "value": measurement.get("value"),
                        "unit": measurement.get("unit"),
                        "last_updated": measurement.get("lastUpdated"),
                        "station": station.get("location"),
                        "distance_km": station_info["distance_km"]
                    }

        # Calculate composite AQI from available pollutants
        aqi_value, aqi_pollutant = self._calculate_aqi(measurements)

        return {
            "source": self.API_NAME,
            "available": True,
            "ground_truth": True,
            "data_quality": "measured",
            "nearest_station": nearest_station,
            "stations_count": len(stations),
            "stations": stations,
            "aqi": {
                "value": aqi_value,
                "dominant_pollutant": aqi_pollutant,
                "unit": "US AQI",
                "category": self._get_aqi_category(aqi_value)
            },
            "measurements": measurements,
            "pollutants": self._format_pollutants(measurements)
        }

    def _calculate_aqi(self, measurements: Dict) -> tuple:
        """
        Calculate AQI from available pollutant measurements.

        Uses US EPA breakpoints for conversion.

        Args:
            measurements: Dict of pollutant measurements

        Returns:
            Tuple of (aqi_value, dominant_pollutant)
        """
        aqi_values = {}

        # PM2.5 AQI calculation (simplified)
        if "pm25" in measurements:
            pm25 = measurements["pm25"].get("value", 0)
            if pm25 <= 12:
                aqi_values["pm25"] = pm25 * 50 / 12
            elif pm25 <= 35.4:
                aqi_values["pm25"] = 50 + (pm25 - 12) * 50 / 23.4
            elif pm25 <= 55.4:
                aqi_values["pm25"] = 100 + (pm25 - 35.4) * 50 / 20
            else:
                aqi_values["pm25"] = 150 + (pm25 - 55.4) * 50 / 95

        # PM10 AQI calculation
        if "pm10" in measurements:
            pm10 = measurements["pm10"].get("value", 0)
            if pm10 <= 54:
                aqi_values["pm10"] = pm10 * 50 / 54
            elif pm10 <= 154:
                aqi_values["pm10"] = 50 + (pm10 - 54) * 50 / 100
            else:
                aqi_values["pm10"] = 100 + (pm10 - 154) * 50 / 200

        # O3 AQI calculation (simplified, 8-hour)
        if "o3" in measurements:
            o3 = measurements["o3"].get("value", 0)
            if o3 <= 54:
                aqi_values["o3"] = o3 * 50 / 54
            elif o3 <= 70:
                aqi_values["o3"] = 50 + (o3 - 54) * 50 / 16
            else:
                aqi_values["o3"] = 100 + (o3 - 70) * 50 / 15

        # NO2 AQI calculation
        if "no2" in measurements:
            no2 = measurements["no2"].get("value", 0)
            if no2 <= 53:
                aqi_values["no2"] = no2 * 50 / 53
            elif no2 <= 100:
                aqi_values["no2"] = 50 + (no2 - 53) * 50 / 47
            else:
                aqi_values["no2"] = 100 + (no2 - 100) * 50 / 260

        if not aqi_values:
            return None, None

        # AQI is the maximum of all pollutant AQIs
        max_aqi = max(aqi_values.values())
        dominant = max(aqi_values, key=aqi_values.get)

        return round(max_aqi), dominant

    def _get_aqi_category(self, aqi: Optional[float]) -> str:
        """Get AQI category from value."""
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

    def _format_pollutants(self, measurements: Dict) -> Dict[str, Any]:
        """Format pollutants in standard structure."""
        pollutant_info = {
            "pm25": ("PM2.5", "Fine particulate matter"),
            "pm10": ("PM10", "Coarse particulate matter"),
            "o3": ("O3", "Ground-level ozone"),
            "no2": ("NO2", "Nitrogen dioxide"),
            "so2": ("SO2", "Sulphur dioxide"),
            "co": ("CO", "Carbon monoxide")
        }

        formatted = {}
        for param, data in measurements.items():
            info = pollutant_info.get(param, (param.upper(), param))
            formatted[param] = {
                "value": data.get("value"),
                "unit": data.get("unit"),
                "name": info[0],
                "description": info[1],
                "station": data.get("station"),
                "distance_km": data.get("distance_km")
            }

        return formatted


# Convenience function for quick fetches
async def get_ground_truth_aqi(lat: float, lon: float, api_key: str) -> Dict[str, Any]:
    """
    Quick fetch of ground-truth air quality data.

    Args:
        lat: Latitude
        lon: Longitude
        api_key: OpenAQ API key

    Returns:
        Normalized air quality data from monitoring stations
    """
    api = OpenAQAPI(api_key)
    return await api.get_data(lat, lon)
