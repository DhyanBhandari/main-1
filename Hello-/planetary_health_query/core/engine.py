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
