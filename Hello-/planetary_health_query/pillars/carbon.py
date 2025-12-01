"""
Pillar C: Carbon - Forest Cover, Biomass, Carbon Storage
Datasets: Hansen GFC, GEDI L4A, ETH Canopy Height
"""

from typing import Dict, List, Any, Tuple
import ee
from .base import BasePillar
from ..core.config import DATASETS


class CarbonPillar(BasePillar):
    """Carbon pillar - forest and carbon storage."""

    PILLAR_ID = "C"
    PILLAR_NAME = "Carbon"
    PILLAR_COLOR = "#8e44ad"

    def get_simple_metrics(self) -> List[str]:
        return ["tree_cover", "forest_loss"]

    def get_comprehensive_metrics(self) -> List[str]:
        return ["tree_cover", "forest_loss", "canopy_height", "biomass", "carbon_stock"]

    def query_metrics(
        self,
        point: ee.Geometry.Point,
        buffer_radius: int,
        date_range: Tuple[str, str],
        metrics: List[str]
    ) -> Dict[str, Any]:
        """Query carbon metrics."""

        region = self._create_buffered_region(point, buffer_radius)

        results = {"metrics": {}}

        # Query Hansen Global Forest Change
        if "tree_cover" in metrics or "forest_loss" in metrics:
            try:
                hansen = ee.Image(DATASETS["hansen_gfc"]["id"])
                hansen_data = self._reduce_region(hansen, region, scale=30)

                if "tree_cover" in metrics:
                    tree_cover = self._safe_get_value(
                        hansen_data,
                        DATASETS["hansen_gfc"]["bands"]["tree_cover"]
                    )
                    results["metrics"]["tree_cover"] = {
                        "value": tree_cover,
                        "unit": "percent",
                        "description": "Tree Cover in Year 2000",
                        "quality": self._assess_quality(tree_cover, "tree_cover")
                    }

                if "forest_loss" in metrics:
                    # Calculate loss as fraction of original cover
                    loss = hansen_data.get(DATASETS["hansen_gfc"]["bands"]["loss"])
                    loss_year = hansen_data.get(DATASETS["hansen_gfc"]["bands"]["loss_year"])

                    results["metrics"]["forest_loss"] = {
                        "value": 1 if loss else 0,
                        "loss_year": 2000 + loss_year if loss_year else None,
                        "unit": "binary",
                        "description": "Forest Loss Detected Since 2000",
                        "quality": "good"
                    }

            except Exception as e:
                for m in ["tree_cover", "forest_loss"]:
                    if m in metrics:
                        results["metrics"][m] = {
                            "value": None,
                            "quality": "unavailable",
                            "error": str(e)
                        }

        # Query Canopy Height
        if "canopy_height" in metrics:
            try:
                # Try GEDI first
                gedi_success = self._query_gedi_height(region, results)

                if not gedi_success:
                    # Fallback to ETH Canopy Height
                    self._query_eth_height(region, results)

            except Exception as e:
                results["metrics"]["canopy_height"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Query Biomass from GEDI
        if "biomass" in metrics:
            try:
                gedi_collection = ee.ImageCollection(DATASETS["gedi_biomass"]["id"]) \
                    .filterBounds(region)

                count = gedi_collection.size().getInfo()

                if count > 0:
                    gedi_image = gedi_collection.mean()
                    gedi_data = self._reduce_region(gedi_image, region, scale=1000)

                    biomass_value = self._safe_get_value(
                        gedi_data,
                        DATASETS["gedi_biomass"]["band"]
                    )

                    results["metrics"]["biomass"] = {
                        "value": biomass_value,
                        "unit": "Mg/ha",
                        "description": "Above-ground Biomass Density",
                        "source": "GEDI L4A",
                        "quality": self._assess_quality(biomass_value, "biomass")
                    }
                else:
                    # Estimate from canopy height if available
                    canopy_height = results.get("metrics", {}).get("canopy_height", {}).get("value")
                    if canopy_height:
                        # Simple allometric estimate
                        biomass_est = canopy_height * 8  # Rough estimate
                        results["metrics"]["biomass"] = {
                            "value": biomass_est,
                            "unit": "Mg/ha",
                            "description": "Above-ground Biomass (estimated from height)",
                            "source": "Estimated",
                            "quality": "moderate"
                        }
                    else:
                        results["metrics"]["biomass"] = {
                            "value": None,
                            "quality": "unavailable",
                            "error": "No GEDI data available"
                        }

            except Exception as e:
                results["metrics"]["biomass"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        # Calculate Carbon Stock
        if "carbon_stock" in metrics:
            biomass = results.get("metrics", {}).get("biomass", {}).get("value")
            if biomass is not None:
                # Carbon is approximately 50% of biomass
                carbon = biomass * 0.5
                results["metrics"]["carbon_stock"] = {
                    "value": carbon,
                    "unit": "Mg C/ha",
                    "description": "Carbon Stock (0.5 x biomass)",
                    "quality": results["metrics"]["biomass"]["quality"]
                }
            else:
                results["metrics"]["carbon_stock"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": "Requires biomass estimate"
                }

        results["data_date"] = "2023"  # Hansen is annual
        return results

    def _query_gedi_height(self, region: ee.Geometry, results: Dict) -> bool:
        """Query GEDI canopy height. Returns True if successful."""
        try:
            gedi_collection = ee.ImageCollection(DATASETS["gedi_biomass"]["id"]) \
                .filterBounds(region)

            count = gedi_collection.size().getInfo()

            if count > 0:
                gedi_image = gedi_collection.mean()
                gedi_data = self._reduce_region(gedi_image, region, scale=1000)

                height_value = self._safe_get_value(gedi_data, "rh_98")

                if height_value is not None:
                    results["metrics"]["canopy_height"] = {
                        "value": height_value,
                        "unit": "meters",
                        "description": "Canopy Height (98th percentile)",
                        "source": "GEDI",
                        "quality": self._assess_quality(height_value, "canopy_height")
                    }
                    return True

            return False

        except Exception:
            return False

    def _query_eth_height(self, region: ee.Geometry, results: Dict):
        """Query ETH Canopy Height as fallback."""
        try:
            eth_height = ee.Image(DATASETS["eth_canopy_height"]["id"])
            eth_data = self._reduce_region(eth_height, region, scale=10)

            height_value = self._safe_get_value(
                eth_data,
                DATASETS["eth_canopy_height"]["band"]
            )

            results["metrics"]["canopy_height"] = {
                "value": height_value,
                "unit": "meters",
                "description": "Canopy Height",
                "source": "ETH Global Canopy Height 2020",
                "quality": self._assess_quality(height_value, "canopy_height")
            }

        except Exception as e:
            results["metrics"]["canopy_height"] = {
                "value": None,
                "quality": "unavailable",
                "error": str(e)
            }
