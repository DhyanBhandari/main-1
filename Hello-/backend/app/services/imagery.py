"""
Remote Sensing Imagery Service.

Generates visualization tiles/thumbnails from Earth Engine datasets:
- True Color (Sentinel-2 RGB)
- NDVI (Vegetation Index)
- LST (Land Surface Temperature)
- Land Cover (ESA WorldCover)
- Forest Cover (Hansen Global Forest Change)

Note: This service generates thumbnails via EE getThumbURL() which provides
static images suitable for dashboard display.
"""

import ee
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from .earth_engine import initialize_ee, is_initialized


# Visualization parameters for different imagery types
VIS_PARAMS = {
    "true_color": {
        "bands": ["B4", "B3", "B2"],  # RGB for Sentinel-2
        "min": 0,
        "max": 3000,
        "description": "Natural color composite from Sentinel-2"
    },
    "ndvi": {
        "min": -0.2,
        "max": 0.8,
        "palette": [
            "#d73027",  # Red - bare soil/water
            "#fc8d59",  # Orange
            "#fee08b",  # Yellow
            "#d9ef8b",  # Light green
            "#91cf60",  # Medium green
            "#1a9850"   # Dark green - dense vegetation
        ],
        "description": "Normalized Difference Vegetation Index"
    },
    "lst": {
        "min": 273,  # 0°C in Kelvin
        "max": 323,  # 50°C in Kelvin
        "palette": [
            "#313695",  # Dark blue - cold
            "#4575b4",
            "#74add1",
            "#abd9e9",
            "#e0f3f8",
            "#ffffbf",  # Yellow - moderate
            "#fee090",
            "#fdae61",
            "#f46d43",
            "#d73027",
            "#a50026"   # Dark red - hot
        ],
        "description": "Land Surface Temperature from MODIS"
    },
    "land_cover": {
        "min": 10,
        "max": 100,
        "palette": [
            "#006400",  # 10 - Tree cover
            "#ffbb22",  # 20 - Shrubland
            "#ffff4c",  # 30 - Grassland
            "#f096ff",  # 40 - Cropland
            "#fa0000",  # 50 - Built-up
            "#b4b4b4",  # 60 - Bare / sparse vegetation
            "#f0f0f0",  # 70 - Snow and ice
            "#0064c8",  # 80 - Permanent water bodies
            "#0096a0",  # 90 - Herbaceous wetland
            "#00cf75",  # 95 - Mangroves
            "#fae6a0"   # 100 - Moss and lichen
        ],
        "description": "ESA WorldCover land classification"
    },
    "forest_cover": {
        "min": 0,
        "max": 100,
        "palette": [
            "#ffffcc",  # 0% - No forest
            "#c2e699",
            "#78c679",
            "#31a354",
            "#006837"   # 100% - Dense forest
        ],
        "description": "Tree canopy cover percentage (Hansen)"
    }
}


def get_imagery_urls(
    lat: float,
    lon: float,
    zoom_level: int = 12,
    image_size: int = 512,
    buffer_km: float = 5.0
) -> Dict[str, Any]:
    """
    Generate imagery thumbnail URLs for a location.

    Args:
        lat: Latitude
        lon: Longitude
        zoom_level: Map zoom level (affects image detail)
        image_size: Output image size in pixels
        buffer_km: Buffer around point in kilometers

    Returns:
        Dict with imagery URLs and metadata
    """
    if not is_initialized():
        initialize_ee()

    # Create point and region
    point = ee.Geometry.Point([lon, lat])
    buffer_m = buffer_km * 1000
    region = point.buffer(buffer_m).bounds()

    # Date range for recent imagery (last 90 days for most datasets)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    date_range = {
        "start": start_date.strftime("%Y-%m-%d"),
        "end": end_date.strftime("%Y-%m-%d")
    }

    # Generate each imagery type
    results = {
        "location": {"lat": lat, "lon": lon},
        "buffer_km": buffer_km,
        "generated_at": datetime.now().isoformat(),
        "imagery": {}
    }

    try:
        # 1. True Color (Sentinel-2)
        results["imagery"]["true_color"] = _get_true_color_url(
            region, date_range, image_size
        )
    except Exception as e:
        results["imagery"]["true_color"] = {"error": str(e), "available": False}

    try:
        # 2. NDVI (Sentinel-2)
        results["imagery"]["ndvi"] = _get_ndvi_url(
            region, date_range, image_size
        )
    except Exception as e:
        results["imagery"]["ndvi"] = {"error": str(e), "available": False}

    try:
        # 3. LST (MODIS)
        results["imagery"]["lst"] = _get_lst_url(
            region, date_range, image_size
        )
    except Exception as e:
        results["imagery"]["lst"] = {"error": str(e), "available": False}

    try:
        # 4. Land Cover (ESA WorldCover)
        results["imagery"]["land_cover"] = _get_land_cover_url(
            region, image_size
        )
    except Exception as e:
        results["imagery"]["land_cover"] = {"error": str(e), "available": False}

    try:
        # 5. Forest Cover (Hansen)
        results["imagery"]["forest_cover"] = _get_forest_cover_url(
            region, image_size
        )
    except Exception as e:
        results["imagery"]["forest_cover"] = {"error": str(e), "available": False}

    return results


def _get_true_color_url(
    region: ee.Geometry,
    date_range: Dict[str, str],
    image_size: int
) -> Dict[str, Any]:
    """Generate Sentinel-2 true color composite."""
    # Get Sentinel-2 surface reflectance
    collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
        .filterBounds(region) \
        .filterDate(date_range["start"], date_range["end"]) \
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20)) \
        .sort("CLOUDY_PIXEL_PERCENTAGE")

    # Get the least cloudy image or median composite
    count = collection.size().getInfo()

    if count == 0:
        # Fallback to older date range
        older_start = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(region) \
            .filterDate(older_start, date_range["end"]) \
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30)) \
            .sort("CLOUDY_PIXEL_PERCENTAGE")
        count = collection.size().getInfo()

    if count == 0:
        return {"error": "No imagery available", "available": False}

    image = collection.first()

    # Get image date
    image_date = ee.Date(image.get("system:time_start")).format("YYYY-MM-dd").getInfo()

    # Generate thumbnail URL
    vis_params = VIS_PARAMS["true_color"]
    url = image.getThumbURL({
        "bands": vis_params["bands"],
        "min": vis_params["min"],
        "max": vis_params["max"],
        "region": region,
        "dimensions": image_size,
        "format": "png"
    })

    return {
        "url": url,
        "available": True,
        "capture_date": image_date,
        "source": "Sentinel-2",
        "description": vis_params["description"],
        "legend": None  # No legend for true color
    }


def _get_ndvi_url(
    region: ee.Geometry,
    date_range: Dict[str, str],
    image_size: int
) -> Dict[str, Any]:
    """Generate NDVI visualization from Sentinel-2."""
    # Get Sentinel-2 surface reflectance
    collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
        .filterBounds(region) \
        .filterDate(date_range["start"], date_range["end"]) \
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))

    count = collection.size().getInfo()

    if count == 0:
        older_start = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
            .filterBounds(region) \
            .filterDate(older_start, date_range["end"]) \
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30))
        count = collection.size().getInfo()

    if count == 0:
        return {"error": "No imagery available", "available": False}

    # Compute NDVI from median composite
    image = collection.median()
    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")

    # Get approximate date (median doesn't have a single date)
    latest_date = collection.sort("system:time_start", False).first()
    image_date = ee.Date(latest_date.get("system:time_start")).format("YYYY-MM-dd").getInfo()

    vis_params = VIS_PARAMS["ndvi"]
    url = ndvi.getThumbURL({
        "min": vis_params["min"],
        "max": vis_params["max"],
        "palette": vis_params["palette"],
        "region": region,
        "dimensions": image_size,
        "format": "png"
    })

    return {
        "url": url,
        "available": True,
        "capture_date": image_date,
        "source": "Sentinel-2 (computed)",
        "description": vis_params["description"],
        "legend": {
            "min": {"value": vis_params["min"], "label": "Bare/Water", "color": vis_params["palette"][0]},
            "max": {"value": vis_params["max"], "label": "Dense Vegetation", "color": vis_params["palette"][-1]}
        }
    }


def _get_lst_url(
    region: ee.Geometry,
    date_range: Dict[str, str],
    image_size: int
) -> Dict[str, Any]:
    """Generate Land Surface Temperature from MODIS."""
    # MODIS LST product
    collection = ee.ImageCollection("MODIS/061/MOD11A2") \
        .filterBounds(region) \
        .filterDate(date_range["start"], date_range["end"]) \
        .select("LST_Day_1km")

    count = collection.size().getInfo()

    if count == 0:
        older_start = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        collection = ee.ImageCollection("MODIS/061/MOD11A2") \
            .filterBounds(region) \
            .filterDate(older_start, date_range["end"]) \
            .select("LST_Day_1km")
        count = collection.size().getInfo()

    if count == 0:
        return {"error": "No LST data available", "available": False}

    # Get mean LST (already in Kelvin * 0.02)
    image = collection.mean().multiply(0.02)  # Scale factor

    # Get approximate date
    latest_date = collection.sort("system:time_start", False).first()
    image_date = ee.Date(latest_date.get("system:time_start")).format("YYYY-MM-dd").getInfo()

    vis_params = VIS_PARAMS["lst"]
    url = image.getThumbURL({
        "min": vis_params["min"],
        "max": vis_params["max"],
        "palette": vis_params["palette"],
        "region": region,
        "dimensions": image_size,
        "format": "png"
    })

    return {
        "url": url,
        "available": True,
        "capture_date": image_date,
        "source": "MODIS Terra",
        "description": vis_params["description"],
        "legend": {
            "min": {"value": 0, "label": "0°C", "color": vis_params["palette"][0]},
            "max": {"value": 50, "label": "50°C", "color": vis_params["palette"][-1]}
        }
    }


def _get_land_cover_url(
    region: ee.Geometry,
    image_size: int
) -> Dict[str, Any]:
    """Generate ESA WorldCover land classification."""
    # ESA WorldCover 2021
    image = ee.Image("ESA/WorldCover/v200/2021").select("Map")

    vis_params = VIS_PARAMS["land_cover"]
    url = image.getThumbURL({
        "min": vis_params["min"],
        "max": vis_params["max"],
        "palette": vis_params["palette"],
        "region": region,
        "dimensions": image_size,
        "format": "png"
    })

    return {
        "url": url,
        "available": True,
        "capture_date": "2021",
        "source": "ESA WorldCover",
        "description": vis_params["description"],
        "legend": {
            "classes": [
                {"value": 10, "label": "Tree cover", "color": "#006400"},
                {"value": 20, "label": "Shrubland", "color": "#ffbb22"},
                {"value": 30, "label": "Grassland", "color": "#ffff4c"},
                {"value": 40, "label": "Cropland", "color": "#f096ff"},
                {"value": 50, "label": "Built-up", "color": "#fa0000"},
                {"value": 60, "label": "Bare", "color": "#b4b4b4"},
                {"value": 80, "label": "Water", "color": "#0064c8"},
                {"value": 90, "label": "Wetland", "color": "#0096a0"}
            ]
        }
    }


def _get_forest_cover_url(
    region: ee.Geometry,
    image_size: int
) -> Dict[str, Any]:
    """Generate Hansen Global Forest Change tree cover."""
    # Hansen Global Forest Change 2022
    image = ee.Image("UMD/hansen/global_forest_change_2022_v1_10") \
        .select("treecover2000")

    vis_params = VIS_PARAMS["forest_cover"]
    url = image.getThumbURL({
        "min": vis_params["min"],
        "max": vis_params["max"],
        "palette": vis_params["palette"],
        "region": region,
        "dimensions": image_size,
        "format": "png"
    })

    return {
        "url": url,
        "available": True,
        "capture_date": "2000 (baseline)",
        "source": "Hansen/UMD/Google",
        "description": vis_params["description"],
        "legend": {
            "min": {"value": 0, "label": "0%", "color": vis_params["palette"][0]},
            "max": {"value": 100, "label": "100%", "color": vis_params["palette"][-1]}
        }
    }


def get_available_imagery_types() -> List[Dict[str, Any]]:
    """Get list of available imagery types with descriptions."""
    return [
        {
            "id": "true_color",
            "name": "True Color",
            "source": "Sentinel-2",
            "description": "Natural color satellite view (RGB)",
            "technology": "Multispectral Imaging"
        },
        {
            "id": "ndvi",
            "name": "Vegetation Health",
            "source": "Sentinel-2",
            "description": "NDVI showing vegetation density and health",
            "technology": "Multispectral Analysis"
        },
        {
            "id": "lst",
            "name": "Surface Temperature",
            "source": "MODIS",
            "description": "Land surface temperature heatmap",
            "technology": "Thermal Imaging"
        },
        {
            "id": "land_cover",
            "name": "Land Classification",
            "source": "ESA WorldCover",
            "description": "Land use/land cover classification",
            "technology": "Machine Learning Classification"
        },
        {
            "id": "forest_cover",
            "name": "Forest Density",
            "source": "Hansen/UMD",
            "description": "Tree canopy cover percentage",
            "technology": "LiDAR & Optical Analysis"
        }
    ]
