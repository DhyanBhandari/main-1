"""
Earth Engine Authentication Handler.
Manages EE initialization and authentication with Google Cloud.
"""

import os
from pathlib import Path
from .config import DEFAULT_PROJECT_ID


def get_project_id() -> str:
    """
    Get the Google Cloud Project ID for Earth Engine.

    Priority:
    1. Environment variable EE_PROJECT_ID
    2. Config file ee_project_config.txt
    3. Default project ID

    Returns:
        str: The project ID to use
    """
    # Check environment variable first
    env_project = os.environ.get("EE_PROJECT_ID")
    if env_project:
        return env_project

    # Check config file
    config_paths = [
        Path("ee_project_config.txt"),
        Path(__file__).parent.parent.parent / "ee_project_config.txt"
    ]

    for config_path in config_paths:
        if config_path.exists():
            project_id = config_path.read_text().strip()
            if project_id:
                return project_id

    # Return default
    return DEFAULT_PROJECT_ID


def initialize_ee(project_id: str = None, force_auth: bool = False) -> bool:
    """
    Initialize Earth Engine with proper authentication.

    Args:
        project_id: Optional project ID. If None, uses get_project_id()
        force_auth: If True, forces re-authentication

    Returns:
        bool: True if initialization successful

    Raises:
        Exception: If initialization fails after authentication
    """
    import ee

    if project_id is None:
        project_id = get_project_id()

    if force_auth:
        ee.Authenticate()

    try:
        ee.Initialize(project=project_id)
        print(f"Earth Engine initialized with project: {project_id}")
        return True
    except ee.EEException as e:
        if "not found" in str(e).lower() or "authenticate" in str(e).lower():
            print("Authentication required. Opening browser...")
            ee.Authenticate()
            ee.Initialize(project=project_id)
            print(f"Earth Engine initialized with project: {project_id}")
            return True
        else:
            raise


def check_ee_connection() -> dict:
    """
    Check Earth Engine connection status and quota.

    Returns:
        dict: Connection status information
    """
    import ee

    try:
        # Try a simple operation to verify connection
        test_point = ee.Geometry.Point([0, 0])
        _ = test_point.getInfo()

        return {
            "connected": True,
            "project_id": get_project_id(),
            "message": "Connection successful"
        }
    except Exception as e:
        return {
            "connected": False,
            "project_id": get_project_id(),
            "message": str(e)
        }


def get_ee_asset_info(asset_id: str) -> dict:
    """
    Get information about an Earth Engine asset.

    Args:
        asset_id: The Earth Engine asset ID

    Returns:
        dict: Asset information or error details
    """
    import ee

    try:
        asset = ee.data.getAsset(asset_id)
        return {
            "exists": True,
            "type": asset.get("type", "unknown"),
            "id": asset.get("id", asset_id),
            "properties": asset.get("properties", {})
        }
    except Exception as e:
        return {
            "exists": False,
            "error": str(e)
        }
