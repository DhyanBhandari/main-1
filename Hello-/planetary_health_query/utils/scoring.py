"""
PHI Scoring Module.
Calculates health scores using the PHI Technical Framework methodology.

This module implements:
- Metric normalization using 5 function types (linear, inverse, sigmoid, gaussian, centered)
- Weighted category/pillar score calculation
- Ecosystem-adaptive overall PHI score
- PHI-to-ESV multiplier calculation
"""

import math
from typing import Dict, Any, Optional, Tuple

from .normalization import (
    linear_normalize,
    inverse_linear_normalize,
    sigmoid_normalize,
    inverse_sigmoid_normalize,
    gaussian_normalize,
    centered_normalize
)
from ..core.config import (
    PHI_METRIC_PARAMS,
    ECOSYSTEM_CATEGORY_WEIGHTS,
    CRITICALITY_WEIGHTS,
    PHI_ESV_CONSTANTS,
    PILLAR_CONFIG
)


def normalize_metric(metric_name: str, value: float) -> Optional[float]:
    """
    Normalize a single metric value to 0-100 score using PHI methodology.

    Applies the appropriate normalization function based on metric configuration:
    - Linear: Higher values produce higher scores
    - Inverse Linear: Lower values produce higher scores
    - Sigmoid: S-curve with diminishing returns
    - Gaussian: Optimal value produces highest score
    - Centered: Zero produces highest score

    Args:
        metric_name: Name of the metric (e.g., "ndvi", "aod")
        value: Raw metric value

    Returns:
        Normalized score (0-100) or None if metric not configured
    """
    if value is None:
        return None

    params = PHI_METRIC_PARAMS.get(metric_name)
    if not params:
        return None

    norm_type = params.get("norm_type", "linear")
    v_min = params.get("v_min", 0)
    v_max = params.get("v_max", 100)

    if norm_type == "linear":
        return linear_normalize(value, v_min, v_max)

    elif norm_type == "inverse_linear":
        return inverse_linear_normalize(value, v_min, v_max)

    elif norm_type == "sigmoid":
        k = params.get("k", 0.5)
        v_mid = params.get("v_mid")
        return sigmoid_normalize(value, v_min, v_max, k, v_mid)

    elif norm_type == "inverse_sigmoid":
        k = params.get("k", 0.5)
        v_mid = params.get("v_mid")
        return inverse_sigmoid_normalize(value, v_min, v_max, k, v_mid)

    elif norm_type == "gaussian":
        v_opt = params.get("v_opt", (v_min + v_max) / 2)
        sigma = params.get("sigma", (v_max - v_min) / 4)
        return gaussian_normalize(value, v_opt, sigma, v_min, v_max)

    elif norm_type == "centered":
        return centered_normalize(value, v_max)

    else:
        # Default to linear
        return linear_normalize(value, v_min, v_max)


def calculate_category_score(
    category_id: str,
    metrics: Dict[str, Any]
) -> Tuple[Optional[float], Dict[str, float]]:
    """
    Calculate weighted score for a single category/pillar.

    Formula: C_j = Sum(w_i * S_i) / Sum(w_i)

    Where:
    - w_i is the weight of indicator i within the category
    - S_i is the normalized score of indicator i

    Args:
        category_id: Category identifier (A, B, C, D, or E)
        metrics: Dict of metric values from pillar query

    Returns:
        Tuple of (category_score, individual_metric_scores)
    """
    if not metrics:
        return None, {}

    weighted_sum = 0.0
    total_weight = 0.0
    metric_scores = {}

    for metric_name, metric_data in metrics.items():
        # Get raw value
        if isinstance(metric_data, dict):
            value = metric_data.get("value")
        else:
            value = metric_data

        if value is None:
            continue

        # Check if metric belongs to this category
        params = PHI_METRIC_PARAMS.get(metric_name)
        if not params:
            continue

        # Allow metrics that match the category or have no category specified
        metric_category = params.get("category")
        if metric_category and metric_category != category_id:
            continue

        # Normalize the value
        score = normalize_metric(metric_name, value)
        if score is None:
            continue

        metric_scores[metric_name] = round(score, 2)

        # Apply weight (skip zero-weight informational metrics)
        weight = params.get("weight", 0.25)
        if weight > 0:
            weighted_sum += score * weight
            total_weight += weight

    if total_weight == 0:
        return None, metric_scores

    category_score = weighted_sum / total_weight
    return round(category_score, 2), metric_scores


def calculate_pillar_score(pillar_id: str, metrics: Dict[str, Any]) -> Optional[int]:
    """
    Calculate a health score (0-100) for a pillar using PHI methodology.

    This function maintains backwards compatibility with the existing API
    while using the new PHI normalization methodology internally.

    Args:
        pillar_id: Pillar identifier (A, B, C, D, or E)
        metrics: Dict of metric values from pillar query

    Returns:
        Score 0-100, or None if insufficient data
    """
    score, _ = calculate_category_score(pillar_id, metrics)
    return round(score) if score is not None else None


def calculate_overall_score(
    pillar_scores: Dict[str, float],
    ecosystem_type: str = "default"
) -> Optional[float]:
    """
    Calculate overall PHI score using ecosystem-adaptive weights.

    Formula: PHI = W_A*A + W_B*B + W_C*C + W_D*D + W_E*E

    Where W_x are ecosystem-specific weights that sum to 1.0

    Args:
        pillar_scores: Dict mapping pillar IDs to scores (e.g., {"A": 75, "B": 82})
        ecosystem_type: Detected ecosystem type for adaptive weighting
                       Options: tropical_forest, mangrove, grassland_savanna,
                               wetland, agricultural, urban_green, default

    Returns:
        Weighted average score 0-100, or None if insufficient data
    """
    if not pillar_scores:
        return None

    # Get ecosystem-specific weights
    ecosystem_config = ECOSYSTEM_CATEGORY_WEIGHTS.get(
        ecosystem_type,
        ECOSYSTEM_CATEGORY_WEIGHTS["default"]
    )

    # Extract just the weights (not the description)
    weights = {k: v for k, v in ecosystem_config.items() if k in ["A", "B", "C", "D", "E"]}

    weighted_sum = 0.0
    total_weight = 0.0

    for pillar_id, score in pillar_scores.items():
        if score is None:
            continue

        weight = weights.get(pillar_id, 0.20)
        weighted_sum += score * weight
        total_weight += weight

    if total_weight == 0:
        return None

    # Normalize by total weight used (handles missing pillars)
    return round(weighted_sum / total_weight, 2)


def calculate_phi_esv_multiplier(phi_score: float) -> Optional[float]:
    """
    Calculate PHI-to-ESV (Ecosystem Service Value) multiplier.

    Formula: M_PHI = [(PHI - 50) / 100] * k * [1 + alpha * ln(PHI / 50)]

    Where:
    - k = 0.6 (base sensitivity factor)
    - alpha = 0.15 (logarithmic acceleration factor)

    The multiplier adjusts ecosystem service valuations based on health:
    - PHI = 50 produces multiplier near 0 (baseline)
    - PHI > 50 produces positive multiplier (enhanced value)
    - PHI < 50 produces negative multiplier (degraded value)

    Args:
        phi_score: Overall PHI score (0-100)

    Returns:
        ESV multiplier value, or None if invalid input
    """
    if phi_score is None or phi_score <= 0:
        return None

    k = PHI_ESV_CONSTANTS.get("k", 0.6)
    alpha = PHI_ESV_CONSTANTS.get("alpha", 0.15)

    # Protect against log(0) or log(negative)
    phi_clamped = max(phi_score, 1.0)

    try:
        base = (phi_clamped - 50) / 100

        # Protect against log of values <= 0
        ratio = phi_clamped / 50
        if ratio <= 0:
            return None

        log_factor = 1 + alpha * math.log(ratio)
        multiplier = base * k * log_factor
        return round(multiplier, 4)
    except (ValueError, ZeroDivisionError, OverflowError):
        return None


def get_score_interpretation(score: Optional[int]) -> str:
    """
    Get human-readable interpretation of a score.

    Score bands:
    - 80-100: Excellent - Ecosystem in excellent health
    - 60-79: Good - Ecosystem functioning well
    - 40-59: Moderate - Some concerns, monitoring needed
    - 20-39: Poor - Significant degradation
    - 0-19: Critical - Urgent intervention needed

    Args:
        score: Score 0-100

    Returns:
        Interpretation string
    """
    if score is None:
        return "Unavailable"
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Moderate"
    elif score >= 20:
        return "Poor"
    else:
        return "Critical"


def get_score_color(score: Optional[int]) -> str:
    """
    Get color code for a score.

    Args:
        score: Score 0-100

    Returns:
        Hex color code
    """
    if score is None:
        return "#95a5a6"  # Gray
    if score >= 80:
        return "#27ae60"  # Green
    elif score >= 60:
        return "#2ecc71"  # Light green
    elif score >= 40:
        return "#f39c12"  # Orange
    elif score >= 20:
        return "#e74c3c"  # Red
    else:
        return "#c0392b"  # Dark red


def get_detailed_scores(
    all_pillars: Dict[str, Dict[str, Any]],
    ecosystem_type: str = "default"
) -> Dict[str, Any]:
    """
    Calculate comprehensive PHI scores with full breakdown.

    Returns a complete scoring result including:
    - Overall PHI score
    - Individual pillar scores
    - Per-metric normalized scores
    - ESV multiplier
    - Ecosystem type used for weighting

    Args:
        all_pillars: Dict of pillar data with metrics
                    Format: {"A_atmospheric": {"metrics": {...}}, ...}
        ecosystem_type: Detected ecosystem type

    Returns:
        Comprehensive scoring result dictionary
    """
    pillar_scores = {}
    metric_scores = {}

    for pillar_id in ["A", "B", "C", "D", "E"]:
        # Find metrics for this pillar in the all_pillars dict
        pillar_metrics = {}
        for key, pillar_data in all_pillars.items():
            if key.startswith(pillar_id):
                pillar_metrics = pillar_data.get("metrics", {})
                break

        score, metrics = calculate_category_score(pillar_id, pillar_metrics)
        pillar_scores[pillar_id] = score
        metric_scores[pillar_id] = metrics

    overall = calculate_overall_score(pillar_scores, ecosystem_type)
    esv_multiplier = calculate_phi_esv_multiplier(overall) if overall else None

    # Get the weights used
    ecosystem_config = ECOSYSTEM_CATEGORY_WEIGHTS.get(
        ecosystem_type,
        ECOSYSTEM_CATEGORY_WEIGHTS["default"]
    )
    weights_used = {k: v for k, v in ecosystem_config.items() if k in ["A", "B", "C", "D", "E"]}

    return {
        "overall_score": overall,
        "overall_interpretation": get_score_interpretation(round(overall) if overall else None),
        "pillar_scores": pillar_scores,
        "metric_scores": metric_scores,
        "ecosystem_type": ecosystem_type,
        "esv_multiplier": esv_multiplier,
        "weights_used": weights_used,
        "methodology": "PHI Technical Framework v1.0"
    }


def get_metric_score_breakdown(
    metric_name: str,
    value: float
) -> Dict[str, Any]:
    """
    Get detailed breakdown of how a metric value was scored.

    Useful for debugging and explaining scores to users.

    Args:
        metric_name: Name of the metric
        value: Raw metric value

    Returns:
        Dict with scoring breakdown including parameters used
    """
    params = PHI_METRIC_PARAMS.get(metric_name)
    if not params:
        return {
            "metric": metric_name,
            "raw_value": value,
            "score": None,
            "error": "Metric not configured"
        }

    score = normalize_metric(metric_name, value)

    return {
        "metric": metric_name,
        "raw_value": value,
        "score": round(score, 2) if score else None,
        "normalization_type": params.get("norm_type"),
        "v_min": params.get("v_min"),
        "v_max": params.get("v_max"),
        "v_opt": params.get("v_opt"),
        "sigma": params.get("sigma"),
        "weight": params.get("weight"),
        "criticality": params.get("criticality"),
        "category": params.get("category")
    }
