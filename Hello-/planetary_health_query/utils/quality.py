"""
Data Quality Assessment Module.
Handles quality flags, QA band interpretation, and data validation.

Includes PHI Technical Framework DQS (Data Quality Score) calculation
with criticality-weighted availability assessment.
"""

from typing import Dict, Any, Optional, List
from ..core.config import METRIC_METADATA, PHI_METRIC_PARAMS, CRITICALITY_WEIGHTS, DQS_THRESHOLDS


def assess_data_quality(metric: str, value: Any) -> str:
    """
    Assess the quality of a metric value.

    Args:
        metric: Metric name
        value: Metric value

    Returns:
        Quality flag: "good", "moderate", "poor", or "unavailable"
    """
    if value is None:
        return "unavailable"

    metadata = METRIC_METADATA.get(metric, {})
    value_range = metadata.get("range")

    if value_range:
        min_val, max_val = value_range
        if value < min_val or value > max_val:
            return "poor"

    optimal_range = metadata.get("optimal_range")
    if optimal_range:
        opt_min, opt_max = optimal_range
        if opt_min <= value <= opt_max:
            return "good"
        else:
            return "moderate"

    return "good"


def assess_data_completeness(pillars: Dict[str, Any]) -> float:
    """
    Calculate data completeness across all pillars.

    Args:
        pillars: Dict of pillar results

    Returns:
        Completeness ratio (0.0 to 1.0)
    """
    total_metrics = 0
    available_metrics = 0

    for pillar_data in pillars.values():
        metrics = pillar_data.get("metrics", {})
        for metric_data in metrics.values():
            total_metrics += 1
            if metric_data.get("quality") != "unavailable":
                if metric_data.get("value") is not None:
                    available_metrics += 1

    if total_metrics == 0:
        return 0.0

    return available_metrics / total_metrics


def interpret_qa_band(qa_value: int, sensor: str = "modis") -> Dict[str, Any]:
    """
    Interpret a QA band value.

    Args:
        qa_value: Raw QA band value
        sensor: Sensor type ("modis", "landsat", "sentinel2")

    Returns:
        Dict with quality interpretation
    """
    if sensor == "modis":
        return _interpret_modis_qa(qa_value)
    elif sensor == "landsat":
        return _interpret_landsat_qa(qa_value)
    elif sensor == "sentinel2":
        return _interpret_sentinel2_qa(qa_value)
    else:
        return {"valid": True, "quality": "unknown"}


def _interpret_modis_qa(qa_value: int) -> Dict[str, Any]:
    """Interpret MODIS QA band."""
    # MODIS QA interpretation (simplified)
    # Bits 0-1: Cloud state
    cloud_state = qa_value & 0b11

    return {
        "valid": cloud_state != 0b01,  # Not cloudy
        "cloud_state": ["clear", "cloudy", "mixed", "not_set"][cloud_state],
        "quality": "good" if cloud_state == 0 else "moderate"
    }


def _interpret_landsat_qa(qa_value: int) -> Dict[str, Any]:
    """Interpret Landsat QA_PIXEL band."""
    # Landsat Collection 2 QA_PIXEL
    fill = (qa_value >> 0) & 1
    cloud = (qa_value >> 3) & 1
    cloud_shadow = (qa_value >> 4) & 1

    is_valid = not fill and not cloud and not cloud_shadow

    return {
        "valid": is_valid,
        "fill": bool(fill),
        "cloud": bool(cloud),
        "cloud_shadow": bool(cloud_shadow),
        "quality": "good" if is_valid else "poor"
    }


def _interpret_sentinel2_qa(qa_value: int) -> Dict[str, Any]:
    """Interpret Sentinel-2 SCL band."""
    # Scene Classification Layer values
    scl_classes = {
        0: ("no_data", False),
        1: ("saturated", False),
        2: ("dark_area", True),
        3: ("cloud_shadow", False),
        4: ("vegetation", True),
        5: ("not_vegetated", True),
        6: ("water", True),
        7: ("unclassified", True),
        8: ("cloud_medium", False),
        9: ("cloud_high", False),
        10: ("thin_cirrus", False),
        11: ("snow", True)
    }

    class_name, is_valid = scl_classes.get(qa_value, ("unknown", True))

    return {
        "valid": is_valid,
        "class": class_name,
        "quality": "good" if is_valid else "poor"
    }


def validate_coordinate(lat: float, lon: float) -> Dict[str, Any]:
    """
    Validate geographic coordinates.

    Args:
        lat: Latitude
        lon: Longitude

    Returns:
        Dict with validation results
    """
    errors = []

    if not isinstance(lat, (int, float)):
        errors.append("Latitude must be a number")
    elif lat < -90 or lat > 90:
        errors.append("Latitude must be between -90 and 90")

    if not isinstance(lon, (int, float)):
        errors.append("Longitude must be a number")
    elif lon < -180 or lon > 180:
        errors.append("Longitude must be between -180 and 180")

    return {
        "valid": len(errors) == 0,
        "errors": errors
    }


# =============================================================================
# PHI TECHNICAL FRAMEWORK - DATA QUALITY SCORE (DQS)
# =============================================================================

def calculate_dqs(
    metrics_availability: Dict[str, bool],
    data_quality_flags: Dict[str, str]
) -> float:
    """
    Calculate Data Quality Score using criticality-weighted formula.

    Formula: DQS = [Sum(w_i * a_i) / Sum(w_i)] * 100

    Where:
        w_i = criticality weight for metric i
        a_i = availability score:
              - 1.0 if available with good quality
              - 0.5 if available with moderate quality
              - 0.25 if available with poor quality
              - 0.0 if unavailable

    Criticality Weights:
        - Critical (1.0): NDVI, Tree Cover, Soil Moisture, Human Modification
        - Important (0.7): EVI, AOD, Drought Index, Biomass, Canopy Height
        - Supporting (0.4): LAI, FPAR, LST, Population, Night Lights
        - Auxiliary (0.2): UV Index, Visibility, Distance to Water

    Args:
        metrics_availability: Dict mapping metric names to availability (True/False)
        data_quality_flags: Dict mapping metric names to quality flags

    Returns:
        DQS score (0-100)
    """
    weighted_sum = 0.0
    total_weight = 0.0

    for metric_name, params in PHI_METRIC_PARAMS.items():
        # Get criticality weight
        criticality = params.get("criticality", "supporting")
        weight = CRITICALITY_WEIGHTS.get(criticality, 0.4)

        # Skip zero-weight informational metrics
        if params.get("weight", 0) == 0:
            continue

        # Determine availability score
        is_available = metrics_availability.get(metric_name, False)
        quality = data_quality_flags.get(metric_name, "unavailable")

        if not is_available or quality == "unavailable":
            availability_score = 0.0
        elif quality == "poor":
            availability_score = 0.25
        elif quality == "moderate":
            availability_score = 0.5
        else:  # "good" or "supplemented"
            availability_score = 1.0

        weighted_sum += weight * availability_score
        total_weight += weight

    if total_weight == 0:
        return 0.0

    return round((weighted_sum / total_weight) * 100, 2)


def calculate_dqs_from_pillars(pillars: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate DQS from pillar results.

    Extracts availability and quality information from pillar data
    and calculates the criticality-weighted DQS.

    Args:
        pillars: Dict of pillar results with metrics

    Returns:
        Dict containing DQS score and detailed breakdown
    """
    metrics_availability = {}
    quality_flags = {}
    metric_details = []

    for pillar_data in pillars.values():
        metrics = pillar_data.get("metrics", {})
        for metric_name, metric_data in metrics.items():
            if isinstance(metric_data, dict):
                is_available = metric_data.get("value") is not None
                quality = metric_data.get("quality", "unavailable")
            else:
                is_available = metric_data is not None
                quality = "good" if is_available else "unavailable"

            metrics_availability[metric_name] = is_available
            quality_flags[metric_name] = quality

            # Get criticality for reporting
            params = PHI_METRIC_PARAMS.get(metric_name, {})
            criticality = params.get("criticality", "supporting")

            metric_details.append({
                "metric": metric_name,
                "available": is_available,
                "quality": quality,
                "criticality": criticality,
                "weight": CRITICALITY_WEIGHTS.get(criticality, 0.4)
            })

    dqs = calculate_dqs(metrics_availability, quality_flags)

    # Determine confidence level
    if dqs >= DQS_THRESHOLDS.get("high_confidence", 85):
        confidence_level = "high"
    elif dqs >= DQS_THRESHOLDS.get("investment_grade", 70):
        confidence_level = "investment_grade"
    elif dqs >= DQS_THRESHOLDS.get("overall_minimum", 50):
        confidence_level = "acceptable"
    else:
        confidence_level = "low"

    return {
        "dqs_score": dqs,
        "confidence_level": confidence_level,
        "metric_count": len(metric_details),
        "available_count": sum(1 for m in metric_details if m["available"]),
        "metrics": metric_details
    }


def assess_metric_quality_detailed(
    metric_name: str,
    value: Any,
    metadata: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Perform detailed quality assessment for a metric.

    Uses PHI parameters for range validation and quality determination.

    Args:
        metric_name: Name of the metric
        value: Metric value
        metadata: Optional metadata from query (source, resolution, etc.)

    Returns:
        Dict with quality assessment details
    """
    if value is None:
        return {
            "quality": "unavailable",
            "reason": "No data available",
            "confidence": 0.0,
            "criticality": PHI_METRIC_PARAMS.get(metric_name, {}).get("criticality", "supporting")
        }

    params = PHI_METRIC_PARAMS.get(metric_name, {})
    v_min = params.get("v_min", float("-inf"))
    v_max = params.get("v_max", float("inf"))

    # Check if value is within expected range
    if v_min != float("-inf") and v_max != float("inf"):
        if value < v_min or value > v_max:
            return {
                "quality": "poor",
                "reason": f"Value {value} outside expected range [{v_min}, {v_max}]",
                "confidence": 0.3,
                "criticality": params.get("criticality", "supporting")
            }

        # Check for edge cases (near boundaries might be less reliable)
        range_width = v_max - v_min
        if range_width > 0:
            distance_from_edge = min(abs(value - v_min), abs(value - v_max))
            edge_ratio = distance_from_edge / range_width

            if edge_ratio < 0.05:
                return {
                    "quality": "moderate",
                    "reason": "Value near expected range boundary",
                    "confidence": 0.6,
                    "criticality": params.get("criticality", "supporting")
                }

    return {
        "quality": "good",
        "reason": "Value within expected range",
        "confidence": 0.9,
        "criticality": params.get("criticality", "supporting")
    }


def get_missing_critical_metrics(pillars: Dict[str, Any]) -> List[str]:
    """
    Identify missing critical metrics that significantly impact DQS.

    Args:
        pillars: Dict of pillar results

    Returns:
        List of missing critical metric names
    """
    missing_critical = []

    # Get all available metrics
    available_metrics = set()
    for pillar_data in pillars.values():
        metrics = pillar_data.get("metrics", {})
        for metric_name, metric_data in metrics.items():
            if isinstance(metric_data, dict):
                if metric_data.get("value") is not None:
                    available_metrics.add(metric_name)
            elif metric_data is not None:
                available_metrics.add(metric_name)

    # Check for missing critical metrics
    for metric_name, params in PHI_METRIC_PARAMS.items():
        if params.get("criticality") == "critical":
            if metric_name not in available_metrics:
                missing_critical.append(metric_name)

    return missing_critical


def get_dqs_recommendation(dqs_score: float) -> str:
    """
    Get recommendation based on DQS score.

    Args:
        dqs_score: Data Quality Score (0-100)

    Returns:
        Recommendation string
    """
    if dqs_score >= 85:
        return "High confidence results. Data quality suitable for detailed analysis and reporting."
    elif dqs_score >= 70:
        return "Investment-grade data quality. Results suitable for most applications."
    elif dqs_score >= 50:
        return "Acceptable data quality. Consider supplementing with additional data sources."
    elif dqs_score >= 40:
        return "Marginal data quality. Results should be interpreted with caution."
    else:
        return "Low data quality. Consider expanding search area or time range for better coverage."
