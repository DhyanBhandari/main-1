"""Core modules for the Planetary Health Query System."""

from .engine import GEEQueryEngine
from .authenticator import initialize_ee, get_project_id
from .config import DATASETS, PILLAR_CONFIG, RESOLUTION_PRESETS

__all__ = [
    "GEEQueryEngine",
    "initialize_ee",
    "get_project_id",
    "DATASETS",
    "PILLAR_CONFIG",
    "RESOLUTION_PRESETS"
]
