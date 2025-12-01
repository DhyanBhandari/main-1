"""
Pillar E: Ecosystem Services - Human Impact and Services
Datasets: WorldPop, VIIRS DNB, CSP gHM, SRTM
"""

from typing import Dict, List, Any, Tuple
import ee
from .base import BasePillar
from ..core.config import DATASETS


class EcosystemPillar(BasePillar):
    """Ecosystem services pillar - human impact and ecosystem services."""

    PILLAR_ID = "E"
    PILLAR_NAME = "Ecosystem"
    PILLAR_COLOR = "#f39c12"

    def get_simple_metrics(self) -> List[str]:
        return ["population", "nightlights"]

    def get_comprehensive_metrics(self) -> List[str]:
        return ["population", "nightlights", "human_modification", "elevation", "distance_to_water"]

    def query_metrics(
        self,
        point: ee.Geometry.Point,
        buffer_radius: int,
        date_range: Tuple[str, str],
        metrics: List[str]
    ) -> Dict[str, Any]:
        """Query ecosystem metrics."""

        region = self._create_buffered_region(point, buffer_radius)
        date_filter = self._get_date_filter(date_range)

        results = {"metrics": {}}

        # Query Population Density from WorldPop
        if "population" in metrics:
            try:
                # WorldPop uses annual collections
                year = int(date_range[1][:4])
                worldpop = ee.ImageCollection(DATASETS["worldpop"]["id"]) \
                    .filterBounds(region) \
                    .filter(ee.Filter.eq("year", min(year, 2020)))  # Max available year

                pop_image = worldpop.first()

                if pop_image:
                    pop_data = self._reduce_region(
                        pop_image,
                        region,
                        scale=100,
                        reducer=ee.Reducer.sum()
                    )

                    # Get total population in buffer
                    pop_total = self._safe_get_value(pop_data, DATASETS["worldpop"]["band"])

                    # Calculate density (people per km2)
                    area_km2 = region.area().divide(1e6).getInfo()
                    pop_density = pop_total / area_km2 if pop_total and area_km2 else None

                    results["metrics"]["population"] = {
                        "value": pop_density,
                        "total_in_buffer": pop_total,
                        "buffer_area_km2": area_km2,
                        "unit": "people/km2",
                        "description": "Population Density",
                        "quality": "good" if pop_density is not None else "unavailable"
                    }
                else:
                    results["metrics"]["population"] = {
                        "value": None,
                        "quality": "unavailable",
                        "error": "No WorldPop data available"
                    }

            except Exception as e:
                results["metrics"]["population"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Query Nighttime Lights from VIIRS
        if "nightlights" in metrics:
            try:
                viirs_collection = ee.ImageCollection(DATASETS["viirs_dnb"]["id"]) \
                    .filter(date_filter) \
                    .filterBounds(region)

                viirs_image = viirs_collection.mean()
                viirs_data = self._reduce_region(viirs_image, region, scale=500)

                radiance = self._safe_get_value(
                    viirs_data,
                    DATASETS["viirs_dnb"]["band"]
                )

                results["metrics"]["nightlights"] = {
                    "value": radiance,
                    "unit": "nanoWatts/cm2/sr",
                    "description": "Nighttime Lights Radiance",
                    "interpretation": self._interpret_nightlights(radiance),
                    "quality": "good" if radiance is not None else "unavailable"
                }

            except Exception as e:
                results["metrics"]["nightlights"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Query Human Modification Index
        if "human_modification" in metrics:
            try:
                ghm = ee.ImageCollection(DATASETS["human_modification"]["id"]).first()
                ghm_data = self._reduce_region(ghm, region, scale=1000)

                hm_value = self._safe_get_value(
                    ghm_data,
                    DATASETS["human_modification"]["band"]
                )

                results["metrics"]["human_modification"] = {
                    "value": hm_value,
                    "unit": "index 0-1",
                    "description": "Global Human Modification Index",
                    "interpretation": self._interpret_hm(hm_value),
                    "quality": "good" if hm_value is not None else "unavailable"
                }

            except Exception as e:
                results["metrics"]["human_modification"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Query Elevation from SRTM
        if "elevation" in metrics:
            try:
                srtm = ee.Image(DATASETS["srtm"]["id"])
                elev_data = self._reduce_region(srtm, region, scale=30)

                elevation = self._safe_get_value(
                    elev_data,
                    DATASETS["srtm"]["band"]
                )

                # Also get min/max for terrain analysis
                elev_stats = srtm.reduceRegion(
                    reducer=ee.Reducer.minMax(),
                    geometry=region,
                    scale=30,
                    maxPixels=1e9
                ).getInfo()

                elev_min = elev_stats.get("elevation_min")
                elev_max = elev_stats.get("elevation_max")
                relief = elev_max - elev_min if elev_min and elev_max else None

                results["metrics"]["elevation"] = {
                    "value": elevation,
                    "min": elev_min,
                    "max": elev_max,
                    "relief": relief,
                    "unit": "meters",
                    "description": "Elevation Above Sea Level",
                    "quality": "good" if elevation is not None else "unavailable"
                }

            except Exception as e:
                results["metrics"]["elevation"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Calculate Distance to Water
        if "distance_to_water" in metrics:
            try:
                # Use JRC water occurrence > 50% as "water"
                jrc_water = ee.Image(DATASETS["jrc_water"]["id"]) \
                    .select(DATASETS["jrc_water"]["bands"]["occurrence"])

                water_mask = jrc_water.gt(50)

                # Calculate distance to nearest water pixel
                distance = water_mask.Not().cumulativeCost(
                    source=water_mask,
                    maxDistance=50000
                )

                dist_data = self._reduce_region(distance, region, scale=100)

                dist_value = self._safe_get_value(dist_data, "occurrence")

                results["metrics"]["distance_to_water"] = {
                    "value": dist_value,
                    "unit": "meters",
                    "description": "Distance to Nearest Permanent Water",
                    "quality": "good" if dist_value is not None else "moderate"
                }

            except Exception as e:
                # Fallback: check if there's water in the region
                try:
                    jrc_water = ee.Image(DATASETS["jrc_water"]["id"]) \
                        .select(DATASETS["jrc_water"]["bands"]["occurrence"])
                    water_data = self._reduce_region(jrc_water, region, scale=30)
                    occurrence = self._safe_get_value(water_data, "occurrence")

                    results["metrics"]["distance_to_water"] = {
                        "value": 0 if occurrence and occurrence > 50 else None,
                        "water_in_region": occurrence is not None and occurrence > 50,
                        "unit": "meters",
                        "description": "Distance to Water (simplified)",
                        "quality": "moderate"
                    }
                except Exception:
                    results["metrics"]["distance_to_water"] = {
                        "value": None,
                        "quality": "unavailable",
                        "error": str(e)
                    }

        results["data_date"] = date_range[1]
        return results

    def _interpret_nightlights(self, value: float) -> str:
        """Interpret nighttime lights radiance."""
        if value is None:
            return "Unknown"
        if value < 0.5:
            return "Very Dark (wilderness/rural)"
        elif value < 5:
            return "Low (rural/suburban)"
        elif value < 20:
            return "Moderate (suburban/urban)"
        elif value < 50:
            return "High (urban)"
        else:
            return "Very High (urban core)"

    def _interpret_hm(self, value: float) -> str:
        """Interpret human modification index."""
        if value is None:
            return "Unknown"
        if value < 0.1:
            return "Very Low (natural)"
        elif value < 0.3:
            return "Low"
        elif value < 0.5:
            return "Moderate"
        elif value < 0.7:
            return "High"
        else:
            return "Very High (heavily modified)"
