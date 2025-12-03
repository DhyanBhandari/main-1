"""
Open-Meteo Weather Forecast API Client.

Free API - No authentication required!
Provides comprehensive weather data including:
- Current weather conditions
- Hourly forecasts (7 days)
- Daily forecasts (16 days)
- Soil temperature and moisture
- UV index, cloud cover, visibility

Documentation: https://open-meteo.com/en/docs
"""

from typing import Dict, Any, List, Optional
import aiohttp
from .base import BaseExternalAPI


class OpenMeteoWeatherAPI(BaseExternalAPI):
    """Open-Meteo Weather Forecast API - No authentication required."""

    API_NAME = "open_meteo_weather"
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    REQUIRES_AUTH = False
    CACHE_TTL_SECONDS = 900  # 15 minutes
    REQUEST_TIMEOUT = 15

    # Current weather parameters
    CURRENT_PARAMETERS = [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "cloud_cover",
        "pressure_msl",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m"
    ]

    # Hourly parameters
    HOURLY_PARAMETERS = [
        "temperature_2m",
        "relative_humidity_2m",
        "dew_point_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "pressure_msl",
        "surface_pressure",
        "cloud_cover",
        "cloud_cover_low",
        "cloud_cover_mid",
        "cloud_cover_high",
        "visibility",
        "evapotranspiration",
        "et0_fao_evapotranspiration",
        "vapour_pressure_deficit",
        "wind_speed_10m",
        "wind_speed_80m",
        "wind_direction_10m",
        "wind_direction_80m",
        "wind_gusts_10m",
        "soil_temperature_0cm",
        "soil_temperature_6cm",
        "soil_temperature_18cm",
        "soil_temperature_54cm",
        "soil_moisture_0_to_1cm",
        "soil_moisture_1_to_3cm",
        "soil_moisture_3_to_9cm",
        "soil_moisture_9_to_27cm",
        "soil_moisture_27_to_81cm"
    ]

    # Daily parameters
    DAILY_PARAMETERS = [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "sunrise",
        "sunset",
        "daylight_duration",
        "sunshine_duration",
        "uv_index_max",
        "uv_index_clear_sky_max",
        "precipitation_sum",
        "rain_sum",
        "showers_sum",
        "snowfall_sum",
        "precipitation_hours",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "wind_gusts_10m_max",
        "wind_direction_10m_dominant",
        "shortwave_radiation_sum",
        "et0_fao_evapotranspiration"
    ]

    # Weather code descriptions
    WEATHER_CODES = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snowfall",
        73: "Moderate snowfall",
        75: "Heavy snowfall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    }

    async def fetch_data(
        self,
        lat: float,
        lon: float,
        include_current: bool = True,
        include_hourly: bool = True,
        include_daily: bool = True,
        forecast_days: int = 7,
        past_days: int = 1,
        hourly_params: Optional[List[str]] = None,
        daily_params: Optional[List[str]] = None,
        current_params: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Fetch weather forecast data from Open-Meteo.

        Args:
            lat: Latitude
            lon: Longitude
            include_current: Include current weather
            include_hourly: Include hourly forecast
            include_daily: Include daily forecast
            forecast_days: Number of forecast days (1-16)
            past_days: Number of past days to include (0-92)
            hourly_params: Custom hourly parameters
            daily_params: Custom daily parameters
            current_params: Custom current parameters

        Returns:
            Raw API response
        """
        url_params = {
            "latitude": lat,
            "longitude": lon,
            "timezone": "auto",
            "forecast_days": min(forecast_days, 16),
            "past_days": min(past_days, 92)
        }

        if include_current:
            params = current_params or self.CURRENT_PARAMETERS
            url_params["current"] = ",".join(params)

        if include_hourly:
            params = hourly_params or self.HOURLY_PARAMETERS
            url_params["hourly"] = ",".join(params)

        if include_daily:
            params = daily_params or self.DAILY_PARAMETERS
            url_params["daily"] = ",".join(params)

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
        Normalize Open-Meteo weather response to standard format.

        Args:
            raw_data: Raw API response

        Returns:
            Normalized data with consistent structure
        """
        current = raw_data.get("current", {})
        hourly = raw_data.get("hourly", {})
        daily = raw_data.get("daily", {})

        # Get weather description
        weather_code = current.get("weather_code")
        weather_description = self.WEATHER_CODES.get(weather_code, "Unknown")

        return {
            "source": self.API_NAME,
            "available": True,
            "location": {
                "latitude": raw_data.get("latitude"),
                "longitude": raw_data.get("longitude"),
                "elevation": raw_data.get("elevation"),
                "timezone": raw_data.get("timezone"),
                "timezone_abbreviation": raw_data.get("timezone_abbreviation"),
                "utc_offset_seconds": raw_data.get("utc_offset_seconds")
            },
            "current": self._normalize_current(current, weather_description),
            "hourly": self._normalize_hourly(hourly, raw_data.get("hourly_units", {})),
            "daily": self._normalize_daily(daily, raw_data.get("daily_units", {})),
            "units": {
                "current": raw_data.get("current_units", {}),
                "hourly": raw_data.get("hourly_units", {}),
                "daily": raw_data.get("daily_units", {})
            },
            "generation_time_ms": raw_data.get("generationtime_ms")
        }

    def _normalize_current(self, current: Dict, weather_desc: str) -> Dict[str, Any]:
        """Normalize current weather data."""
        if not current:
            return {}

        return {
            "time": current.get("time"),
            "temperature": {
                "value": current.get("temperature_2m"),
                "unit": "°C",
                "feels_like": current.get("apparent_temperature")
            },
            "humidity": {
                "value": current.get("relative_humidity_2m"),
                "unit": "%"
            },
            "precipitation": {
                "value": current.get("precipitation"),
                "rain": current.get("rain"),
                "showers": current.get("showers"),
                "snowfall": current.get("snowfall"),
                "unit": "mm"
            },
            "weather": {
                "code": current.get("weather_code"),
                "description": weather_desc,
                "is_day": current.get("is_day") == 1
            },
            "cloud_cover": {
                "value": current.get("cloud_cover"),
                "unit": "%"
            },
            "pressure": {
                "sea_level": current.get("pressure_msl"),
                "surface": current.get("surface_pressure"),
                "unit": "hPa"
            },
            "wind": {
                "speed": current.get("wind_speed_10m"),
                "direction": current.get("wind_direction_10m"),
                "gusts": current.get("wind_gusts_10m"),
                "speed_unit": "km/h",
                "direction_unit": "°"
            }
        }

    def _normalize_hourly(self, hourly: Dict, units: Dict) -> Dict[str, Any]:
        """Normalize hourly forecast data."""
        if not hourly:
            return {}

        time_array = hourly.get("time", [])

        return {
            "time": time_array,
            "count": len(time_array),
            "temperature_2m": hourly.get("temperature_2m"),
            "relative_humidity_2m": hourly.get("relative_humidity_2m"),
            "dew_point_2m": hourly.get("dew_point_2m"),
            "apparent_temperature": hourly.get("apparent_temperature"),
            "precipitation_probability": hourly.get("precipitation_probability"),
            "precipitation": hourly.get("precipitation"),
            "rain": hourly.get("rain"),
            "showers": hourly.get("showers"),
            "snowfall": hourly.get("snowfall"),
            "weather_code": hourly.get("weather_code"),
            "pressure_msl": hourly.get("pressure_msl"),
            "surface_pressure": hourly.get("surface_pressure"),
            "cloud_cover": hourly.get("cloud_cover"),
            "cloud_cover_low": hourly.get("cloud_cover_low"),
            "cloud_cover_mid": hourly.get("cloud_cover_mid"),
            "cloud_cover_high": hourly.get("cloud_cover_high"),
            "visibility": hourly.get("visibility"),
            "evapotranspiration": hourly.get("evapotranspiration"),
            "et0_fao_evapotranspiration": hourly.get("et0_fao_evapotranspiration"),
            "vapour_pressure_deficit": hourly.get("vapour_pressure_deficit"),
            "wind_speed_10m": hourly.get("wind_speed_10m"),
            "wind_speed_80m": hourly.get("wind_speed_80m"),
            "wind_direction_10m": hourly.get("wind_direction_10m"),
            "wind_direction_80m": hourly.get("wind_direction_80m"),
            "wind_gusts_10m": hourly.get("wind_gusts_10m"),
            "soil_temperature_0cm": hourly.get("soil_temperature_0cm"),
            "soil_temperature_6cm": hourly.get("soil_temperature_6cm"),
            "soil_temperature_18cm": hourly.get("soil_temperature_18cm"),
            "soil_temperature_54cm": hourly.get("soil_temperature_54cm"),
            "soil_moisture_0_to_1cm": hourly.get("soil_moisture_0_to_1cm"),
            "soil_moisture_1_to_3cm": hourly.get("soil_moisture_1_to_3cm"),
            "soil_moisture_3_to_9cm": hourly.get("soil_moisture_3_to_9cm"),
            "soil_moisture_9_to_27cm": hourly.get("soil_moisture_9_to_27cm"),
            "soil_moisture_27_to_81cm": hourly.get("soil_moisture_27_to_81cm"),
            "units": units
        }

    def _normalize_daily(self, daily: Dict, units: Dict) -> Dict[str, Any]:
        """Normalize daily forecast data."""
        if not daily:
            return {}

        time_array = daily.get("time", [])

        # Convert weather codes to descriptions
        weather_codes = daily.get("weather_code", [])
        weather_descriptions = [
            self.WEATHER_CODES.get(code, "Unknown") for code in weather_codes
        ] if weather_codes else []

        return {
            "time": time_array,
            "count": len(time_array),
            "weather_code": weather_codes,
            "weather_description": weather_descriptions,
            "temperature_2m_max": daily.get("temperature_2m_max"),
            "temperature_2m_min": daily.get("temperature_2m_min"),
            "apparent_temperature_max": daily.get("apparent_temperature_max"),
            "apparent_temperature_min": daily.get("apparent_temperature_min"),
            "sunrise": daily.get("sunrise"),
            "sunset": daily.get("sunset"),
            "daylight_duration": daily.get("daylight_duration"),
            "sunshine_duration": daily.get("sunshine_duration"),
            "uv_index_max": daily.get("uv_index_max"),
            "uv_index_clear_sky_max": daily.get("uv_index_clear_sky_max"),
            "precipitation_sum": daily.get("precipitation_sum"),
            "rain_sum": daily.get("rain_sum"),
            "showers_sum": daily.get("showers_sum"),
            "snowfall_sum": daily.get("snowfall_sum"),
            "precipitation_hours": daily.get("precipitation_hours"),
            "precipitation_probability_max": daily.get("precipitation_probability_max"),
            "wind_speed_10m_max": daily.get("wind_speed_10m_max"),
            "wind_gusts_10m_max": daily.get("wind_gusts_10m_max"),
            "wind_direction_10m_dominant": daily.get("wind_direction_10m_dominant"),
            "shortwave_radiation_sum": daily.get("shortwave_radiation_sum"),
            "et0_fao_evapotranspiration": daily.get("et0_fao_evapotranspiration"),
            "units": units
        }

    def get_soil_moisture_average(self, hourly_data: Dict) -> Optional[float]:
        """
        Calculate average soil moisture from hourly data.

        Args:
            hourly_data: Normalized hourly data

        Returns:
            Average soil moisture (0-1 scale) or None
        """
        moisture_keys = [
            "soil_moisture_0_to_1cm",
            "soil_moisture_1_to_3cm",
            "soil_moisture_3_to_9cm",
            "soil_moisture_9_to_27cm"
        ]

        values = []
        for key in moisture_keys:
            data = hourly_data.get(key)
            if data and len(data) > 0:
                # Get current value (index 0 or around current time)
                current_val = data[0] if data[0] is not None else None
                if current_val is not None:
                    values.append(current_val)

        return sum(values) / len(values) if values else None

    def get_uv_index_max_today(self, daily_data: Dict) -> Optional[float]:
        """
        Get today's maximum UV index.

        Args:
            daily_data: Normalized daily data

        Returns:
            Today's max UV index or None
        """
        uv_max = daily_data.get("uv_index_max")
        if uv_max and len(uv_max) > 0:
            return uv_max[0]
        return None


# Convenience function for quick weather fetches
async def get_weather_forecast(
    lat: float,
    lon: float,
    forecast_days: int = 7
) -> Dict[str, Any]:
    """
    Quick fetch of weather forecast data.

    Args:
        lat: Latitude
        lon: Longitude
        forecast_days: Number of forecast days

    Returns:
        Normalized weather forecast data
    """
    api = OpenMeteoWeatherAPI()
    return await api.get_data(lat, lon, forecast_days=forecast_days)


async def get_soil_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Get soil temperature and moisture data.

    Args:
        lat: Latitude
        lon: Longitude

    Returns:
        Soil data from Open-Meteo
    """
    api = OpenMeteoWeatherAPI()

    soil_params = [
        "soil_temperature_0cm",
        "soil_temperature_6cm",
        "soil_temperature_18cm",
        "soil_moisture_0_to_1cm",
        "soil_moisture_1_to_3cm",
        "soil_moisture_3_to_9cm",
        "soil_moisture_9_to_27cm"
    ]

    return await api.get_data(
        lat, lon,
        include_current=False,
        include_daily=False,
        hourly_params=soil_params,
        forecast_days=1,
        past_days=0
    )
