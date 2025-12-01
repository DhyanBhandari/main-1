"""
Pillar Scoring Module.
Calculates health scores (0-100) for each pillar and overall.
"""

from typing import Dict, Any, Optional
from ..core.config import METRIC_METADATA, PILLAR_CONFIG


def calculate_pillar_score(pillar_id: str, metrics: Dict[str, Any]) -> Optional[int]:
    """
    Calculate a health score (0-100) for a pillar.

    Args:
        pillar_id: Pillar identifier (A, B, C, D, or E)
        metrics: Dict of metric values from pillar query

    Returns:
        Score 0-100, or None if insufficient data
    """
    if not metrics:
        return None

    score_funcs = {
        "A": _score_atmospheric,
        "B": _score_biodiversity,
        "C": _score_carbon,
        "D": _score_degradation,
        "E": _score_ecosystem
    }

    scorer = score_funcs.get(pillar_id)
    if scorer:
        return scorer(metrics)

    return None


def calculate_overall_score(pillar_scores: Dict[str, int]) -> Optional[int]:
    """
    Calculate overall planetary health score.

    Args:
        pillar_scores: Dict mapping pillar IDs to scores

    Returns:
        Weighted average score 0-100, or None if insufficient data
    """
    if not pillar_scores:
        return None

    total_weight = 0
    weighted_sum = 0

    for pillar_id, score in pillar_scores.items():
        if score is not None:
            weight = PILLAR_CONFIG.get(pillar_id, {}).get("weight", 0.2)
            weighted_sum += score * weight
            total_weight += weight

    if total_weight == 0:
        return None

    return round(weighted_sum / total_weight)


def _score_atmospheric(metrics: Dict[str, Any]) -> Optional[int]:
    """Score atmospheric pillar."""
    scores = []

    # AOD scoring (lower is better)
    aod = _get_metric_value(metrics, "aod")
    if aod is not None:
        if aod < 0.1:
            scores.append(100)
        elif aod < 0.2:
            scores.append(80)
        elif aod < 0.3:
            scores.append(60)
        elif aod < 0.5:
            scores.append(40)
        else:
            scores.append(20)

    # AQI scoring (lower is better)
    aqi = _get_metric_value(metrics, "aqi")
    if aqi is not None:
        if aqi < 50:
            scores.append(100)
        elif aqi < 100:
            scores.append(75)
        elif aqi < 150:
            scores.append(50)
        elif aqi < 200:
            scores.append(25)
        else:
            scores.append(10)

    if not scores:
        return None

    return round(sum(scores) / len(scores))


def _score_biodiversity(metrics: Dict[str, Any]) -> Optional[int]:
    """Score biodiversity pillar."""
    scores = []

    # NDVI scoring (higher is better for vegetated areas)
    ndvi = _get_metric_value(metrics, "ndvi")
    if ndvi is not None:
        if ndvi > 0.7:
            scores.append(100)
        elif ndvi > 0.5:
            scores.append(80)
        elif ndvi > 0.3:
            scores.append(60)
        elif ndvi > 0.1:
            scores.append(40)
        else:
            scores.append(20)

    # EVI scoring
    evi = _get_metric_value(metrics, "evi")
    if evi is not None:
        if evi > 0.5:
            scores.append(100)
        elif evi > 0.35:
            scores.append(80)
        elif evi > 0.2:
            scores.append(60)
        else:
            scores.append(40)

    # LAI scoring
    lai = _get_metric_value(metrics, "lai")
    if lai is not None:
        if lai > 4:
            scores.append(100)
        elif lai > 2.5:
            scores.append(80)
        elif lai > 1:
            scores.append(60)
        else:
            scores.append(40)

    if not scores:
        return None

    return round(sum(scores) / len(scores))


def _score_carbon(metrics: Dict[str, Any]) -> Optional[int]:
    """Score carbon pillar."""
    scores = []

    # Tree cover scoring (higher is better)
    tree_cover = _get_metric_value(metrics, "tree_cover")
    if tree_cover is not None:
        scores.append(min(100, tree_cover))  # Direct percentage

    # Forest loss scoring (no loss is better)
    forest_loss = _get_metric_value(metrics, "forest_loss")
    if forest_loss is not None:
        scores.append(100 if forest_loss == 0 else 20)

    # Canopy height scoring
    height = _get_metric_value(metrics, "canopy_height")
    if height is not None:
        if height > 30:
            scores.append(100)
        elif height > 20:
            scores.append(80)
        elif height > 10:
            scores.append(60)
        elif height > 5:
            scores.append(40)
        else:
            scores.append(20)

    # Biomass scoring
    biomass = _get_metric_value(metrics, "biomass")
    if biomass is not None:
        if biomass > 200:
            scores.append(100)
        elif biomass > 100:
            scores.append(80)
        elif biomass > 50:
            scores.append(60)
        elif biomass > 20:
            scores.append(40)
        else:
            scores.append(20)

    if not scores:
        return None

    return round(sum(scores) / len(scores))


def _score_degradation(metrics: Dict[str, Any]) -> Optional[int]:
    """Score degradation pillar (inverted - lower stress is better)."""
    scores = []

    # LST scoring (moderate temperatures are better)
    lst = _get_metric_value(metrics, "lst")
    if lst is not None:
        # Optimal range 15-30 C
        if 15 <= lst <= 30:
            scores.append(100)
        elif 10 <= lst <= 35:
            scores.append(80)
        elif 5 <= lst <= 40:
            scores.append(60)
        else:
            scores.append(40)

    # Soil moisture scoring (moderate is better)
    sm = _get_metric_value(metrics, "soil_moisture")
    if sm is not None:
        if 0.2 <= sm <= 0.4:
            scores.append(100)
        elif 0.1 <= sm <= 0.5:
            scores.append(70)
        else:
            scores.append(40)

    # Drought index scoring (closer to 0 is better)
    drought = _get_metric_value(metrics, "drought_index")
    if drought is not None:
        drought_abs = abs(drought)
        if drought_abs < 0.5:
            scores.append(100)
        elif drought_abs < 1:
            scores.append(75)
        elif drought_abs < 1.5:
            scores.append(50)
        else:
            scores.append(25)

    if not scores:
        return None

    return round(sum(scores) / len(scores))


def _score_ecosystem(metrics: Dict[str, Any]) -> Optional[int]:
    """Score ecosystem pillar."""
    scores = []

    # Human modification scoring (context dependent)
    # For this general scoring, we treat moderate modification as neutral
    hm = _get_metric_value(metrics, "human_modification")
    if hm is not None:
        # Scale: 0 (pristine) to 1 (heavily modified)
        # We give higher scores to less modified areas
        scores.append(round(100 * (1 - hm)))

    # Nightlights - context dependent
    # Rural areas might want low, urban might want high
    # We'll score based on moderate urbanization being neutral
    nightlights = _get_metric_value(metrics, "nightlights")
    if nightlights is not None:
        # This is informational, not scored
        pass

    # Population - informational, not directly scored
    population = _get_metric_value(metrics, "population")
    if population is not None:
        # Informational only
        pass

    if not scores:
        # Default neutral score if only informational metrics
        return 50

    return round(sum(scores) / len(scores))


def _get_metric_value(metrics: Dict[str, Any], metric_name: str) -> Optional[float]:
    """Extract numeric value from metrics dict."""
    metric_data = metrics.get(metric_name, {})
    if isinstance(metric_data, dict):
        return metric_data.get("value")
    return metric_data


def get_score_interpretation(score: int) -> str:
    """
    Get human-readable interpretation of a score.

    Args:
        score: Score 0-100

    Returns:
        Interpretation string
    """
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


def get_score_color(score: int) -> str:
    """
    Get color code for a score.

    Args:
        score: Score 0-100

    Returns:
        Hex color code
    """
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
