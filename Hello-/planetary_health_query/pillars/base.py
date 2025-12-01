"""
Base Pillar Class for Earth Engine Queries.
All pillar implementations inherit from this class.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import ee


class BasePillar(ABC):
    """Abstract base class for planetary health pillars."""

    # Override in subclasses
    PILLAR_ID: str = ""
    PILLAR_NAME: str = ""
    PILLAR_COLOR: str = "#000000"

    def __init__(self):
        """Initialize the pillar query handler."""
        self._cache = {}

    @abstractmethod
    def get_simple_metrics(self) -> List[str]:
        """Return list of metric names for simple mode (2-3 key metrics)."""
        pass

    @abstractmethod
    def get_comprehensive_metrics(self) -> List[str]:
        """Return list of metric names for comprehensive mode (4-5 metrics)."""
        pass

    @abstractmethod
    def query_metrics(
        self,
        point: ee.Geometry.Point,
        buffer_radius: int,
        date_range: Tuple[str, str],
        metrics: List[str]
    ) -> Dict[str, Any]:
        """
        Query specific metrics for a location.

        Args:
            point: Earth Engine Point geometry
            buffer_radius: Buffer radius in meters
            date_range: Tuple of (start_date, end_date) in YYYY-MM-DD format
            metrics: List of metric names to query

        Returns:
            Dict with metric values and metadata
        """
        pass

    def query(
        self,
        lat: float,
        lon: float,
        mode: str = "comprehensive",
        buffer_radius: int = 500,
        date_range: Optional[Tuple[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Query all metrics for this pillar at a location.

        Args:
            lat: Latitude (-90 to 90)
            lon: Longitude (-180 to 180)
            mode: "simple" or "comprehensive"
            buffer_radius: Buffer radius in meters for spatial averaging
            date_range: Optional (start_date, end_date). Defaults to last 30 days.

        Returns:
            Dict containing all metric values and pillar metadata
        """
        # Validate coordinates
        if not -90 <= lat <= 90:
            raise ValueError(f"Latitude must be between -90 and 90, got {lat}")
        if not -180 <= lon <= 180:
            raise ValueError(f"Longitude must be between -180 and 180, got {lon}")

        # Create point geometry
        point = ee.Geometry.Point([lon, lat])

        # Get date range
        if date_range is None:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            date_range = (
                start_date.strftime("%Y-%m-%d"),
                end_date.strftime("%Y-%m-%d")
            )

        # Get metrics based on mode
        if mode == "simple":
            metrics = self.get_simple_metrics()
        else:
            metrics = self.get_comprehensive_metrics()

        # Query metrics
        result = self.query_metrics(point, buffer_radius, date_range, metrics)

        # Add pillar metadata
        result["pillar_id"] = self.PILLAR_ID
        result["pillar_name"] = self.PILLAR_NAME
        result["pillar_color"] = self.PILLAR_COLOR
        result["mode"] = mode
        result["query_time"] = datetime.now().isoformat()

        return result

    def _create_buffered_region(
        self,
        point: ee.Geometry.Point,
        buffer_radius: int
    ) -> ee.Geometry:
        """Create a buffered region around a point."""
        return point.buffer(buffer_radius)

    def _get_date_filter(
        self,
        date_range: Tuple[str, str]
    ) -> ee.Filter:
        """Create a date filter for image collections."""
        return ee.Filter.date(date_range[0], date_range[1])

    def _reduce_region(
        self,
        image: ee.Image,
        region: ee.Geometry,
        scale: int,
        reducer: ee.Reducer = None
    ) -> Dict[str, Any]:
        """
        Reduce an image over a region.

        Args:
            image: Earth Engine Image
            region: Region geometry
            scale: Scale in meters
            reducer: Reducer to use (default: mean)

        Returns:
            Dict with reduced values
        """
        if reducer is None:
            reducer = ee.Reducer.mean()

        try:
            result = image.reduceRegion(
                reducer=reducer,
                geometry=region,
                scale=scale,
                maxPixels=1e9
            ).getInfo()
            return result
        except Exception as e:
            return {"error": str(e)}

    def _safe_get_value(
        self,
        data: Dict,
        band: str,
        scale_factor: float = 1.0,
        offset: float = 0.0
    ) -> Optional[float]:
        """
        Safely extract and scale a value from query results.

        Args:
            data: Dict containing query results
            band: Band name to extract
            scale_factor: Multiplicative scale factor
            offset: Additive offset

        Returns:
            Scaled value or None if not available
        """
        value = data.get(band)
        if value is None:
            return None
        try:
            return float(value) * scale_factor + offset
        except (TypeError, ValueError):
            return None

    def _assess_quality(self, value: Optional[float], metric: str) -> str:
        """
        Assess data quality for a metric value.

        Args:
            value: The metric value
            metric: Metric name

        Returns:
            Quality flag: "good", "moderate", "poor", or "unavailable"
        """
        if value is None:
            return "unavailable"

        # Basic quality assessment - override in subclasses for specific logic
        return "good"
