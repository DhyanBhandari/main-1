"""
Pillar B: Biodiversity - Vegetation Health, Land Cover, Ecosystem Diversity
Datasets: Sentinel-2, MODIS MOD13A2, MODIS MOD15A2H, ESA WorldCover
"""

from typing import Dict, List, Any, Tuple
import ee
from .base import BasePillar
from ..core.config import DATASETS


class BiodiversityPillar(BasePillar):
    """Biodiversity pillar - vegetation and ecosystem health."""

    PILLAR_ID = "B"
    PILLAR_NAME = "Biodiversity"
    PILLAR_COLOR = "#27ae60"

    def get_simple_metrics(self) -> List[str]:
        return ["ndvi", "evi"]

    def get_comprehensive_metrics(self) -> List[str]:
        return ["ndvi", "evi", "lai", "land_cover", "fpar"]

    def query_metrics(
        self,
        point: ee.Geometry.Point,
        buffer_radius: int,
        date_range: Tuple[str, str],
        metrics: List[str]
    ) -> Dict[str, Any]:
        """Query biodiversity metrics."""

        region = self._create_buffered_region(point, buffer_radius)
        date_filter = self._get_date_filter(date_range)

        results = {"metrics": {}}

        # Query NDVI/EVI from Sentinel-2 (preferred) or MODIS
        if "ndvi" in metrics or "evi" in metrics:
            try:
                # Try Sentinel-2 first for higher resolution
                s2_collection = ee.ImageCollection(DATASETS["sentinel2"]["id"]) \
                    .filter(date_filter) \
                    .filterBounds(region) \
                    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))

                count = s2_collection.size().getInfo()

                if count > 0:
                    # Calculate NDVI from Sentinel-2
                    def calc_ndvi(image):
                        ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
                        evi = image.expression(
                            "2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))",
                            {
                                "NIR": image.select("B8"),
                                "RED": image.select("B4"),
                                "BLUE": image.select("B2")
                            }
                        ).rename("EVI")
                        return image.addBands([ndvi, evi])

                    s2_with_vi = s2_collection.map(calc_ndvi)
                    vi_image = s2_with_vi.select(["NDVI", "EVI"]).mean()

                    vi_data = self._reduce_region(vi_image, region, scale=10)

                    if "ndvi" in metrics:
                        results["metrics"]["ndvi"] = {
                            "value": self._safe_get_value(vi_data, "NDVI"),
                            "unit": "dimensionless",
                            "description": "Normalized Difference Vegetation Index",
                            "source": "Sentinel-2",
                            "resolution": "10m",
                            "quality": self._assess_ndvi_quality(
                                self._safe_get_value(vi_data, "NDVI")
                            )
                        }

                    if "evi" in metrics:
                        results["metrics"]["evi"] = {
                            "value": self._safe_get_value(vi_data, "EVI"),
                            "unit": "dimensionless",
                            "description": "Enhanced Vegetation Index",
                            "source": "Sentinel-2",
                            "resolution": "10m",
                            "quality": self._assess_quality(
                                self._safe_get_value(vi_data, "EVI"), "evi"
                            )
                        }
                else:
                    # Fallback to MODIS
                    self._query_modis_vi(region, date_filter, metrics, results)

            except Exception as e:
                # Try MODIS as fallback
                try:
                    self._query_modis_vi(region, date_filter, metrics, results)
                except Exception as e2:
                    for m in ["ndvi", "evi"]:
                        if m in metrics:
                            results["metrics"][m] = {
                                "value": None,
                                "quality": "unavailable",
                                "error": str(e2)
                            }

        # Query LAI and FPAR from MODIS
        if "lai" in metrics or "fpar" in metrics:
            try:
                lai_collection = ee.ImageCollection(DATASETS["modis_lai"]["id"]) \
                    .filter(date_filter) \
                    .filterBounds(region)

                lai_image = lai_collection.mean()
                lai_data = self._reduce_region(lai_image, region, scale=500)

                if "lai" in metrics:
                    lai_value = self._safe_get_value(
                        lai_data,
                        DATASETS["modis_lai"]["bands"]["lai"],
                        scale_factor=DATASETS["modis_lai"]["scale_factor"]
                    )
                    results["metrics"]["lai"] = {
                        "value": lai_value,
                        "unit": "m2/m2",
                        "description": "Leaf Area Index",
                        "quality": self._assess_quality(lai_value, "lai")
                    }

                if "fpar" in metrics:
                    fpar_value = self._safe_get_value(
                        lai_data,
                        DATASETS["modis_lai"]["bands"]["fpar"],
                        scale_factor=0.01
                    )
                    results["metrics"]["fpar"] = {
                        "value": fpar_value,
                        "unit": "fraction",
                        "description": "Fraction of Absorbed PAR",
                        "quality": self._assess_quality(fpar_value, "fpar")
                    }

            except Exception as e:
                for m in ["lai", "fpar"]:
                    if m in metrics:
                        results["metrics"][m] = {
                            "value": None,
                            "quality": "unavailable",
                            "error": str(e)
                        }

        # Query Land Cover from WorldCover
        if "land_cover" in metrics:
            try:
                worldcover = ee.ImageCollection(DATASETS["worldcover"]["id"]) \
                    .filterBounds(region) \
                    .first()

                lc_data = self._reduce_region(
                    worldcover,
                    region,
                    scale=10,
                    reducer=ee.Reducer.mode()
                )

                lc_value = lc_data.get(DATASETS["worldcover"]["band"])
                lc_class = DATASETS["worldcover"]["classes"].get(
                    lc_value, "Unknown"
                ) if lc_value else None

                results["metrics"]["land_cover"] = {
                    "value": lc_value,
                    "class_name": lc_class,
                    "unit": "class",
                    "description": "Dominant Land Cover Class",
                    "quality": "good" if lc_value else "unavailable"
                }

            except Exception as e:
                results["metrics"]["land_cover"] = {
                    "value": None,
                    "quality": "unavailable",
                    "error": str(e)
                }

        results["data_date"] = date_range[1]
        return results

    def _query_modis_vi(
        self,
        region: ee.Geometry,
        date_filter: ee.Filter,
        metrics: List[str],
        results: Dict
    ):
        """Query MODIS vegetation indices as fallback."""
        modis_collection = ee.ImageCollection(DATASETS["modis_ndvi"]["id"]) \
            .filter(date_filter) \
            .filterBounds(region)

        modis_image = modis_collection.mean()
        modis_data = self._reduce_region(modis_image, region, scale=1000)

        if "ndvi" in metrics:
            ndvi_value = self._safe_get_value(
                modis_data,
                DATASETS["modis_ndvi"]["bands"]["ndvi"],
                scale_factor=DATASETS["modis_ndvi"]["scale_factor"]
            )
            results["metrics"]["ndvi"] = {
                "value": ndvi_value,
                "unit": "dimensionless",
                "description": "Normalized Difference Vegetation Index",
                "source": "MODIS",
                "resolution": "1km",
                "quality": self._assess_ndvi_quality(ndvi_value)
            }

        if "evi" in metrics:
            evi_value = self._safe_get_value(
                modis_data,
                DATASETS["modis_ndvi"]["bands"]["evi"],
                scale_factor=DATASETS["modis_ndvi"]["scale_factor"]
            )
            results["metrics"]["evi"] = {
                "value": evi_value,
                "unit": "dimensionless",
                "description": "Enhanced Vegetation Index",
                "source": "MODIS",
                "resolution": "1km",
                "quality": self._assess_quality(evi_value, "evi")
            }

    def _assess_ndvi_quality(self, value: float) -> str:
        """Assess NDVI data quality."""
        if value is None:
            return "unavailable"
        if value < -1 or value > 1:
            return "poor"
        return "good"
