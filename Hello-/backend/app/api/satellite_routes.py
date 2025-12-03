"""
Satellite Imagery API Routes.

Endpoints:
    GET /api/satellite/images - Get all satellite image URLs for a location
    GET /api/satellite/image - Get specific satellite image URL
    GET /api/satellite/legend - Get color legend for image type
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

router = APIRouter(prefix="/satellite", tags=["satellite"])


class ImageResponse(BaseModel):
    """Response model for satellite images."""
    success: bool
    image_type: str
    url: Optional[str] = None
    error: Optional[str] = None


class AllImagesResponse(BaseModel):
    """Response model for all satellite images."""
    success: bool
    latitude: float
    longitude: float
    buffer_km: float
    images: Dict[str, Optional[str]]
    error: Optional[str] = None


class LegendItem(BaseModel):
    """Legend item with color and label."""
    color: str
    label: str
    value: Optional[str] = None


class LegendResponse(BaseModel):
    """Response model for color legend."""
    image_type: str
    title: str
    description: str
    legend: List[LegendItem]


# Color legends for each image type
LEGENDS = {
    'ndvi': {
        'title': 'NDVI - Vegetation Health',
        'description': 'Normalized Difference Vegetation Index shows plant health. Higher values indicate healthier, denser vegetation.',
        'items': [
            {'color': '#8B4513', 'label': 'No vegetation', 'value': '< 0'},
            {'color': '#D2691E', 'label': 'Bare soil/urban', 'value': '0 - 0.2'},
            {'color': '#FFD700', 'label': 'Sparse vegetation', 'value': '0.2 - 0.4'},
            {'color': '#9ACD32', 'label': 'Moderate vegetation', 'value': '0.4 - 0.6'},
            {'color': '#228B22', 'label': 'Dense vegetation', 'value': '0.6 - 0.8'},
            {'color': '#006400', 'label': 'Very dense vegetation', 'value': '> 0.8'},
        ]
    },
    'lst': {
        'title': 'Land Surface Temperature',
        'description': 'Surface temperature measured by MODIS satellite. Shows thermal patterns across the landscape.',
        'items': [
            {'color': '#313695', 'label': 'Very cold', 'value': '< 10°C'},
            {'color': '#4575b4', 'label': 'Cold', 'value': '10 - 18°C'},
            {'color': '#74add1', 'label': 'Cool', 'value': '18 - 25°C'},
            {'color': '#fee090', 'label': 'Warm', 'value': '25 - 32°C'},
            {'color': '#f46d43', 'label': 'Hot', 'value': '32 - 40°C'},
            {'color': '#a50026', 'label': 'Very hot', 'value': '> 40°C'},
        ]
    },
    'land_cover': {
        'title': 'Land Cover Classification',
        'description': 'ESA WorldCover 10m land cover showing different surface types.',
        'items': [
            {'color': '#006400', 'label': 'Tree cover', 'value': '10'},
            {'color': '#ffbb22', 'label': 'Shrubland', 'value': '20'},
            {'color': '#ffff4c', 'label': 'Grassland', 'value': '30'},
            {'color': '#f096ff', 'label': 'Cropland', 'value': '40'},
            {'color': '#fa0000', 'label': 'Built-up', 'value': '50'},
            {'color': '#b4b4b4', 'label': 'Bare/sparse vegetation', 'value': '60'},
            {'color': '#f0f0f0', 'label': 'Snow and ice', 'value': '70'},
            {'color': '#0064c8', 'label': 'Water', 'value': '80'},
            {'color': '#0096a0', 'label': 'Wetland', 'value': '90'},
            {'color': '#00cf75', 'label': 'Mangroves', 'value': '95'},
        ]
    },
    'forest': {
        'title': 'Forest Cover Density',
        'description': 'Hansen Global Forest Change showing tree cover percentage from year 2000.',
        'items': [
            {'color': '#FFFFFF', 'label': 'No trees', 'value': '0%'},
            {'color': '#E8F5E9', 'label': 'Very sparse', 'value': '1 - 20%'},
            {'color': '#A5D6A7', 'label': 'Sparse', 'value': '20 - 40%'},
            {'color': '#66BB6A', 'label': 'Medium', 'value': '40 - 60%'},
            {'color': '#388E3C', 'label': 'Dense', 'value': '60 - 80%'},
            {'color': '#1B5E20', 'label': 'Very dense', 'value': '80 - 100%'},
        ]
    },
    'true_color': {
        'title': 'True Color Satellite Image',
        'description': 'Natural color composite from Sentinel-2 satellite showing the landscape as seen from space.',
        'items': []
    }
}


@router.get("/images", response_model=AllImagesResponse)
async def get_all_satellite_images(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    buffer_km: float = Query(5.0, ge=1, le=50, description="Buffer radius in km")
):
    """
    Get all satellite image URLs for a location.

    Returns URLs for:
    - True color (Sentinel-2 RGB)
    - NDVI (Vegetation health)
    - LST (Land Surface Temperature)
    - Land cover (ESA WorldCover)
    - Forest cover (Hansen GFC)
    """
    try:
        from app.services.satellite_imagery import get_satellite_images

        images = get_satellite_images(lat, lon, buffer_km)

        return AllImagesResponse(
            success=True,
            latitude=lat,
            longitude=lon,
            buffer_km=buffer_km,
            images=images
        )

    except Exception as e:
        return AllImagesResponse(
            success=False,
            latitude=lat,
            longitude=lon,
            buffer_km=buffer_km,
            images={},
            error=str(e)
        )


@router.get("/image", response_model=ImageResponse)
async def get_satellite_image(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    image_type: str = Query("ndvi", description="Image type: true_color, ndvi, lst, land_cover, forest"),
    buffer_km: float = Query(5.0, ge=1, le=50, description="Buffer radius in km"),
    dimensions: str = Query("512x512", description="Image dimensions (WxH)")
):
    """
    Get a specific satellite image URL for a location.

    Image types:
    - true_color: Sentinel-2 RGB composite
    - ndvi: Normalized Difference Vegetation Index
    - lst: Land Surface Temperature heatmap
    - land_cover: ESA WorldCover classification
    - forest: Hansen tree cover density
    """
    valid_types = ['true_color', 'ndvi', 'lst', 'land_cover', 'forest']

    if image_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image type. Must be one of: {', '.join(valid_types)}"
        )

    try:
        from app.services.satellite_imagery import get_image_generator

        generator = get_image_generator()

        # Get the appropriate image URL
        if image_type == 'true_color':
            url = generator.get_true_color_url(lat, lon, buffer_km, dimensions)
        elif image_type == 'ndvi':
            url = generator.get_ndvi_url(lat, lon, buffer_km, dimensions)
        elif image_type == 'lst':
            url = generator.get_lst_url(lat, lon, buffer_km, dimensions)
        elif image_type == 'land_cover':
            url = generator.get_land_cover_url(lat, lon, buffer_km, dimensions)
        elif image_type == 'forest':
            url = generator.get_forest_cover_url(lat, lon, buffer_km, dimensions)
        else:
            url = None

        return ImageResponse(
            success=url is not None,
            image_type=image_type,
            url=url,
            error="Image not available" if url is None else None
        )

    except Exception as e:
        return ImageResponse(
            success=False,
            image_type=image_type,
            error=str(e)
        )


@router.get("/legend", response_model=LegendResponse)
async def get_image_legend(
    image_type: str = Query("ndvi", description="Image type: ndvi, lst, land_cover, forest, true_color")
):
    """
    Get the color legend for a satellite image type.

    Returns color palette with labels and value ranges.
    """
    if image_type not in LEGENDS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image type. Must be one of: {', '.join(LEGENDS.keys())}"
        )

    legend_data = LEGENDS[image_type]

    return LegendResponse(
        image_type=image_type,
        title=legend_data['title'],
        description=legend_data['description'],
        legend=[
            LegendItem(
                color=item['color'],
                label=item['label'],
                value=item.get('value')
            )
            for item in legend_data['items']
        ]
    )


@router.get("/types")
async def get_available_image_types():
    """
    Get list of available satellite image types with descriptions.
    """
    return {
        "image_types": [
            {
                "id": "true_color",
                "name": "True Color",
                "description": "Natural color satellite image from Sentinel-2",
                "source": "Sentinel-2",
                "resolution": "10m"
            },
            {
                "id": "ndvi",
                "name": "Vegetation (NDVI)",
                "description": "Plant health index - green indicates healthy vegetation",
                "source": "Sentinel-2",
                "resolution": "10m"
            },
            {
                "id": "lst",
                "name": "Temperature (LST)",
                "description": "Land surface temperature heatmap",
                "source": "MODIS",
                "resolution": "1km"
            },
            {
                "id": "land_cover",
                "name": "Land Cover",
                "description": "Land use classification showing different surface types",
                "source": "ESA WorldCover",
                "resolution": "10m"
            },
            {
                "id": "forest",
                "name": "Forest Cover",
                "description": "Tree cover density percentage",
                "source": "Hansen GFC",
                "resolution": "30m"
            }
        ]
    }
