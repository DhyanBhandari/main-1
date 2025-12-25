"""
Earth Engine Service - Handles EE initialization and queries.

Supports:
- Service account authentication (production)
- User authentication (development)
"""

import os
import json
import sys
from pathlib import Path

# Add planetary_health_query to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir.parent))  # For planetary_health_query package

_initialized = False


def initialize_ee():
    """
    Initialize Earth Engine with appropriate authentication.

    Uses service account in production (when EE_SERVICE_ACCOUNT is set),
    otherwise falls back to user authentication.
    """
    global _initialized

    if _initialized:
        return

    import ee

    service_account = os.environ.get("EE_SERVICE_ACCOUNT")
    private_key_json = os.environ.get("EE_PRIVATE_KEY")
    project_id = os.environ.get("EE_PROJECT_ID", "vibrant-arcanum-477610-v0")

    if service_account and private_key_json:
        # Production: Use service account
        try:
            # Check if EE_PRIVATE_KEY is full JSON or just the key
            if private_key_json.strip().startswith('{'):
                # Full JSON provided - use as-is
                key_data = private_key_json
            elif private_key_json.strip().startswith('-----BEGIN'):
                # Just the private key - build full JSON
                key_data = json.dumps({
                    "type": "service_account",
                    "project_id": project_id,
                    "private_key": private_key_json,
                    "client_email": service_account,
                    "token_uri": "https://oauth2.googleapis.com/token"
                })
            else:
                raise ValueError("EE_PRIVATE_KEY must be full JSON or start with -----BEGIN PRIVATE KEY-----")

            credentials = ee.ServiceAccountCredentials(
                service_account,
                key_data=key_data
            )
            ee.Initialize(credentials, project=project_id)
            print(f"Earth Engine initialized with service account: {service_account}")
            _initialized = True
        except Exception as e:
            print(f"Service account auth failed: {e}")
            raise
    else:
        # Development: Use user authentication
        try:
            ee.Initialize(project=project_id)
            print(f"Earth Engine initialized with user auth, project: {project_id}")
            _initialized = True
        except ee.EEException:
            print("Authenticating with Earth Engine...")
            ee.Authenticate()
            ee.Initialize(project=project_id)
            _initialized = True


def is_initialized() -> bool:
    """Check if Earth Engine is initialized."""
    return _initialized


def query_location(
    lat: float,
    lon: float,
    mode: str = "simple",
    include_scores: bool = True
) -> dict:
    """
    Query satellite data for a location.

    Args:
        lat: Latitude (-90 to 90)
        lon: Longitude (-180 to 180)
        mode: "simple" (10 metrics) or "comprehensive" (24 metrics)
        include_scores: Include pillar health scores

    Returns:
        Dict with pillar data and summary
    """
    global _initialized

    if not _initialized:
        initialize_ee()

    try:
        from planetary_health_query import GEEQueryEngine

        engine = GEEQueryEngine(auto_init=False)  # Already initialized
        engine._initialized = True

        result = engine.query(
            lat=lat,
            lon=lon,
            mode=mode,
            include_scores=include_scores,
            include_raw=True,
            temporal="latest",
            buffer_radius=500
        )

        return result

    except ImportError:
        # Fallback if package not available
        return create_demo_response(lat, lon, mode)


def query_polygon(
    points: list,
    mode: str = "comprehensive",
    include_scores: bool = True
) -> dict:
    """
    Query satellite data for a polygon area defined by 4 corner points.

    Args:
        points: List of 4 dicts with 'lat' and 'lng' keys
        mode: "simple" (10 metrics) or "comprehensive" (24 metrics)
        include_scores: Include pillar health scores

    Returns:
        Dict with pillar data, summary, area info, carbon credits, and ESV
    """
    global _initialized

    if not _initialized:
        initialize_ee()

    try:
        from planetary_health_query import GEEQueryEngine

        engine = GEEQueryEngine(auto_init=False)  # Already initialized
        engine._initialized = True

        result = engine.query_polygon(
            points=points,
            mode=mode,
            include_scores=include_scores,
            include_raw=True,
            temporal="latest"
        )

        return result

    except ImportError:
        # Fallback if package not available
        return create_polygon_demo_response(points, mode)


def create_polygon_demo_response(points: list, mode: str) -> dict:
    """Create demo response for polygon query when Earth Engine is not available."""
    from datetime import datetime
    import math

    # Calculate approximate area
    lats = [p['lat'] for p in points]
    lngs = [p['lng'] for p in points]
    centroid_lat = sum(lats) / 4
    centroid_lng = sum(lngs) / 4

    # Simple area approximation
    lat_range = max(lats) - min(lats)
    lng_range = max(lngs) - min(lngs)
    lat_km = lat_range * 111.32
    lng_km = lng_range * 111.32 * math.cos(math.radians(centroid_lat))
    area_km2 = lat_km * lng_km
    area_ha = area_km2 * 100

    return {
        "query": {
            "type": "polygon",
            "points": points,
            "centroid": {
                "latitude": centroid_lat,
                "longitude": centroid_lng
            },
            "timestamp": datetime.now().isoformat(),
            "mode": mode
        },
        "pillars": {
            "A_atmospheric": {
                "pillar_id": "A",
                "pillar_name": "Atmospheric",
                "pillar_color": "#3498db",
                "metrics": {
                    "aod": {"value": 0.35, "unit": "dimensionless", "quality": "good"},
                    "aqi": {"value": 65, "unit": "index", "quality": "good"}
                },
                "score": 72
            },
            "B_biodiversity": {
                "pillar_id": "B",
                "pillar_name": "Biodiversity",
                "pillar_color": "#27ae60",
                "metrics": {
                    "ndvi": {"value": 0.65, "unit": "dimensionless", "quality": "good"},
                    "evi": {"value": 0.45, "unit": "dimensionless", "quality": "good"}
                },
                "score": 78
            },
            "C_carbon": {
                "pillar_id": "C",
                "pillar_name": "Carbon",
                "pillar_color": "#8e44ad",
                "metrics": {
                    "tree_cover": {"value": 45, "unit": "percent", "quality": "good"},
                    "biomass": {"value": 120, "unit": "Mg/ha", "quality": "good"},
                    "carbon_stock": {"value": 60, "unit": "Mg C/ha", "quality": "good"}
                },
                "score": 65
            },
            "D_degradation": {
                "pillar_id": "D",
                "pillar_name": "Degradation",
                "pillar_color": "#e74c3c",
                "metrics": {
                    "lst": {"value": 28.5, "unit": "Celsius", "quality": "good"},
                    "soil_moisture": {"value": 0.32, "unit": "m3/m3", "quality": "good"}
                },
                "score": 70
            },
            "E_ecosystem": {
                "pillar_id": "E",
                "pillar_name": "Ecosystem",
                "pillar_color": "#f39c12",
                "metrics": {
                    "population": {"value": 1250, "unit": "people/km2", "quality": "good"},
                    "nightlights": {"value": 12.5, "unit": "nanoWatts/cm2/sr", "quality": "good"}
                },
                "score": 55
            }
        },
        "summary": {
            "overall_score": 68,
            "pillar_scores": {"A": 72, "B": 78, "C": 65, "D": 70, "E": 55},
            "data_completeness": 0.95,
            "ecosystem_type": "agricultural",
            "geometry": {
                "type": "Polygon",
                "points": points,
                "area_m2": area_ha * 10000,
                "area_ha": round(area_ha, 2),
                "area_acres": round(area_ha * 2.47105, 2)
            },
            "carbon_credits": {
                "available": True,
                "carbon_stock_mg_c_ha": 60,
                "total_carbon_mg": round(60 * area_ha, 2),
                "co2_equivalent_tonnes": round(60 * area_ha * 3.67, 2),
                "verified_co2_tonnes": round(60 * area_ha * 3.67 * 0.68, 2),
                "estimated_value": {
                    "low_usd": round(60 * area_ha * 3.67 * 0.68 * 15, 2),
                    "mid_usd": round(60 * area_ha * 3.67 * 0.68 * 25, 2),
                    "high_usd": round(60 * area_ha * 3.67 * 0.68 * 50, 2)
                },
                "methodology": "IPCC Tier 1 (demo)"
            },
            "ecosystem_service_value": {
                "available": True,
                "ecosystem_type": "agricultural",
                "base_esv_per_ha_usd": 1532,
                "adjusted_esv_per_ha_usd": 1685,
                "total_annual_esv_usd": round(1685 * area_ha, 2),
                "area_ha": round(area_ha, 2),
                "methodology": "Costanza et al. (2014) + PHI adjustment (demo)"
            },
            "quality_flags": []
        },
        "demo_mode": True
    }


def create_demo_response(lat: float, lon: float, mode: str) -> dict:
    """Create demo response when Earth Engine is not available."""
    from datetime import datetime

    return {
        "query": {
            "latitude": lat,
            "longitude": lon,
            "timestamp": datetime.now().isoformat(),
            "mode": mode,
            "buffer_radius_m": 500
        },
        "pillars": {
            "A_atmospheric": {
                "pillar_id": "A",
                "pillar_name": "Atmospheric",
                "pillar_color": "#3498db",
                "metrics": {
                    "aod": {"value": 0.35, "unit": "dimensionless", "quality": "good"},
                    "aqi": {"value": 65, "unit": "index", "quality": "good"}
                },
                "score": 72
            },
            "B_biodiversity": {
                "pillar_id": "B",
                "pillar_name": "Biodiversity",
                "pillar_color": "#27ae60",
                "metrics": {
                    "ndvi": {"value": 0.65, "unit": "dimensionless", "quality": "good"},
                    "evi": {"value": 0.45, "unit": "dimensionless", "quality": "good"}
                },
                "score": 78
            },
            "C_carbon": {
                "pillar_id": "C",
                "pillar_name": "Carbon",
                "pillar_color": "#8e44ad",
                "metrics": {
                    "tree_cover": {"value": 45, "unit": "percent", "quality": "good"},
                    "forest_loss": {"value": 0, "unit": "binary", "quality": "good"}
                },
                "score": 65
            },
            "D_degradation": {
                "pillar_id": "D",
                "pillar_name": "Degradation",
                "pillar_color": "#e74c3c",
                "metrics": {
                    "lst": {"value": 28.5, "unit": "Celsius", "quality": "good"},
                    "soil_moisture": {"value": 0.32, "unit": "m3/m3", "quality": "good"}
                },
                "score": 70
            },
            "E_ecosystem": {
                "pillar_id": "E",
                "pillar_name": "Ecosystem",
                "pillar_color": "#f39c12",
                "metrics": {
                    "population": {"value": 1250, "unit": "people/km2", "quality": "good"},
                    "nightlights": {"value": 12.5, "unit": "nanoWatts/cm2/sr", "quality": "good"}
                },
                "score": 55
            }
        },
        "summary": {
            "overall_score": 68,
            "pillar_scores": {"A": 72, "B": 78, "C": 65, "D": 70, "E": 55},
            "data_completeness": 0.95,
            "quality_flags": []
        },
        "demo_mode": True
    }
