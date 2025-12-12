"""Utility modules for the Planetary Health Query System.

This package provides:
- Normalization functions for PHI metric scoring
- Scoring calculations using PHI Technical Framework methodology
- Data quality assessment and DQS calculation
- Query result caching
"""

# Normalization functions
from .normalization import (
    NormalizationType,
    linear_normalize,
    inverse_linear_normalize,
    sigmoid_normalize,
    inverse_sigmoid_normalize,
    gaussian_normalize,
    centered_normalize,
    get_normalizer,
    normalize_value
)

# Scoring functions
from .scoring import (
    normalize_metric,
    calculate_category_score,
    calculate_pillar_score,
    calculate_overall_score,
    calculate_phi_esv_multiplier,
    get_score_interpretation,
    get_score_color,
    get_detailed_scores,
    get_metric_score_breakdown
)

# Quality assessment functions
from .quality import (
    assess_data_quality,
    assess_data_completeness,
    interpret_qa_band,
    validate_coordinate,
    calculate_dqs,
    calculate_dqs_from_pillars,
    assess_metric_quality_detailed,
    get_missing_critical_metrics,
    get_dqs_recommendation
)

# Caching
from .cache import QueryCache

__all__ = [
    # Normalization
    "NormalizationType",
    "linear_normalize",
    "inverse_linear_normalize",
    "sigmoid_normalize",
    "inverse_sigmoid_normalize",
    "gaussian_normalize",
    "centered_normalize",
    "get_normalizer",
    "normalize_value",

    # Scoring
    "normalize_metric",
    "calculate_category_score",
    "calculate_pillar_score",
    "calculate_overall_score",
    "calculate_phi_esv_multiplier",
    "get_score_interpretation",
    "get_score_color",
    "get_detailed_scores",
    "get_metric_score_breakdown",

    # Quality
    "assess_data_quality",
    "assess_data_completeness",
    "interpret_qa_band",
    "validate_coordinate",
    "calculate_dqs",
    "calculate_dqs_from_pillars",
    "assess_metric_quality_detailed",
    "get_missing_critical_metrics",
    "get_dqs_recommendation",

    # Cache
    "QueryCache"
]
