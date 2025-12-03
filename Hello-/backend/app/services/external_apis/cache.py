"""
TTL Cache for External API responses.

Similar to SensorCache but optimized for external API data with:
- Shorter TTLs (real-time data)
- Hit/miss statistics
- Key-based retrieval
"""

import time
import hashlib
from typing import Dict, Any, Optional


class ExternalAPICache:
    """TTL cache for external API responses."""

    def __init__(self, ttl_seconds: int = 300):  # 5 minutes default
        self.ttl = ttl_seconds
        self._cache: Dict[str, Any] = {}
        self._timestamps: Dict[str, float] = {}
        self._hit_count = 0
        self._miss_count = 0

    def make_key(self, *args) -> str:
        """
        Create a cache key from arguments.

        Args:
            *args: Values to combine into a key

        Returns:
            MD5 hash key (16 chars)
        """
        key_data = ":".join(str(a) for a in args)
        return hashlib.md5(key_data.encode()).hexdigest()[:16]

    def get(self, key: str) -> Optional[Any]:
        """
        Get cached value if not expired.

        Args:
            key: Cache key

        Returns:
            Cached value or None if expired/missing
        """
        if key in self._cache:
            if time.time() - self._timestamps.get(key, 0) < self.ttl:
                self._hit_count += 1
                return self._cache[key]
            else:
                # Expired, remove from cache
                del self._cache[key]
                del self._timestamps[key]

        self._miss_count += 1
        return None

    def set(self, key: str, value: Any) -> None:
        """
        Set cache value with current timestamp.

        Args:
            key: Cache key
            value: Value to cache
        """
        self._cache[key] = value
        self._timestamps[key] = time.time()

    def clear(self, key: Optional[str] = None) -> None:
        """
        Clear specific key or all cache.

        Args:
            key: Specific key to clear, or None for all
        """
        if key:
            self._cache.pop(key, None)
            self._timestamps.pop(key, None)
        else:
            self._cache.clear()
            self._timestamps.clear()

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dict with cache size, hit rate, etc.
        """
        total = self._hit_count + self._miss_count
        hit_rate = self._hit_count / total if total > 0 else 0

        return {
            "cache_size": len(self._cache),
            "hit_count": self._hit_count,
            "miss_count": self._miss_count,
            "hit_rate": round(hit_rate, 3),
            "ttl_seconds": self.ttl,
            "cached_keys": list(self._cache.keys())
        }

    def is_cached(self, key: str) -> bool:
        """
        Check if key exists and is not expired.

        Args:
            key: Cache key

        Returns:
            True if cached and valid
        """
        if key not in self._cache:
            return False
        return time.time() - self._timestamps.get(key, 0) < self.ttl


# Global cache instances for different TTLs
air_quality_cache = ExternalAPICache(ttl_seconds=600)  # 10 minutes
weather_cache = ExternalAPICache(ttl_seconds=600)  # 10 minutes
