"""
Main GEE Query Engine - Orchestrates all pillar queries.
This is the primary entry point for the Planetary Health Query System.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

from .authenticator import initialize_ee, get_project_id
from .config import PILLAR_CONFIG, LANDCOVER_TO_ECOSYSTEM, ECOSYSTEM_CATEGORY_WEIGHTS
from ..pillars import (
    AtmosphericPillar,
    BiodiversityPillar,
    CarbonPillar,
    DegradationPillar,
    EcosystemPillar
)
from ..utils.scoring import (
    calculate_pillar_score,
    calculate_overall_score,
    calculate_phi_esv_multiplier,
    get_score_interpretation
)
from ..utils.quality import (
    assess_data_completeness,
    calculate_dqs,
    get_missing_critical_metrics,
    get_dqs_recommendation
)


class GEEQueryEngine:
    """
    Main query engine for planetary health satellite data.

    Usage:
        engine = GEEQueryEngine()
        result = engine.query(lat=28.6139, lon=77.2090, mode="comprehensive")
    """

    def __init__(self, project_id: str = None, auto_init: bool = True):
        """
        Initialize the query engine.

        Args:
            project_id: Google Cloud Project ID for Earth Engine.
                       If None, uses default from config.
            auto_init: If True, automatically initializes Earth Engine.
        """
        self.project_id = project_id or get_project_id()
        self._initialized = False

        # Initialize pillar handlers
        self._pillars = {
            "A": AtmosphericPillar(),
            "B": BiodiversityPillar(),
            "C": CarbonPillar(),
            "D": DegradationPillar(),
            "E": EcosystemPillar()
        }

        if auto_init:
            self.initialize()

    def initialize(self) -> bool:
        """
        Initialize Earth Engine connection.

        Returns:
            bool: True if initialization successful
        """
        if not self._initialized:
            self._initialized = initialize_ee(self.project_id)
        return self._initialized

    def query(
        self,
        lat: float,
        lon: float,
        mode: str = "comprehensive",
        include_scores: bool = True,
        include_raw: bool = True,
        temporal: str = "latest",
        date_range: Optional[Tuple[str, str]] = None,
        buffer_radius: int = 500,
        pillars: Optional[List[str]] = None,
        parallel: bool = True
    ) -> Dict[str, Any]:
        """
        Query all planetary health pillars for a location.

        Args:
            lat: Latitude (-90 to 90)
            lon: Longitude (-180 to 180)
            mode: "simple" (10 metrics) or "comprehensive" (24 metrics)
            include_scores: Include calculated pillar scores (0-100)
            include_raw: Include raw satellite values
            temporal: "latest", "monthly", or "annual"
            date_range: Optional (start_date, end_date) in YYYY-MM-DD format
            buffer_radius: Radius in meters for spatial averaging
            pillars: List of pillars to query (e.g., ["A", "B"]). None = all.
            parallel: If True, query pillars in parallel

        Returns:
            Dict containing all pillar results and summary
        """
        if not self._initialized:
            self.initialize()

        # Validate inputs
        self._validate_inputs(lat, lon, mode, temporal)

        # Set date range based on temporal mode
        if date_range is None:
            date_range = self._get_date_range(temporal)

        # Determine which pillars to query
        pillar_ids = pillars or list(self._pillars.keys())

        # Build query result
        result = {
            "query": {
                "latitude": lat,
                "longitude": lon,
                "timestamp": datetime.now().isoformat(),
                "mode": mode,
                "temporal": temporal,
                "buffer_radius_m": buffer_radius,
                "date_range": {
                    "start": date_range[0],
                    "end": date_range[1]
                }
            },
            "pillars": {}
        }

        # Query each pillar
        if parallel:
            result["pillars"] = self._query_parallel(
                lat, lon, mode, buffer_radius, date_range, pillar_ids
            )
        else:
            result["pillars"] = self._query_sequential(
                lat, lon, mode, buffer_radius, date_range, pillar_ids
            )

        # Add scores if requested
        if include_scores:
            result = self._add_scores(result)

        # Remove raw values if not requested
        if not include_raw:
            result = self._remove_raw_values(result)

        # Add summary
        result["summary"] = self._create_summary(result)

        # Add time series info
        result["time_series"] = {
            "enabled": temporal != "latest",
            "mode": temporal
        }

        return result

    def query_polygon(
        self,
        points: List[Dict[str, float]],
        mode: str = "comprehensive",
        include_scores: bool = True,
        include_raw: bool = True,
        temporal: str = "latest",
        date_range: Optional[Tuple[str, str]] = None,
        pillars: Optional[List[str]] = None,
        parallel: bool = True
    ) -> Dict[str, Any]:
        """
        Query all planetary health pillars for a polygon area defined by 4 points.

        Args:
            points: List of 4 dicts with 'lat' and 'lng' keys defining polygon corners
                    Expected order: [NW, NE, SE, SW]
            mode: "simple" (10 metrics) or "comprehensive" (24 metrics)
            include_scores: Include calculated pillar scores (0-100)
            include_raw: Include raw satellite values
            temporal: "latest", "monthly", or "annual"
            date_range: Optional (start_date, end_date) in YYYY-MM-DD format
            pillars: List of pillars to query (e.g., ["A", "B"]). None = all.
            parallel: If True, query pillars in parallel

        Returns:
            Dict containing all pillar results, summary, area info, carbon credits, and ESV
        """
        if not self._initialized:
            self.initialize()

        # Validate we have exactly 4 points
        if len(points) != 4:
            raise ValueError(f"Expected 4 points for polygon, got {len(points)}")

        # Validate all point coordinates
        for i, pt in enumerate(points):
            lat = pt.get('lat')
            lng = pt.get('lng')
            if lat is None or lng is None:
                raise ValueError(f"Point {i} missing lat or lng")
            if not -90 <= lat <= 90:
                raise ValueError(f"Point {i}: Latitude must be between -90 and 90, got {lat}")
            if not -180 <= lng <= 180:
                raise ValueError(f"Point {i}: Longitude must be between -180 and 180, got {lng}")

        # Validate mode and temporal
        if mode not in ["simple", "comprehensive"]:
            raise ValueError(f"Mode must be 'simple' or 'comprehensive', got {mode}")
        if temporal not in ["latest", "monthly", "annual"]:
            raise ValueError(f"Temporal must be 'latest', 'monthly', or 'annual', got {temporal}")

        # Set date range based on temporal mode
        if date_range is None:
            date_range = self._get_date_range(temporal)

        # Determine which pillars to query
        pillar_ids = pillars or list(self._pillars.keys())

        # Calculate centroid for reference
        lats = [pt['lat'] for pt in points]
        lngs = [pt['lng'] for pt in points]
        centroid_lat = sum(lats) / 4
        centroid_lng = sum(lngs) / 4

        # Build query result
        result = {
            "query": {
                "type": "polygon",
                "points": points,
                "centroid": {
                    "latitude": centroid_lat,
                    "longitude": centroid_lng
                },
                "timestamp": datetime.now().isoformat(),
                "mode": mode,
                "temporal": temporal,
                "date_range": {
                    "start": date_range[0],
                    "end": date_range[1]
                }
            },
            "pillars": {}
        }

        # Query each pillar using polygon method
        if parallel:
            result["pillars"] = self._query_polygon_parallel(
                points, mode, date_range, pillar_ids
            )
        else:
            result["pillars"] = self._query_polygon_sequential(
                points, mode, date_range, pillar_ids
            )

        # Add scores if requested
        if include_scores:
            result = self._add_scores(result)

        # Remove raw values if not requested
        if not include_raw:
            result = self._remove_raw_values(result)

        # Add summary with polygon-specific data
        result["summary"] = self._create_polygon_summary(result, points)

        # Add time series info
        result["time_series"] = {
            "enabled": temporal != "latest",
            "mode": temporal
        }

        return result

    def _query_polygon_parallel(
        self,
        points: List[Dict[str, float]],
        mode: str,
        date_range: Tuple[str, str],
        pillar_ids: List[str]
    ) -> Dict[str, Any]:
        """Query pillars for polygon in parallel."""
        results = {}

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {
                executor.submit(
                    self._pillars[pid].query_polygon,
                    points, mode, date_range
                ): pid
                for pid in pillar_ids
            }

            for future in as_completed(futures):
                pillar_id = futures[future]
                try:
                    pillar_result = future.result()
                    pillar_key = f"{pillar_id}_{PILLAR_CONFIG[pillar_id]['name'].lower()}"
                    results[pillar_key] = pillar_result
                except Exception as e:
                    pillar_key = f"{pillar_id}_{PILLAR_CONFIG[pillar_id]['name'].lower()}"
                    results[pillar_key] = {
                        "error": str(e),
                        "metrics": {}
                    }

        return results

    def _query_polygon_sequential(
        self,
        points: List[Dict[str, float]],
        mode: str,
        date_range: Tuple[str, str],
        pillar_ids: List[str]
    ) -> Dict[str, Any]:
        """Query pillars for polygon sequentially."""
        results = {}

        for pillar_id in pillar_ids:
            try:
                pillar_result = self._pillars[pillar_id].query_polygon(
                    points=points,
                    mode=mode,
                    date_range=date_range
                )
                pillar_key = f"{pillar_id}_{PILLAR_CONFIG[pillar_id]['name'].lower()}"
                results[pillar_key] = pillar_result
            except Exception as e:
                pillar_key = f"{pillar_id}_{PILLAR_CONFIG[pillar_id]['name'].lower()}"
                results[pillar_key] = {
                    "error": str(e),
                    "metrics": {}
                }

        return results

    def _create_polygon_summary(self, result: Dict, points: List[Dict[str, float]]) -> Dict:
        """
        Create summary statistics for polygon query with carbon credits and ESV.
        """
        # Get base summary from existing method
        base_summary = self._create_summary(result)

        # Extract geometry info from first pillar that has it
        area_ha = None
        area_m2 = None
        geometry_info = None

        for pillar_data in result["pillars"].values():
            if "geometry" in pillar_data:
                geometry_info = pillar_data["geometry"]
                area_ha = geometry_info.get("area_ha")
                area_m2 = geometry_info.get("area_m2")
                break

        # If no geometry found, calculate approximate area using Haversine formula
        if area_ha is None:
            area_ha = self._calculate_polygon_area_approx(points)
            area_m2 = area_ha * 10000

        # Extract biomass and carbon data from Carbon pillar
        biomass = None
        tree_cover = None
        carbon_stock = None

        for pillar_key, pillar_data in result["pillars"].items():
            if pillar_key.startswith("C_"):
                metrics = pillar_data.get("metrics", {})
                if "biomass" in metrics:
                    biomass_data = metrics["biomass"]
                    biomass = biomass_data.get("value") if isinstance(biomass_data, dict) else biomass_data
                if "tree_cover" in metrics:
                    tc_data = metrics["tree_cover"]
                    tree_cover = tc_data.get("value") if isinstance(tc_data, dict) else tc_data
                if "carbon_stock" in metrics:
                    cs_data = metrics["carbon_stock"]
                    carbon_stock = cs_data.get("value") if isinstance(cs_data, dict) else cs_data

        # Calculate carbon credits
        carbon_credits = self._calculate_carbon_credits(
            biomass=biomass,
            carbon_stock=carbon_stock,
            tree_cover=tree_cover,
            area_ha=area_ha,
            dqs=base_summary.get("data_quality_score", 70)
        )

        # Calculate ESV (Ecosystem Service Value)
        esv = self._calculate_esv(
            phi_score=base_summary.get("overall_score"),
            ecosystem_type=base_summary.get("ecosystem_type", "default"),
            area_ha=area_ha
        )

        # Add polygon-specific data to summary
        base_summary["geometry"] = {
            "type": "Polygon",
            "points": points,
            "area_m2": area_m2,
            "area_ha": area_ha,
            "area_acres": area_ha * 2.47105 if area_ha else None
        }
        base_summary["carbon_credits"] = carbon_credits
        base_summary["ecosystem_service_value"] = esv

        return base_summary

    def _calculate_polygon_area_approx(self, points: List[Dict[str, float]]) -> float:
        """
        Calculate approximate area of polygon in hectares using Shoelace formula.
        Approximation using lat/lng as planar coordinates (works for small areas).
        """
        import math

        # Convert to list of (lat, lng) tuples
        coords = [(pt['lat'], pt['lng']) for pt in points]

        # Shoelace formula for polygon area
        n = len(coords)
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += coords[i][1] * coords[j][0]
            area -= coords[j][1] * coords[i][0]
        area = abs(area) / 2.0

        # Convert from degrees^2 to hectares (approximate)
        # 1 degree ≈ 111.32 km at equator
        avg_lat = sum(c[0] for c in coords) / n
        lat_km = 111.32  # km per degree latitude
        lng_km = 111.32 * math.cos(math.radians(avg_lat))  # km per degree longitude

        area_km2 = area * lat_km * lng_km
        area_ha = area_km2 * 100  # 1 km² = 100 ha

        return area_ha

    def _calculate_carbon_credits(
        self,
        biomass: Optional[float],
        carbon_stock: Optional[float],
        tree_cover: Optional[float],
        area_ha: float,
        dqs: float
    ) -> Dict[str, Any]:
        """
        Calculate carbon credits based on biomass, carbon stock, and area.

        Returns:
            Dict with carbon credit calculations
        """
        if area_ha is None or area_ha <= 0:
            return {"error": "Area not available for carbon calculation"}

        # Use carbon_stock if available, otherwise estimate from biomass
        if carbon_stock is not None:
            carbon_mg_c_ha = carbon_stock
        elif biomass is not None:
            # Carbon is approximately 50% of above-ground biomass
            carbon_mg_c_ha = biomass * 0.5
        elif tree_cover is not None and tree_cover > 0:
            # Rough estimate: assume 2 Mg C/ha per 1% tree cover (very rough)
            carbon_mg_c_ha = tree_cover * 2
        else:
            return {
                "available": False,
                "reason": "Insufficient data for carbon calculation"
            }

        # Total carbon in the polygon (Mg C)
        total_carbon_mg = carbon_mg_c_ha * area_ha

        # Convert to CO2 equivalent (1 C = 3.67 CO2)
        co2_equivalent_tonnes = total_carbon_mg * 3.67

        # Apply data quality factor
        confidence_factor = min(dqs / 100, 1.0) if dqs else 0.7
        verified_co2_tonnes = co2_equivalent_tonnes * confidence_factor

        # Market value estimates (using range of carbon prices)
        price_low = 15  # $/tonne CO2
        price_mid = 25  # $/tonne CO2
        price_high = 50  # $/tonne CO2

        return {
            "available": True,
            "carbon_stock_mg_c_ha": round(carbon_mg_c_ha, 2),
            "total_carbon_mg": round(total_carbon_mg, 2),
            "co2_equivalent_tonnes": round(co2_equivalent_tonnes, 2),
            "verified_co2_tonnes": round(verified_co2_tonnes, 2),
            "confidence_factor": round(confidence_factor, 2),
            "estimated_value": {
                "low_usd": round(verified_co2_tonnes * price_low, 2),
                "mid_usd": round(verified_co2_tonnes * price_mid, 2),
                "high_usd": round(verified_co2_tonnes * price_high, 2),
                "price_range": f"${price_low}-${price_high}/tonne CO2"
            },
            "methodology": "IPCC Tier 1 (biomass × 0.5 × 3.67)"
        }

    def _calculate_esv(
        self,
        phi_score: Optional[float],
        ecosystem_type: str,
        area_ha: float
    ) -> Dict[str, Any]:
        """
        Calculate Ecosystem Service Value (ESV) based on PHI score and area.

        Returns:
            Dict with ESV calculations
        """
        if area_ha is None or area_ha <= 0:
            return {"error": "Area not available for ESV calculation"}

        # Base ESV values by ecosystem type ($/ha/year)
        # Based on Costanza et al. and de Groot et al. estimates
        BASE_ESV = {
            "tropical_forest": 5382,
            "mangrove": 9990,
            "wetland": 25682,
            "grassland_savanna": 2871,
            "agricultural": 1532,
            "urban_green": 3212,
            "default": 3000
        }

        base_esv_per_ha = BASE_ESV.get(ecosystem_type, BASE_ESV["default"])

        # Calculate PHI multiplier
        if phi_score is not None:
            esv_multiplier = calculate_phi_esv_multiplier(phi_score)
        else:
            esv_multiplier = 0

        # Adjusted ESV
        adjusted_esv_per_ha = base_esv_per_ha * (1 + esv_multiplier)
        total_annual_esv = adjusted_esv_per_ha * area_ha

        # Calculate 10-year and 30-year projections (with 2% annual appreciation)
        esv_10yr = sum(total_annual_esv * (1.02 ** i) for i in range(10))
        esv_30yr = sum(total_annual_esv * (1.02 ** i) for i in range(30))

        return {
            "available": True,
            "ecosystem_type": ecosystem_type,
            "base_esv_per_ha_usd": round(base_esv_per_ha, 2),
            "phi_multiplier": round(esv_multiplier, 4),
            "adjusted_esv_per_ha_usd": round(adjusted_esv_per_ha, 2),
            "total_annual_esv_usd": round(total_annual_esv, 2),
            "projections": {
                "10_year_usd": round(esv_10yr, 2),
                "30_year_usd": round(esv_30yr, 2)
            },
            "area_ha": round(area_ha, 2),
            "methodology": "Costanza et al. (2014) + PHI adjustment"
        }

    def query_single_pillar(
        self,
        lat: float,
        lon: float,
        pillar: str,
        mode: str = "comprehensive",
        buffer_radius: int = 500,
        date_range: Optional[Tuple[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Query a single pillar for a location.

        Args:
            lat: Latitude
            lon: Longitude
            pillar: Pillar ID ("A", "B", "C", "D", or "E")
            mode: "simple" or "comprehensive"
            buffer_radius: Buffer radius in meters
            date_range: Optional date range

        Returns:
            Dict with pillar results
        """
        if pillar not in self._pillars:
            raise ValueError(f"Invalid pillar: {pillar}. Must be one of A, B, C, D, E")

        if date_range is None:
            date_range = self._get_date_range("latest")

        return self._pillars[pillar].query(
            lat=lat,
            lon=lon,
            mode=mode,
            buffer_radius=buffer_radius,
            date_range=date_range
        )

    def get_available_metrics(self, mode: str = "comprehensive") -> Dict[str, List[str]]:
        """
        Get list of available metrics by pillar.

        Args:
            mode: "simple" or "comprehensive"

        Returns:
            Dict mapping pillar IDs to metric lists
        """
        result = {}
        for pillar_id, pillar in self._pillars.items():
            if mode == "simple":
                result[pillar_id] = pillar.get_simple_metrics()
            else:
                result[pillar_id] = pillar.get_comprehensive_metrics()
        return result

    def _validate_inputs(self, lat: float, lon: float, mode: str, temporal: str):
        """Validate query inputs."""
        if not -90 <= lat <= 90:
            raise ValueError(f"Latitude must be between -90 and 90, got {lat}")
        if not -180 <= lon <= 180:
            raise ValueError(f"Longitude must be between -180 and 180, got {lon}")
        if mode not in ["simple", "comprehensive"]:
            raise ValueError(f"Mode must be 'simple' or 'comprehensive', got {mode}")
        if temporal not in ["latest", "monthly", "annual"]:
            raise ValueError(f"Temporal must be 'latest', 'monthly', or 'annual', got {temporal}")

    def _get_date_range(self, temporal: str) -> Tuple[str, str]:
        """Get date range based on temporal mode."""
        end_date = datetime.now()

        if temporal == "latest":
            start_date = end_date - timedelta(days=30)
        elif temporal == "monthly":
            start_date = end_date - timedelta(days=365)
        else:  # annual
            start_date = end_date - timedelta(days=365 * 5)

        return (
            start_date.strftime("%Y-%m-%d"),
            end_date.strftime("%Y-%m-%d")
        )

    def _query_parallel(
        self,
        lat: float,
        lon: float,
        mode: str,
        buffer_radius: int,
        date_range: Tuple[str, str],
        pillar_ids: List[str]
    ) -> Dict[str, Any]:
        """Query pillars in parallel."""
        results = {}

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {
                executor.submit(
                    self._pillars[pid].query,
                    lat, lon, mode, buffer_radius, date_range
                ): pid
                for pid in pillar_ids
            }

            for future in as_completed(futures):
                pillar_id = futures[future]
                try:
                    pillar_result = future.result()
                    pillar_key = f"{pillar_id}_{PILLAR_CONFIG[pillar_id]['name'].lower()}"
                    results[pillar_key] = pillar_result
                except Exception as e:
                    pillar_key = f"{pillar_id}_{PILLAR_CONFIG[pillar_id]['name'].lower()}"
                    results[pillar_key] = {
                        "error": str(e),
                        "metrics": {}
                    }

        return results

    def _query_sequential(
        self,
        lat: float,
        lon: float,
        mode: str,
        buffer_radius: int,
        date_range: Tuple[str, str],
        pillar_ids: List[str]
    ) -> Dict[str, Any]:
        """Query pillars sequentially."""
        results = {}

        for pillar_id in pillar_ids:
            try:
                pillar_result = self._pillars[pillar_id].query(
                    lat=lat,
                    lon=lon,
                    mode=mode,
                    buffer_radius=buffer_radius,
                    date_range=date_range
                )
                pillar_key = f"{pillar_id}_{PILLAR_CONFIG[pillar_id]['name'].lower()}"
                results[pillar_key] = pillar_result
            except Exception as e:
                pillar_key = f"{pillar_id}_{PILLAR_CONFIG[pillar_id]['name'].lower()}"
                results[pillar_key] = {
                    "error": str(e),
                    "metrics": {}
                }

        return results

    def _add_scores(self, result: Dict) -> Dict:
        """Add pillar scores to result."""
        for pillar_key, pillar_data in result["pillars"].items():
            if "metrics" in pillar_data:
                pillar_id = pillar_key[0]  # First character is pillar ID
                pillar_data["score"] = calculate_pillar_score(
                    pillar_id,
                    pillar_data["metrics"]
                )
        return result

    def _remove_raw_values(self, result: Dict) -> Dict:
        """Remove raw metric values, keeping only scores."""
        for pillar_data in result["pillars"].values():
            if "metrics" in pillar_data:
                # Keep only score and metadata
                pillar_data["metrics"] = {
                    k: {"quality": v.get("quality")}
                    for k, v in pillar_data["metrics"].items()
                }
        return result

    def detect_ecosystem_type(
        self,
        land_cover_value: Optional[int],
        tree_cover: Optional[float] = None,
        human_modification: Optional[float] = None
    ) -> str:
        """
        Detect ecosystem type from land cover and other metrics.

        Uses WorldCover land cover classification as primary indicator,
        with tree_cover and human_modification as refinement factors.

        Ecosystem Types:
        - tropical_forest: High tree cover, natural areas
        - mangrove: Coastal wetland forests
        - grassland_savanna: Low tree cover, natural grasslands
        - wetland: Water bodies and wetland areas
        - agricultural: Cropland and managed landscapes
        - urban_green: Built-up areas with green spaces
        - default: Mixed or unknown ecosystems

        Args:
            land_cover_value: WorldCover class value (10-100)
            tree_cover: Optional tree cover percentage (0-100)
            human_modification: Optional human modification index (0-1)

        Returns:
            Ecosystem type string for weight selection
        """
        # Primary detection from land cover
        if land_cover_value is not None:
            ecosystem = LANDCOVER_TO_ECOSYSTEM.get(land_cover_value, "default")

            # Refine based on additional metrics
            if ecosystem == "tropical_forest" and tree_cover is not None:
                if tree_cover < 25:
                    ecosystem = "grassland_savanna"

            if human_modification is not None and human_modification > 0.6:
                if ecosystem not in ["urban_green", "agricultural"]:
                    ecosystem = "urban_green"

            return ecosystem

        # Fallback heuristics when land cover unavailable
        if tree_cover is not None:
            if tree_cover > 50:
                return "tropical_forest"
            elif tree_cover > 10:
                return "grassland_savanna"

        if human_modification is not None:
            if human_modification > 0.5:
                return "urban_green"
            elif human_modification > 0.3:
                return "agricultural"

        return "default"

    def _create_summary(self, result: Dict) -> Dict:
        """
        Create summary statistics using PHI Technical Framework methodology.

        Includes:
        - Ecosystem-adaptive weighted overall score
        - Data Quality Score (DQS) with criticality weighting
        - PHI-to-ESV multiplier
        - Missing critical metrics identification
        """
        # Extract metrics for ecosystem detection
        land_cover = None
        tree_cover = None
        human_modification = None

        for pillar_key, pillar_data in result["pillars"].items():
            metrics = pillar_data.get("metrics", {})

            # Get land_cover value
            if "land_cover" in metrics:
                lc_data = metrics["land_cover"]
                if isinstance(lc_data, dict):
                    land_cover = lc_data.get("value")
                else:
                    land_cover = lc_data

            # Get tree_cover value
            if "tree_cover" in metrics:
                tc_data = metrics["tree_cover"]
                if isinstance(tc_data, dict):
                    tree_cover = tc_data.get("value")
                else:
                    tree_cover = tc_data

            # Get human_modification value
            if "human_modification" in metrics:
                hm_data = metrics["human_modification"]
                if isinstance(hm_data, dict):
                    human_modification = hm_data.get("value")
                else:
                    human_modification = hm_data

        # Detect ecosystem type for adaptive weighting
        ecosystem_type = self.detect_ecosystem_type(
            land_cover, tree_cover, human_modification
        )

        # Calculate pillar scores
        pillar_scores = {}
        for pillar_key, pillar_data in result["pillars"].items():
            if "score" in pillar_data:
                pillar_id = pillar_key[0]
                pillar_scores[pillar_id] = pillar_data["score"]

        # Calculate overall score with ecosystem-adaptive weights
        overall_score = calculate_overall_score(pillar_scores, ecosystem_type)

        # Calculate ESV multiplier
        esv_multiplier = calculate_phi_esv_multiplier(overall_score) if overall_score else None

        # Calculate DQS (Data Quality Score)
        metrics_availability = {}
        quality_flags_dict = {}
        quality_issues = []

        for pillar_data in result["pillars"].values():
            for metric_name, metric_data in pillar_data.get("metrics", {}).items():
                if isinstance(metric_data, dict):
                    is_available = metric_data.get("value") is not None
                    quality = metric_data.get("quality", "unavailable")
                else:
                    is_available = metric_data is not None
                    quality = "good" if is_available else "unavailable"

                metrics_availability[metric_name] = is_available
                quality_flags_dict[metric_name] = quality

                # Track quality issues
                if quality == "poor":
                    quality_issues.append(f"{metric_name}_poor")
                elif quality == "unavailable":
                    quality_issues.append(f"{metric_name}_unavailable")

        dqs = calculate_dqs(metrics_availability, quality_flags_dict)

        # Calculate simple data completeness for backwards compatibility
        completeness = assess_data_completeness(result["pillars"])

        # Get missing critical metrics
        missing_critical = get_missing_critical_metrics(result["pillars"])

        # Get ecosystem weights used
        ecosystem_config = ECOSYSTEM_CATEGORY_WEIGHTS.get(
            ecosystem_type,
            ECOSYSTEM_CATEGORY_WEIGHTS["default"]
        )
        weights_used = {k: v for k, v in ecosystem_config.items() if k in ["A", "B", "C", "D", "E"]}

        return {
            # Core scores
            "overall_score": overall_score,
            "overall_interpretation": get_score_interpretation(round(overall_score) if overall_score else None),
            "pillar_scores": pillar_scores,

            # Ecosystem-adaptive weighting
            "ecosystem_type": ecosystem_type,
            "ecosystem_weights": weights_used,

            # Data quality
            "data_quality_score": dqs,
            "data_completeness": completeness,
            "dqs_recommendation": get_dqs_recommendation(dqs),
            "missing_critical_metrics": missing_critical,
            "quality_flags": quality_issues[:10],  # Top 10 issues

            # Economic valuation
            "esv_multiplier": esv_multiplier,

            # Methodology
            "methodology": "PHI Technical Framework v1.0"
        }


def query_location(
    lat: float,
    lon: float,
    mode: str = "simple",
    project_id: str = None
) -> Dict[str, Any]:
    """
    Convenience function to query a location.

    Args:
        lat: Latitude
        lon: Longitude
        mode: "simple" or "comprehensive"
        project_id: Optional Google Cloud Project ID

    Returns:
        Query result dict
    """
    engine = GEEQueryEngine(project_id=project_id)
    return engine.query(lat=lat, lon=lon, mode=mode)
