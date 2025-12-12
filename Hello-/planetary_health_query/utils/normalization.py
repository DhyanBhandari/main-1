"""
PHI Normalization Functions Module.
Implements the five core normalization functions from the PHI Technical Framework.

Normalization Types:
1. Linear: Higher raw values produce higher scores
2. Inverse Linear: Lower raw values produce higher scores
3. Sigmoid: S-shaped curve with diminishing returns at extremes
4. Gaussian: Maximum score at optimal value, decreasing symmetrically
5. Centered: Maximum score at zero, decreasing with distance from zero
"""

import math
from typing import Optional, Callable
from enum import Enum


class NormalizationType(Enum):
    """Normalization function types."""
    LINEAR = "linear"
    INVERSE_LINEAR = "inverse_linear"
    SIGMOID = "sigmoid"
    INVERSE_SIGMOID = "inverse_sigmoid"
    GAUSSIAN = "gaussian"
    CENTERED = "centered"


def linear_normalize(
    value: float,
    v_min: float,
    v_max: float
) -> float:
    """
    Linear normalization: S = [(V - V_min) / (V_max - V_min)] * 100

    Higher raw values produce higher scores.
    Used for metrics where higher is better (e.g., NDVI, Tree Cover, EVI).

    Args:
        value: Raw metric value
        v_min: Minimum reference value
        v_max: Maximum reference value

    Returns:
        Normalized score (0-100)
    """
    if v_max == v_min:
        return 50.0  # Avoid division by zero

    # Clamp value to range
    clamped = max(v_min, min(v_max, value))
    score = ((clamped - v_min) / (v_max - v_min)) * 100
    return max(0.0, min(100.0, score))


def inverse_linear_normalize(
    value: float,
    v_min: float,
    v_max: float
) -> float:
    """
    Inverse Linear normalization: S = [(V_max - V) / (V_max - V_min)] * 100

    Lower raw values produce higher scores.
    Used for metrics where lower is better (e.g., AOD, AQI, Forest Loss).

    Args:
        value: Raw metric value
        v_min: Minimum reference value
        v_max: Maximum reference value

    Returns:
        Normalized score (0-100)
    """
    if v_max == v_min:
        return 50.0  # Avoid division by zero

    # Clamp value to range
    clamped = max(v_min, min(v_max, value))
    score = ((v_max - clamped) / (v_max - v_min)) * 100
    return max(0.0, min(100.0, score))


def sigmoid_normalize(
    value: float,
    v_min: float,
    v_max: float,
    k: float = 0.5,
    v_mid: Optional[float] = None
) -> float:
    """
    Sigmoid normalization: S = 100 / [1 + exp(-k * (V - V_mid))]

    Produces S-shaped curve centered at V_mid.
    Used for metrics with diminishing returns at extremes (e.g., LAI, Biomass).

    Args:
        value: Raw metric value
        v_min: Minimum expected value
        v_max: Maximum expected value
        k: Steepness parameter (higher = steeper transition)
        v_mid: Midpoint value (default: (v_min + v_max) / 2)

    Returns:
        Normalized score (0-100)
    """
    if v_mid is None:
        v_mid = (v_min + v_max) / 2

    # Scale k based on the range to maintain consistent steepness
    range_val = v_max - v_min
    if range_val > 0:
        k_scaled = k * (10 / range_val)
    else:
        k_scaled = k

    try:
        exponent = -k_scaled * (value - v_mid)
        # Prevent overflow
        if exponent > 700:
            return 0.0
        elif exponent < -700:
            return 100.0
        score = 100 / (1 + math.exp(exponent))
        return max(0.0, min(100.0, score))
    except (OverflowError, ValueError):
        return 50.0


def inverse_sigmoid_normalize(
    value: float,
    v_min: float,
    v_max: float,
    k: float = 0.5,
    v_mid: Optional[float] = None
) -> float:
    """
    Inverse Sigmoid: S = 100 - sigmoid(V)

    Used for metrics where lower values are better but with diminishing
    returns at extremes (e.g., Population Density, Night Lights).

    Args:
        value: Raw metric value
        v_min: Minimum expected value
        v_max: Maximum expected value
        k: Steepness parameter (higher = steeper transition)
        v_mid: Midpoint value (default: (v_min + v_max) / 2)

    Returns:
        Normalized score (0-100)
    """
    return 100.0 - sigmoid_normalize(value, v_min, v_max, k, v_mid)


def gaussian_normalize(
    value: float,
    v_opt: float,
    sigma: float,
    v_min: Optional[float] = None,
    v_max: Optional[float] = None
) -> float:
    """
    Gaussian/Optimal normalization: S = 100 * exp[-(V - V_opt)^2 / (2 * sigma^2)]

    Maximum score at optimal value, decreasing symmetrically.
    Used for metrics with an optimal range (e.g., LST at 25C, Soil Moisture at 30%).

    Args:
        value: Raw metric value
        v_opt: Optimal value (peak of the Gaussian)
        sigma: Standard deviation (controls width of optimal range)
        v_min: Optional minimum for clamping
        v_max: Optional maximum for clamping

    Returns:
        Normalized score (0-100)
    """
    if v_min is not None and v_max is not None:
        value = max(v_min, min(v_max, value))

    if sigma == 0:
        # Perfect match at optimal or zero otherwise
        return 100.0 if value == v_opt else 0.0

    try:
        exponent = -((value - v_opt) ** 2) / (2 * sigma ** 2)
        score = 100 * math.exp(exponent)
        return max(0.0, min(100.0, score))
    except (OverflowError, ValueError):
        return 0.0


def centered_normalize(
    value: float,
    v_max: float
) -> float:
    """
    Centered normalization: S = 100 * [1 - (|V| / V_max)]

    Maximum score at V=0, decreasing with distance from zero.
    Used for indices centered around zero (e.g., Drought Index, Evaporative Stress).

    Args:
        value: Raw metric value
        v_max: Maximum absolute value expected

    Returns:
        Normalized score (0-100)
    """
    if v_max == 0:
        return 100.0 if value == 0 else 0.0

    abs_ratio = abs(value) / abs(v_max)
    score = 100 * (1 - abs_ratio)
    return max(0.0, min(100.0, score))


def get_normalizer(norm_type: str) -> Callable:
    """
    Get the normalization function for a given type.

    Args:
        norm_type: String name of normalization type

    Returns:
        Normalization function
    """
    normalizers = {
        "linear": linear_normalize,
        "inverse_linear": inverse_linear_normalize,
        "sigmoid": sigmoid_normalize,
        "inverse_sigmoid": inverse_sigmoid_normalize,
        "gaussian": gaussian_normalize,
        "centered": centered_normalize,
    }
    return normalizers.get(norm_type, linear_normalize)


def normalize_value(
    value: float,
    norm_type: str,
    v_min: float = 0,
    v_max: float = 100,
    v_opt: Optional[float] = None,
    sigma: Optional[float] = None,
    k: float = 0.5,
    v_mid: Optional[float] = None
) -> float:
    """
    Normalize a value using the specified normalization type and parameters.

    This is a convenience function that routes to the appropriate normalizer.

    Args:
        value: Raw metric value
        norm_type: Type of normalization to apply
        v_min: Minimum reference value
        v_max: Maximum reference value
        v_opt: Optimal value (for gaussian)
        sigma: Standard deviation (for gaussian)
        k: Steepness parameter (for sigmoid)
        v_mid: Midpoint value (for sigmoid)

    Returns:
        Normalized score (0-100)
    """
    if value is None:
        return None

    if norm_type == "linear":
        return linear_normalize(value, v_min, v_max)

    elif norm_type == "inverse_linear":
        return inverse_linear_normalize(value, v_min, v_max)

    elif norm_type == "sigmoid":
        return sigmoid_normalize(value, v_min, v_max, k, v_mid)

    elif norm_type == "inverse_sigmoid":
        return inverse_sigmoid_normalize(value, v_min, v_max, k, v_mid)

    elif norm_type == "gaussian":
        if v_opt is None:
            v_opt = (v_min + v_max) / 2
        if sigma is None:
            sigma = (v_max - v_min) / 4
        return gaussian_normalize(value, v_opt, sigma, v_min, v_max)

    elif norm_type == "centered":
        return centered_normalize(value, v_max)

    else:
        # Default to linear
        return linear_normalize(value, v_min, v_max)
