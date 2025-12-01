"""
Planetary Health Query System
Real-time Earth Engine queries for ANY lat/lon worldwide.

Supports 5 Pillars:
    A - Atmospheric (Air Quality, AOD, UV)
    B - Biodiversity (NDVI, EVI, LAI, Land Cover)
    C - Carbon (Forest Cover, Biomass, Carbon Stock)
    D - Degradation (LST, Soil Moisture, Drought)
    E - Ecosystem (Population, Nightlights, Human Modification)

Usage:
    from planetary_health_query import GEEQueryEngine

    engine = GEEQueryEngine()
    result = engine.query(lat=28.6139, lon=77.2090, mode="comprehensive")
"""

from .core.engine import GEEQueryEngine
from .core.config import DATASETS, PILLAR_CONFIG

__version__ = "1.0.0"
__all__ = ["GEEQueryEngine", "DATASETS", "PILLAR_CONFIG"]
