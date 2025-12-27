"""
Pillar D: Degradation - Land and Water Stress
Datasets: MODIS LST, SMAP/ERA5 Soil Moisture, JRC Water, MODIS ET
"""

from typing import Dict, List, Any, Tuple
import ee
from .base import BasePillar
from ..core.config import DATASETS


class DegradationPillar(BasePillar):
    """DLWD pillar - Decrease in Land & Water Degradation indicators."""

    PILLAR_ID = "D"
    PILLAR_NAME = "DLWD"
    PILLAR_COLOR = "#e74c3c"

    def get_simple_metrics(self) -> List[str]:
        return ["lst", "soil_moisture"]

    def get_comprehensive_metrics(self) -> List[str]:
        return ["lst", "soil_moisture", "water_occurrence", "drought_index", "evaporative_stress"]

    def query_metrics(
        self,
        point: ee.Geometry.Point,
        buffer_radius: int,
        date_range: Tuple[str, str],
        metrics: List[str]
    ) -> Dict[str, Any]:
        """Query degradation metrics."""

        region = self._create_buffered_region(point, buffer_radius)
        date_filter = self._get_date_filter(date_range)

        results = {"metrics": {}}

        # Query Land Surface Temperature from MODIS
        if "lst" in metrics:
            try:
                lst_collection = ee.ImageCollection(DATASETS["modis_lst"]["id"]) \
                    .filter(date_filter) \
                    .filterBounds(region)

                lst_image = lst_collection.mean()
                lst_data = self._reduce_region(lst_image, region, scale=1000)

                lst_day = self._safe_get_value(
                    lst_data,
                    DATASETS["modis_lst"]["bands"]["lst_day"],
                    scale_factor=DATASETS["modis_lst"]["scale_factor"],
                    offset=DATASETS["modis_lst"]["offset"]
                )

                lst_night = self._safe_get_value(
                    lst_data,
                    DATASETS["modis_lst"]["bands"]["lst_night"],
                    scale_factor=DATASETS["modis_lst"]["scale_factor"],
                    offset=DATASETS["modis_lst"]["offset"]
                )

                # Use day temperature as primary, calculate range
                lst_value = lst_day
                lst_range = None
                if lst_day is not None and lst_night is not None:
                    lst_range = lst_day - lst_night

                results["metrics"]["lst"] = {
                    "value": lst_value,
                    "lst_day": lst_day,
                    "lst_night": lst_night,
                    "diurnal_range": lst_range,
                    "unit": "Celsius",
                    "description": "Land Surface Temperature",
                    "quality": self._assess_lst_quality(lst_value)
                }

            except Exception as e:
                results["metrics"]["lst"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Query Soil Moisture
        if "soil_moisture" in metrics:
            try:
                # Try SMAP first
                smap_success = self._query_smap(region, date_filter, results)

                if not smap_success:
                    # Fallback to ERA5
                    self._query_era5_soil(region, date_filter, results)

            except Exception as e:
                results["metrics"]["soil_moisture"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Query Water Occurrence from JRC
        if "water_occurrence" in metrics:
            try:
                jrc_water = ee.Image(DATASETS["jrc_water"]["id"])
                water_data = self._reduce_region(jrc_water, region, scale=30)

                occurrence = self._safe_get_value(
                    water_data,
                    DATASETS["jrc_water"]["bands"]["occurrence"]
                )

                seasonality = self._safe_get_value(
                    water_data,
                    DATASETS["jrc_water"]["bands"]["seasonality"]
                )

                results["metrics"]["water_occurrence"] = {
                    "value": occurrence,
                    "seasonality": seasonality,
                    "unit": "percent",
                    "description": "Surface Water Occurrence (1984-2021)",
                    "quality": "good" if occurrence is not None else "unavailable"
                }

            except Exception as e:
                results["metrics"]["water_occurrence"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Calculate Drought Index (simplified)
        if "drought_index" in metrics:
            # Calculate from soil moisture and temperature
            sm = results.get("metrics", {}).get("soil_moisture", {}).get("value")
            lst = results.get("metrics", {}).get("lst", {}).get("value")

            if sm is not None and lst is not None:
                # Simplified drought index: low soil moisture + high temp = drought
                # Normalize and combine
                sm_norm = (sm - 0.2) / 0.3  # Center around typical values
                lst_norm = (lst - 25) / 15  # Center around 25C

                drought_index = -sm_norm + (lst_norm * 0.5)
                drought_index = max(-3, min(3, drought_index))

                results["metrics"]["drought_index"] = {
                    "value": drought_index,
                    "unit": "index",
                    "description": "Drought Index (-3 to +3, higher = more drought stress)",
                    "interpretation": self._interpret_drought(drought_index),
                    "quality": "moderate"
                }
            else:
                results["metrics"]["drought_index"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": "Requires soil moisture and LST"
                }

        # Query Evaporative Stress from MODIS ET
        if "evaporative_stress" in metrics:
            try:
                et_collection = ee.ImageCollection(DATASETS["modis_et"]["id"]) \
                    .filter(date_filter) \
                    .filterBounds(region)

                et_image = et_collection.mean()
                et_data = self._reduce_region(et_image, region, scale=500)

                et_value = self._safe_get_value(
                    et_data,
                    DATASETS["modis_et"]["bands"]["et"],
                    scale_factor=DATASETS["modis_et"]["scale_factor"]
                )

                pet_value = self._safe_get_value(
                    et_data,
                    DATASETS["modis_et"]["bands"]["pet"],
                    scale_factor=DATASETS["modis_et"]["scale_factor"]
                )

                # Calculate Evaporative Stress Index
                esi = None
                if et_value is not None and pet_value is not None and pet_value > 0:
                    esi = 1 - (et_value / pet_value)

                results["metrics"]["evaporative_stress"] = {
                    "value": esi,
                    "et": et_value,
                    "pet": pet_value,
                    "unit": "index",
                    "description": "Evaporative Stress Index (1 - ET/PET)",
                    "quality": "good" if esi is not None else "unavailable"
                }

            except Exception as e:
                results["metrics"]["evaporative_stress"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        results["data_date"] = date_range[1]
        return results

    def _query_smap(
        self,
        region: ee.Geometry,
        date_filter: ee.Filter,
        results: Dict
    ) -> bool:
        """Query SMAP soil moisture. Returns True if successful."""
        try:
            smap_collection = ee.ImageCollection(DATASETS["smap_soil_moisture"]["id"]) \
                .filter(date_filter) \
                .filterBounds(region)

            count = smap_collection.size().getInfo()

            if count > 0:
                smap_image = smap_collection.mean()
                smap_data = self._reduce_region(smap_image, region, scale=11000)

                sm_value = self._safe_get_value(
                    smap_data,
                    DATASETS["smap_soil_moisture"]["band"]
                )

                if sm_value is not None:
                    results["metrics"]["soil_moisture"] = {
                        "value": sm_value,
                        "unit": "m3/m3",
                        "description": "Surface Soil Moisture",
                        "source": "SMAP L4",
                        "quality": self._assess_sm_quality(sm_value)
                    }
                    return True

            return False

        except Exception:
            return False

    def _query_era5_soil(
        self,
        region: ee.Geometry,
        date_filter: ee.Filter,
        results: Dict
    ):
        """Query ERA5 soil moisture as fallback."""
        try:
            era5_collection = ee.ImageCollection(DATASETS["era5_land"]["id"]) \
                .filter(date_filter) \
                .filterBounds(region)

            era5_image = era5_collection.mean()
            era5_data = self._reduce_region(era5_image, region, scale=11000)

            sm_value = self._safe_get_value(
                era5_data,
                DATASETS["era5_land"]["bands"]["soil_moisture"]
            )

            results["metrics"]["soil_moisture"] = {
                "value": sm_value,
                "unit": "m3/m3",
                "description": "Volumetric Soil Water (Layer 1)",
                "source": "ERA5-Land",
                "quality": self._assess_sm_quality(sm_value)
            }

        except Exception as e:
            results["metrics"]["soil_moisture"] = {
                "value": None,
                "quality": "unavailable",
                "error": str(e)
            }

    def _assess_lst_quality(self, value: float) -> str:
        """Assess LST data quality."""
        if value is None:
            return "unavailable"
        if value < -60 or value > 70:
            return "poor"
        return "good"

    def _assess_sm_quality(self, value: float) -> str:
        """Assess soil moisture data quality."""
        if value is None:
            return "unavailable"
        if value < 0 or value > 0.6:
            return "poor"
        return "good"

    def _interpret_drought(self, value: float) -> str:
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
