"""
Query Caching Module.
Provides in-memory and optional disk caching for query results.
"""

import json
import hashlib
import time
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class QueryCache:
    """
    Simple query result cache with TTL support.

    Usage:
        cache = QueryCache(ttl_seconds=3600)
        result = cache.get(lat, lon, mode)
        if result is None:
            result = engine.query(lat, lon, mode)
            cache.set(lat, lon, mode, result)
    """

    def __init__(
        self,
        ttl_seconds: int = 3600,
        max_size: int = 1000,
        cache_dir: Optional[Path] = None
    ):
        """
        Initialize cache.

        Args:
            ttl_seconds: Time-to-live in seconds
            max_size: Maximum number of cached entries
            cache_dir: Optional directory for disk caching
        """
        self.ttl = ttl_seconds
        self.max_size = max_size
        self.cache_dir = cache_dir
        self._memory_cache: Dict[str, Dict] = {}
        self._access_times: Dict[str, float] = {}

        if cache_dir:
            cache_dir.mkdir(parents=True, exist_ok=True)

    def _make_key(
        self,
        lat: float,
        lon: float,
        mode: str,
        temporal: str = "latest",
        buffer_radius: int = 500
    ) -> str:
        """Generate cache key from query parameters."""
        # Round coordinates to reduce cache misses for nearby points
        lat_round = round(lat, 3)
        lon_round = round(lon, 3)

        key_data = f"{lat_round}:{lon_round}:{mode}:{temporal}:{buffer_radius}"
        return hashlib.md5(key_data.encode()).hexdigest()

    def get(
        self,
        lat: float,
        lon: float,
        mode: str,
        temporal: str = "latest",
        buffer_radius: int = 500
    ) -> Optional[Dict[str, Any]]:
        """
        Get cached result if available and not expired.

        Args:
            lat: Latitude
            lon: Longitude
            mode: Query mode
            temporal: Temporal mode
            buffer_radius: Buffer radius

        Returns:
            Cached result or None
        """
        key = self._make_key(lat, lon, mode, temporal, buffer_radius)

        # Check memory cache
        if key in self._memory_cache:
            entry = self._memory_cache[key]
            if time.time() - entry["timestamp"] < self.ttl:
                self._access_times[key] = time.time()
                return entry["data"]
            else:
                # Expired
                del self._memory_cache[key]
                del self._access_times[key]

        # Check disk cache
        if self.cache_dir:
            cache_file = self.cache_dir / f"{key}.json"
            if cache_file.exists():
                try:
                    with open(cache_file, "r") as f:
                        entry = json.load(f)
                    if time.time() - entry["timestamp"] < self.ttl:
                        # Promote to memory cache
                        self._memory_cache[key] = entry
                        self._access_times[key] = time.time()
                        return entry["data"]
                    else:
                        cache_file.unlink()  # Remove expired
                except Exception:
                    pass

        return None

    def set(
        self,
        lat: float,
        lon: float,
        mode: str,
        data: Dict[str, Any],
        temporal: str = "latest",
        buffer_radius: int = 500
    ):
        """
        Cache a query result.

        Args:
            lat: Latitude
            lon: Longitude
            mode: Query mode
            data: Query result to cache
            temporal: Temporal mode
            buffer_radius: Buffer radius
        """
        key = self._make_key(lat, lon, mode, temporal, buffer_radius)

        entry = {
            "timestamp": time.time(),
            "lat": lat,
            "lon": lon,
            "mode": mode,
            "data": data
        }

        # Evict if cache is full
        if len(self._memory_cache) >= self.max_size:
            self._evict_oldest()

        # Store in memory
        self._memory_cache[key] = entry
        self._access_times[key] = time.time()

        # Store on disk if configured
        if self.cache_dir:
            cache_file = self.cache_dir / f"{key}.json"
            try:
                with open(cache_file, "w") as f:
                    json.dump(entry, f)
            except Exception:
                pass

    def clear(self):
        """Clear all cached entries."""
        self._memory_cache.clear()
        self._access_times.clear()

        if self.cache_dir:
            for cache_file in self.cache_dir.glob("*.json"):
                try:
                    cache_file.unlink()
                except Exception:
                    pass

    def _evict_oldest(self):
        """Evict the least recently accessed entry."""
        if not self._access_times:
            return

        oldest_key = min(self._access_times, key=self._access_times.get)

        if oldest_key in self._memory_cache:
            del self._memory_cache[oldest_key]
        if oldest_key in self._access_times:
            del self._access_times[oldest_key]

    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "entries": len(self._memory_cache),
            "max_size": self.max_size,
            "ttl_seconds": self.ttl,
            "disk_enabled": self.cache_dir is not None
        }
