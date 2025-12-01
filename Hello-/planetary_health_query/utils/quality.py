"""
Data Quality Assessment Module.
Handles quality flags, QA band interpretation, and data validation.
"""

from typing import Dict, Any, Optional
from ..core.config import METRIC_METADATA


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
