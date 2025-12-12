"""
Pillar A: Atmospheric - Air Quality, Aerosols, UV Index
Datasets: MODIS MCD19A2 (AOD), MODIS MOD08_M3 (Atmosphere)
"""

from typing import Dict, List, Any, Tuple
import ee
from .base import BasePillar
from ..core.config import DATASETS


class AtmosphericPillar(BasePillar):
    """Atmospheric health pillar - air quality and atmospheric conditions."""

    PILLAR_ID = "A"
    PILLAR_NAME = "Atmospheric"
    PILLAR_COLOR = "#3498db"

    def get_simple_metrics(self) -> List[str]:
        return ["aod", "aqi"]

    def get_comprehensive_metrics(self) -> List[str]:
        return ["aod", "aqi", "uv_index", "visibility", "cloud_fraction"]

    def query_metrics(
        self,
        point: ee.Geometry.Point,
        buffer_radius: int,
        date_range: Tuple[str, str],
        metrics: List[str]
    ) -> Dict[str, Any]:
        """Query atmospheric metrics."""

        region = self._create_buffered_region(point, buffer_radius)
        date_filter = self._get_date_filter(date_range)

        results = {"metrics": {}}
        data_dates = []

        # Query AOD from MCD19A2
        if "aod" in metrics:
            try:
                aod_collection = ee.ImageCollection(DATASETS["modis_aod"]["id"]) \
                    .filter(date_filter) \
                    .filterBounds(region)

                aod_image = aod_collection.mean()
                aod_data = self._reduce_region(
                    aod_image,
                    region,
                    scale=1000
                )

                aod_value = self._safe_get_value(
                    aod_data,
                    DATASETS["modis_aod"]["band"],
                    scale_factor=DATASETS["modis_aod"]["scale_factor"]
                )

                results["metrics"]["aod"] = {
                    "value": aod_value,
                    "unit": "dimensionless",
                    "description": "Aerosol Optical Depth at 470nm",
                    "quality": self._assess_aod_quality(aod_value)
                }
            except Exception as e:
                results["metrics"]["aod"] = {
                    "value": None,
                    "unit": "dimensionless",
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Query atmosphere products from MOD08_M3
        if any(m in metrics for m in ["aqi", "uv_index", "cloud_fraction"]):
            try:
                atm_collection = ee.ImageCollection(DATASETS["modis_atmosphere"]["id"]) \
                    .filter(date_filter) \
                    .filterBounds(region)

                atm_image = atm_collection.mean()
                atm_data = self._reduce_region(
                    atm_image,
                    region,
                    scale=100000  # ~1 degree
                )

                if "aqi" in metrics:
                    aqi_value = self._safe_get_value(
                        atm_data,
                        DATASETS["modis_atmosphere"]["bands"]["aqi"]
                    )
                    # Convert AOD to AQI estimate (simplified)
                    if aqi_value is not None:
                        aqi_value = min(500, max(0, aqi_value * 1000))

                    results["metrics"]["aqi"] = {
                        "value": aqi_value,
                        "unit": "index",
                        "description": "Air Quality Index (estimated from AOD)",
                        "quality": self._assess_aqi_quality(aqi_value)
                    }

                if "uv_index" in metrics:
                    uv_value = self._safe_get_value(
                        atm_data,
                        DATASETS["modis_atmosphere"]["bands"]["uv"]
                    )
                    # Convert ozone to UV index estimate
                    if uv_value is not None:
                        uv_value = max(0, 15 - (uv_value / 30))

                    results["metrics"]["uv_index"] = {
                        "value": uv_value,
                        "unit": "index",
                        "description": "UV Index (estimated)",
                        "quality": self._assess_quality(uv_value, "uv_index")
                    }

                if "cloud_fraction" in metrics:
                    cloud_value = self._safe_get_value(
                        atm_data,
                        DATASETS["modis_atmosphere"]["bands"]["cloud"],
                        scale_factor=0.01
                    )

                    results["metrics"]["cloud_fraction"] = {
                        "value": cloud_value,
                        "unit": "fraction",
                        "description": "Cloud Fraction",
                        "quality": self._assess_quality(cloud_value, "cloud_fraction")
                    }

            except Exception as e:
                for m in ["aqi", "uv_index", "cloud_fraction"]:
                    if m in metrics and m not in results["metrics"]:
                        results["metrics"][m] = {
                            "value": None,
                            "quality": "unavailable",
                            "error": str(e)
                        }

        # Calculate visibility from AOD (derived metric)
        if "visibility" in metrics:
            aod_data = results["metrics"].get("aod", {})
            aod_value = aod_data.get("value")

            if aod_value is not None and aod_value >= 0:
                # Empirical formula: visibility (km) ~ 50 / (1 + 10 * AOD)
                # Based on Koschmieder equation approximation
                visibility_km = 50 / (1 + 10 * aod_value)
                visibility_km = max(1, min(50, visibility_km))  # Clamp to 1-50 km range

                results["metrics"]["visibility"] = {
                    "value": round(visibility_km, 2),
                    "unit": "km",
                    "description": "Estimated Visibility (derived from AOD)",
                    "quality": "moderate",  # Derived metric, so marked as moderate
                    "source": "derived_from_aod"
                }
            else:
                results["metrics"]["visibility"] = {
                    "value": None,
                    "unit": "km",
                    "quality": "unavailable",
                    "error": "Requires valid AOD value for calculation"
                }

        results["data_date"] = date_range[1]
        return results

    def _assess_aod_quality(self, value: float) -> str:
        """Assess AOD data quality."""
        if value is None:
            return "unavailable"
        if value < 0 or value > 3:
            return "poor"
        if value < 0.1:
            return "good"
        if value < 0.3:
            return "moderate"
        return "good"

    def _assess_aqi_quality(self, value: float) -> str:
        """Assess AQI data quality."""
        if value is None:
            return "unavailable"
        if value < 0 or value > 500:
            return "poor"
        return "good"
