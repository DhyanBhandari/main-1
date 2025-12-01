"""
Response Schema Definitions.
Provides structured response classes and validation.
"""

from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
from datetime import datetime
import json


@dataclass
class MetricResponse:
    """Single metric response."""
    value: Optional[float]
    unit: str
    quality: str
    description: str = ""
    source: str = ""
    resolution: str = ""
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class PillarResponse:
    """Single pillar response."""
    pillar_id: str
    pillar_name: str
    pillar_color: str
    metrics: Dict[str, MetricResponse]
    score: Optional[int] = None
    data_date: str = ""
    mode: str = "comprehensive"
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {
            "pillar_id": self.pillar_id,
            "pillar_name": self.pillar_name,
            "pillar_color": self.pillar_color,
            "metrics": {k: v.to_dict() for k, v in self.metrics.items()},
            "data_date": self.data_date,
            "mode": self.mode
        }
        if self.score is not None:
            result["score"] = self.score
        if self.error:
            result["error"] = self.error
        return result


@dataclass
class QueryResponse:
    """Complete query response."""
    latitude: float
    longitude: float
    timestamp: str
    mode: str
    temporal: str
    buffer_radius_m: int
    date_range: Dict[str, str]
    pillars: Dict[str, PillarResponse]
    summary: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "query": {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "timestamp": self.timestamp,
                "mode": self.mode,
                "temporal": self.temporal,
                "buffer_radius_m": self.buffer_radius_m,
                "date_range": self.date_range
            },
            "pillars": {k: v.to_dict() for k, v in self.pillars.items()},
            "summary": self.summary,
            "time_series": {
                "enabled": self.temporal != "latest",
                "mode": self.temporal
            }
        }

    def to_json(self, indent: int = 2) -> str:
        """Convert to JSON string."""
        return json.dumps(self.to_dict(), indent=indent)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "QueryResponse":
        """Create from dictionary."""
        query = data.get("query", {})

        # Parse pillars
        pillars = {}
        for key, pillar_data in data.get("pillars", {}).items():
            metrics = {}
            for metric_key, metric_data in pillar_data.get("metrics", {}).items():
                metrics[metric_key] = MetricResponse(
                    value=metric_data.get("value"),
                    unit=metric_data.get("unit", ""),
                    quality=metric_data.get("quality", "unknown"),
                    description=metric_data.get("description", ""),
                    source=metric_data.get("source", ""),
                    resolution=metric_data.get("resolution", ""),
                    error=metric_data.get("error")
                )

            pillars[key] = PillarResponse(
                pillar_id=pillar_data.get("pillar_id", key[0]),
                pillar_name=pillar_data.get("pillar_name", ""),
                pillar_color=pillar_data.get("pillar_color", "#000000"),
                metrics=metrics,
                score=pillar_data.get("score"),
                data_date=pillar_data.get("data_date", ""),
                mode=pillar_data.get("mode", "comprehensive"),
                error=pillar_data.get("error")
            )

        return cls(
            latitude=query.get("latitude", 0),
            longitude=query.get("longitude", 0),
            timestamp=query.get("timestamp", datetime.now().isoformat()),
            mode=query.get("mode", "comprehensive"),
            temporal=query.get("temporal", "latest"),
            buffer_radius_m=query.get("buffer_radius_m", 500),
            date_range=query.get("date_range", {}),
            pillars=pillars,
            summary=data.get("summary", {})
        )


def create_example_response() -> QueryResponse:
    """Create an example response for documentation."""
    return QueryResponse(
        latitude=28.6139,
        longitude=77.2090,
        timestamp=datetime.now().isoformat(),
        mode="comprehensive",
        temporal="latest",
        buffer_radius_m=500,
        date_range={"start": "2025-10-28", "end": "2025-11-27"},
        pillars={
            "A_atmospheric": PillarResponse(
                pillar_id="A",
                pillar_name="Atmospheric",
                pillar_color="#3498db",
                metrics={
                    "aod": MetricResponse(
                        value=0.45,
                        unit="dimensionless",
                        quality="good",
                        description="Aerosol Optical Depth"
                    ),
                    "aqi": MetricResponse(
                        value=78,
                        unit="index",
                        quality="good",
                        description="Air Quality Index"
                    )
                },
                score=62,
                data_date="2025-11-20"
            )
        },
        summary={
            "overall_score": 58,
            "pillar_scores": {"A": 62, "B": 75, "C": 45, "D": 55, "E": 52},
            "data_completeness": 0.92,
            "quality_flags": ["aod_high"]
        }
    )
