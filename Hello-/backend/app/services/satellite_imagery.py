"""
Satellite Imagery Service.

Generates color-mapped satellite images from Google Earth Engine:
- True Color (Sentinel-2 RGB)
- NDVI Map (Vegetation health)
- LST Heatmap (Land Surface Temperature)
- Land Cover (ESA WorldCover)
- Forest Cover (Hansen Tree Cover)
"""

from typing import Dict, Any, Optional, Tuple
import ee
from datetime import datetime, timedelta


# Color palettes for different image types
COLOR_PALETTES = {
    'ndvi': [
        '#8B4513',  # Brown (-0.2 to 0)
        '#D2691E',  # Chocolate (0 to 0.2)
        '#FFD700',  # Gold (0.2 to 0.4)
        '#9ACD32',  # Yellow-green (0.4 to 0.6)
        '#228B22',  # Forest green (0.6 to 0.8)
        '#006400'   # Dark green (0.8 to 1.0)
    ],
    'lst': [
        '#313695',  # Dark blue (cold)
        '#4575b4',  # Blue
        '#74add1',  # Light blue
        '#fee090',  # Yellow
        '#f46d43',  # Orange
        '#a50026'   # Dark red (hot)
    ],
    'land_cover': {
        10: '#006400',  # Tree cover
        20: '#ffbb22',  # Shrubland
        30: '#ffff4c',  # Grassland
        40: '#f096ff',  # Cropland
        50: '#fa0000',  # Built-up
        60: '#b4b4b4',  # Bare/sparse vegetation
        70: '#f0f0f0',  # Snow and ice
        80: '#0064c8',  # Permanent water
        90: '#0096a0',  # Herbaceous wetland
        95: '#00cf75',  # Mangroves
        100: '#fae6a0'  # Moss and lichen
    },
    'forest': [
        '#FFFFFF',  # No tree cover (0%)
        '#E8F5E9',  # Very low (1-20%)
        '#A5D6A7',  # Low (20-40%)
        '#66BB6A',  # Medium (40-60%)
        '#388E3C',  # High (60-80%)
        '#1B5E20'   # Very high (80-100%)
    ],
    'soil_moisture': [
        '#8B0000',  # Very dry
        '#FF4500',  # Dry
        '#FFA500',  # Moderate
        '#FFFF00',  # Slightly moist
        '#90EE90',  # Moist
        '#006400'   # Very moist
    ]
}


class SatelliteImageGenerator:
    """Generate satellite imagery visualizations from Earth Engine."""

    def __init__(self):
        """Initialize the image generator."""
        self._initialized = False

    def _ensure_initialized(self):
        """Ensure Earth Engine is initialized."""
        if not self._initialized:
            try:
                # Check if already initialized
                ee.Number(1).getInfo()
                self._initialized = True
            except Exception:
                # Initialize with default project
                from app.services.earth_engine import initialize_ee
                initialize_ee()
                self._initialized = True

    def get_true_color_url(
        self,
        lat: float,
        lon: float,
        buffer_km: float = 5.0,
        dimensions: str = "512x512"
    ) -> Optional[str]:
        """
        Get true color satellite image URL.

        Args:
            lat: Latitude
            lon: Longitude
            buffer_km: Buffer radius in km
            dimensions: Image dimensions

        Returns:
            URL to thumbnail image or None
        """
        self._ensure_initialized()

        try:
            point = ee.Geometry.Point([lon, lat])
            region = point.buffer(buffer_km * 1000)

            # Get recent Sentinel-2 image with low cloud cover
            end_date = datetime.now()
            start_date = end_date - timedelta(days=60)

            s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(region) \
                .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)) \
                .sort('CLOUDY_PIXEL_PERCENTAGE') \
                .first()

            if s2 is None:
                return None

            # True color visualization (B4=Red, B3=Green, B2=Blue)
            vis_params = {
                'bands': ['B4', 'B3', 'B2'],
                'min': 0,
                'max': 3000,
                'gamma': 1.2
            }

            url = s2.getThumbURL({
                'region': region,
                'dimensions': dimensions,
                'format': 'png',
                **vis_params
            })

            return url

        except Exception as e:
            print(f"True color image error: {e}")
            return None

    def get_ndvi_url(
        self,
        lat: float,
        lon: float,
        buffer_km: float = 5.0,
        dimensions: str = "512x512"
    ) -> Optional[str]:
        """
        Get NDVI vegetation map URL.

        Args:
            lat: Latitude
            lon: Longitude
            buffer_km: Buffer radius in km
            dimensions: Image dimensions

        Returns:
            URL to NDVI thumbnail image or None
        """
        self._ensure_initialized()

        try:
            point = ee.Geometry.Point([lon, lat])
            region = point.buffer(buffer_km * 1000)

            # Get recent Sentinel-2 image
            end_date = datetime.now()
            start_date = end_date - timedelta(days=60)

            s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(region) \
                .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)) \
                .sort('CLOUDY_PIXEL_PERCENTAGE') \
                .first()

            if s2 is None:
                return None

            # Calculate NDVI
            ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI')

            # NDVI visualization
            url = ndvi.getThumbURL({
                'region': region,
                'dimensions': dimensions,
                'format': 'png',
                'min': -0.2,
                'max': 0.8,
                'palette': COLOR_PALETTES['ndvi']
            })

            return url

        except Exception as e:
            print(f"NDVI image error: {e}")
            return None

    def get_lst_url(
        self,
        lat: float,
        lon: float,
        buffer_km: float = 5.0,
        dimensions: str = "512x512"
    ) -> Optional[str]:
        """
        Get Land Surface Temperature heatmap URL.

        Args:
            lat: Latitude
            lon: Longitude
            buffer_km: Buffer radius in km
            dimensions: Image dimensions

        Returns:
            URL to LST thumbnail image or None
        """
        self._ensure_initialized()

        try:
            point = ee.Geometry.Point([lon, lat])
            region = point.buffer(buffer_km * 1000)

            # Get MODIS LST
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)

            modis_lst = ee.ImageCollection('MODIS/061/MOD11A2') \
                .filterBounds(region) \
                .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
                .select('LST_Day_1km') \
                .mean()

            # Convert from Kelvin to Celsius
            lst_celsius = modis_lst.multiply(0.02).subtract(273.15)

            # LST visualization
            url = lst_celsius.getThumbURL({
                'region': region,
                'dimensions': dimensions,
                'format': 'png',
                'min': 0,
                'max': 45,
                'palette': COLOR_PALETTES['lst']
            })

            return url

        except Exception as e:
            print(f"LST image error: {e}")
            return None

    def get_land_cover_url(
        self,
        lat: float,
        lon: float,
        buffer_km: float = 5.0,
        dimensions: str = "512x512"
    ) -> Optional[str]:
        """
        Get ESA WorldCover land cover map URL.

        Args:
            lat: Latitude
            lon: Longitude
            buffer_km: Buffer radius in km
            dimensions: Image dimensions

        Returns:
            URL to land cover thumbnail image or None
        """
        self._ensure_initialized()

        try:
            point = ee.Geometry.Point([lon, lat])
            region = point.buffer(buffer_km * 1000)

            # Get WorldCover
            worldcover = ee.ImageCollection('ESA/WorldCover/v200') \
                .filterBounds(region) \
                .first() \
                .select('Map')

            if worldcover is None:
                return None

            # Create palette from land cover classes
            palette = [
                COLOR_PALETTES['land_cover'].get(i, '#000000')
                for i in [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]
            ]

            url = worldcover.getThumbURL({
                'region': region,
                'dimensions': dimensions,
                'format': 'png',
                'min': 10,
                'max': 100,
                'palette': palette
            })

            return url

        except Exception as e:
            print(f"Land cover image error: {e}")
            return None

    def get_forest_cover_url(
        self,
        lat: float,
        lon: float,
        buffer_km: float = 5.0,
        dimensions: str = "512x512"
    ) -> Optional[str]:
        """
        Get Hansen forest cover map URL.

        Args:
            lat: Latitude
            lon: Longitude
            buffer_km: Buffer radius in km
            dimensions: Image dimensions

        Returns:
            URL to forest cover thumbnail image or None
        """
        self._ensure_initialized()

        try:
            point = ee.Geometry.Point([lon, lat])
            region = point.buffer(buffer_km * 1000)

            # Get Hansen Global Forest Change
            hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11')
            tree_cover = hansen.select('treecover2000')

            url = tree_cover.getThumbURL({
                'region': region,
                'dimensions': dimensions,
                'format': 'png',
                'min': 0,
                'max': 100,
                'palette': COLOR_PALETTES['forest']
            })

            return url

        except Exception as e:
            print(f"Forest cover image error: {e}")
            return None

    def get_all_image_urls(
        self,
        lat: float,
        lon: float,
        buffer_km: float = 5.0,
        dimensions: str = "512x512"
    ) -> Dict[str, Optional[str]]:
        """
        Get all satellite image URLs for a location.

        Args:
            lat: Latitude
            lon: Longitude
            buffer_km: Buffer radius in km
            dimensions: Image dimensions

        Returns:
            Dict with image type keys and URL values
        """
        return {
            'true_color': self.get_true_color_url(lat, lon, buffer_km, dimensions),
            'ndvi': self.get_ndvi_url(lat, lon, buffer_km, dimensions),
            'lst': self.get_lst_url(lat, lon, buffer_km, dimensions),
            'land_cover': self.get_land_cover_url(lat, lon, buffer_km, dimensions),
            'forest': self.get_forest_cover_url(lat, lon, buffer_km, dimensions)
        }


# Global instance
_image_generator: Optional[SatelliteImageGenerator] = None


def get_image_generator() -> SatelliteImageGenerator:
    """Get or create satellite image generator instance."""
    global _image_generator
    if _image_generator is None:
        _image_generator = SatelliteImageGenerator()
    return _image_generator


# Convenience functions
def get_satellite_images(lat: float, lon: float, buffer_km: float = 5.0) -> Dict[str, Optional[str]]:
    """Quick access to all satellite images for a location."""
    return get_image_generator().get_all_image_urls(lat, lon, buffer_km)


def get_ndvi_image(lat: float, lon: float, buffer_km: float = 5.0) -> Optional[str]:
    """Quick access to NDVI image."""
    return get_image_generator().get_ndvi_url(lat, lon, buffer_km)


def get_true_color_image(lat: float, lon: float, buffer_km: float = 5.0) -> Optional[str]:
    """Quick access to true color image."""
    return get_image_generator().get_true_color_url(lat, lon, buffer_km)
