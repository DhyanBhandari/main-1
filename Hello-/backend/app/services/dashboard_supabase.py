"""
Dashboard Supabase Service - Cloud backup for dashboard data.

Features:
- Sync satellite readings to Supabase for cloud backup
- Retrieve stored satellite data from cloud
- Fallback when SQLite is unavailable
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List

# Supabase client (initialized lazily)
_supabase = None


def get_supabase():
    """Get or initialize Supabase client."""
    global _supabase

    if _supabase is not None:
        return _supabase

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        print("Warning: Supabase not configured for dashboard. Cloud sync disabled.")
        return None

    try:
        from supabase import create_client
        _supabase = create_client(url, key)
        return _supabase
    except ImportError:
        print("Warning: supabase package not installed. Cloud sync disabled.")
        return None
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase: {e}")
        return None


async def sync_satellite_reading(
    lat: float,
    lon: float,
    satellite_data: Dict[str, Any],
    sqlite_id: Optional[int] = None
) -> Optional[str]:
    """
    Sync a satellite reading to Supabase cloud.

    Args:
        lat: Latitude
        lon: Longitude
        satellite_data: PHI query result from GEE
        sqlite_id: Optional SQLite row ID for reference

    Returns:
        Supabase record ID (UUID) or None if failed
    """
    supabase = get_supabase()

    if supabase is None:
        return None

    try:
        summary = satellite_data.get("summary", {})
        pillar_scores = summary.get("pillar_scores", {})
        pillars = satellite_data.get("pillars", {})

        # Extract key metrics from pillars
        ndvi = None
        evi = None
        tree_cover = None
        soil_moisture = None
        lst = None
        aod = None
        population = None
        nightlights = None
        human_mod = None

        for pillar_key, pillar_data in pillars.items():
            metrics = pillar_data.get("metrics", {})
            if "ndvi" in metrics:
                ndvi = metrics["ndvi"].get("value")
            if "evi" in metrics:
                evi = metrics["evi"].get("value")
            if "tree_cover" in metrics:
                tree_cover = metrics["tree_cover"].get("value")
            if "soil_moisture" in metrics:
                soil_moisture = metrics["soil_moisture"].get("value")
            if "lst" in metrics:
                lst = metrics["lst"].get("value")
            if "aod" in metrics:
                aod = metrics["aod"].get("value")
            if "population" in metrics:
                population = metrics["population"].get("value")
            if "nightlights" in metrics:
                nightlights = metrics["nightlights"].get("value")
            if "human_modification" in metrics:
                human_mod = metrics["human_modification"].get("value")

        data = {
            "latitude": lat,
            "longitude": lon,
            "query_mode": satellite_data.get("query", {}).get("mode", "comprehensive"),
            "overall_score": summary.get("overall_score"),
            "pillar_a_score": pillar_scores.get("A"),
            "pillar_b_score": pillar_scores.get("B"),
            "pillar_c_score": pillar_scores.get("C"),
            "pillar_d_score": pillar_scores.get("D"),
            "pillar_e_score": pillar_scores.get("E"),
            "ndvi": ndvi,
            "evi": evi,
            "tree_cover": tree_cover,
            "soil_moisture": soil_moisture,
            "lst": lst,
            "aod": aod,
            "population": population,
            "nightlights": nightlights,
            "human_modification": human_mod,
            "ecosystem_type": summary.get("ecosystem_type"),
            "data_quality_score": summary.get("data_quality_score"),
            "data_completeness": summary.get("data_completeness"),
            "raw_data": satellite_data,
            "sqlite_id": sqlite_id,
        }

        response = supabase.table("satellite_readings").insert(data).execute()

        if response.data and len(response.data) > 0:
            record_id = response.data[0].get("id")
            print(f"Synced satellite reading to Supabase: {record_id}")
            return record_id

        return None

    except Exception as e:
        print(f"Failed to sync satellite reading to Supabase: {e}")
        return None


async def get_latest_satellite_from_cloud(
    lat: float,
    lon: float,
    tolerance: float = 0.01
) -> Optional[Dict[str, Any]]:
    """
    Get the most recent satellite reading from Supabase cloud.

    Args:
        lat: Latitude
        lon: Longitude
        tolerance: Coordinate tolerance for matching

    Returns:
        Latest satellite reading or None
    """
    supabase = get_supabase()

    if supabase is None:
        return None

    try:
        response = supabase.table("satellite_readings") \
            .select("*") \
            .gte("latitude", lat - tolerance) \
            .lte("latitude", lat + tolerance) \
            .gte("longitude", lon - tolerance) \
            .lte("longitude", lon + tolerance) \
            .order("timestamp", desc=True) \
            .limit(1) \
            .execute()

        if response.data and len(response.data) > 0:
            return response.data[0]

        return None

    except Exception as e:
        print(f"Failed to get satellite data from Supabase: {e}")
        return None


async def get_satellite_history_from_cloud(
    lat: float,
    lon: float,
    days: int = 7,
    tolerance: float = 0.01
) -> List[Dict[str, Any]]:
    """
    Get historical satellite readings from Supabase cloud.

    Args:
        lat: Latitude
        lon: Longitude
        days: Days of history to retrieve
        tolerance: Coordinate tolerance for matching

    Returns:
        List of satellite readings
    """
    supabase = get_supabase()

    if supabase is None:
        return []

    try:
        from datetime import timedelta
        since = datetime.now() - timedelta(days=days)

        response = supabase.table("satellite_readings") \
            .select("timestamp, overall_score, pillar_a_score, pillar_b_score, pillar_c_score, pillar_d_score, pillar_e_score, ndvi, evi, tree_cover, ecosystem_type") \
            .gte("latitude", lat - tolerance) \
            .lte("latitude", lat + tolerance) \
            .gte("longitude", lon - tolerance) \
            .lte("longitude", lon + tolerance) \
            .gte("timestamp", since.isoformat()) \
            .order("timestamp", desc=True) \
            .execute()

        return response.data if response.data else []

    except Exception as e:
        print(f"Failed to get satellite history from Supabase: {e}")
        return []


async def sync_location(
    name: str,
    lat: float,
    lon: float,
    poll_interval: int = 300
) -> Optional[str]:
    """
    Sync a dashboard location to Supabase cloud.

    Args:
        name: Location name
        lat: Latitude
        lon: Longitude
        poll_interval: Polling interval in seconds

    Returns:
        Supabase record ID (UUID) or None if failed
    """
    supabase = get_supabase()

    if supabase is None:
        return None

    try:
        # Check if location already exists
        existing = supabase.table("dashboard_locations") \
            .select("id") \
            .eq("latitude", lat) \
            .eq("longitude", lon) \
            .execute()

        if existing.data and len(existing.data) > 0:
            # Update existing
            location_id = existing.data[0]["id"]
            supabase.table("dashboard_locations") \
                .update({
                    "name": name,
                    "poll_interval_seconds": poll_interval,
                    "is_active": True,
                }) \
                .eq("id", location_id) \
                .execute()
            return location_id

        # Insert new
        data = {
            "name": name,
            "latitude": lat,
            "longitude": lon,
            "poll_interval_seconds": poll_interval,
            "is_active": True,
        }

        response = supabase.table("dashboard_locations").insert(data).execute()

        if response.data and len(response.data) > 0:
            return response.data[0].get("id")

        return None

    except Exception as e:
        print(f"Failed to sync location to Supabase: {e}")
        return None


async def get_cloud_stats() -> Dict[str, Any]:
    """Get dashboard cloud storage statistics."""
    supabase = get_supabase()

    if supabase is None:
        return {"available": False, "error": "Supabase not configured"}

    try:
        # Get satellite readings count
        satellite_count = supabase.table("satellite_readings") \
            .select("*", count="exact") \
            .execute()

        # Get locations count
        locations_count = supabase.table("dashboard_locations") \
            .select("*", count="exact") \
            .execute()

        return {
            "available": True,
            "satellite_readings_count": satellite_count.count if hasattr(satellite_count, 'count') else len(satellite_count.data),
            "locations_count": locations_count.count if hasattr(locations_count, 'count') else len(locations_count.data),
        }

    except Exception as e:
        return {"available": False, "error": str(e)}


def is_supabase_available() -> bool:
    """Check if Supabase is available for cloud sync."""
    return get_supabase() is not None
