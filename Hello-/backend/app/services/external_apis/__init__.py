"""
External APIs Package - Real-time environmental data from external sources.

Provides clients for:
- Open-Meteo Air Quality: AQI, UV index, pollutants (no API key required)
- Open-Meteo Weather: Temperature, humidity, soil moisture, forecasts (no API key required)
- OpenAQ: Ground-truth air quality from monitoring stations
"""

from .open_meteo import OpenMeteoAPI
from .open_meteo_weather import OpenMeteoWeatherAPI
from .openaq import OpenAQAPI
from .aggregator import ExternalDataAggregator
from .cache import ExternalAPICache

__all__ = [
    "OpenMeteoAPI",
    "OpenMeteoWeatherAPI",
    "OpenAQAPI",
    "ExternalDataAggregator",
    "ExternalAPICache"
]
