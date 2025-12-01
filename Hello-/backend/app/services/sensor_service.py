"""
Sensor Data Service - Firestore integration with 30-minute caching.

Provides cached access to indoor/outdoor sensor readings to minimize
Firestore API costs while maintaining real-time data freshness.
"""

import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from collections import defaultdict
import time

# In-memory cache implementation
class SensorCache:
    """Simple TTL cache for sensor data."""

    def __init__(self, ttl_seconds: int = 1800):  # 30 minutes default
        self.ttl = ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._timestamps: Dict[str, float] = {}

    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired."""
        if key in self._cache:
            if time.time() - self._timestamps.get(key, 0) < self.ttl:
                return self._cache[key]
            else:
                # Expired, remove from cache
                del self._cache[key]
                del self._timestamps[key]
        return None

    def set(self, key: str, value: Any) -> None:
        """Set cache value with current timestamp."""
        self._cache[key] = value
        self._timestamps[key] = time.time()

    def clear(self, key: Optional[str] = None) -> None:
        """Clear specific key or all cache."""
        if key:
            self._cache.pop(key, None)
            self._timestamps.pop(key, None)
        else:
            self._cache.clear()
            self._timestamps.clear()

    def get_cache_info(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "cached_keys": list(self._cache.keys()),
            "ttl_seconds": self.ttl,
            "cache_size": len(self._cache)
        }


# Global cache instance
sensor_cache = SensorCache(ttl_seconds=1800)  # 30 minutes

# Firestore client (initialized lazily)
_firestore_db = None


def get_firestore():
    """Get or initialize Firestore client."""
    global _firestore_db

    if _firestore_db is not None:
        return _firestore_db

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        # Check if already initialized
        try:
            firebase_admin.get_app()
        except ValueError:
            # Initialize with service account or default credentials
            service_account_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")

            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                # Try using service account JSON from environment
                service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
                if service_account_json:
                    import json
                    cred = credentials.Certificate(json.loads(service_account_json))
                    firebase_admin.initialize_app(cred)
                else:
                    # Use default credentials (works on GCP or with ADC)
                    firebase_admin.initialize_app()

        _firestore_db = firestore.client()
        print("Firestore initialized successfully!")
        return _firestore_db

    except ImportError:
        print("Warning: firebase-admin package not installed.")
        return None
    except Exception as e:
        print(f"Warning: Failed to initialize Firestore: {e}")
        return None


def _serialize_reading(doc) -> Dict[str, Any]:
    """Convert Firestore document to serializable dict."""
    data = doc.to_dict()

    # Convert timestamp fields to ISO strings
    if 'createdAt' in data and hasattr(data['createdAt'], 'isoformat'):
        data['createdAt'] = data['createdAt'].isoformat()
    elif 'createdAt' in data and hasattr(data['createdAt'], 'timestamp'):
        data['createdAt'] = datetime.fromtimestamp(data['createdAt'].timestamp()).isoformat()

    # Add document ID
    data['id'] = doc.id

    return data


async def get_latest_readings(sensor_type: str, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Get latest sensor readings with caching.

    Args:
        sensor_type: 'indoor' or 'outdoor'
        limit: Number of readings to fetch

    Returns:
        List of sensor readings sorted by time (newest first)
    """
    cache_key = f"readings_{sensor_type}_{limit}"

    # Check cache first
    cached = sensor_cache.get(cache_key)
    if cached is not None:
        print(f"Cache hit for {cache_key}")
        return cached

    print(f"Cache miss for {cache_key}, fetching from Firestore...")

    db = get_firestore()
    if db is None:
        return []

    try:
        collection_name = f"{sensor_type}_sensors"

        # Query Firestore
        docs = db.collection(collection_name) \
            .order_by('time', direction='DESCENDING') \
            .limit(limit) \
            .stream()

        readings = [_serialize_reading(doc) for doc in docs]

        # Cache the results
        sensor_cache.set(cache_key, readings)

        return readings

    except Exception as e:
        print(f"Error fetching sensor readings: {e}")
        return []


async def get_latest_reading(sensor_type: str) -> Optional[Dict[str, Any]]:
    """
    Get the most recent sensor reading.

    Args:
        sensor_type: 'indoor' or 'outdoor'

    Returns:
        Latest sensor reading or None
    """
    cache_key = f"latest_{sensor_type}"

    # Check cache first
    cached = sensor_cache.get(cache_key)
    if cached is not None:
        print(f"Cache hit for {cache_key}")
        return cached

    print(f"Cache miss for {cache_key}, fetching from Firestore...")

    db = get_firestore()
    if db is None:
        return None

    try:
        collection_name = f"{sensor_type}_sensors"

        docs = db.collection(collection_name) \
            .order_by('time', direction='DESCENDING') \
            .limit(1) \
            .stream()

        for doc in docs:
            reading = _serialize_reading(doc)
            sensor_cache.set(cache_key, reading)
            return reading

        return None

    except Exception as e:
        print(f"Error fetching latest reading: {e}")
        return None


async def get_daily_aggregates(sensor_type: str, days: int = 7) -> List[Dict[str, Any]]:
    """
    Get daily aggregated sensor data for charts.

    Args:
        sensor_type: 'indoor' or 'outdoor'
        days: Number of days to aggregate

    Returns:
        List of daily aggregates with avg values
    """
    cache_key = f"aggregates_{sensor_type}_{days}"

    # Check cache first
    cached = sensor_cache.get(cache_key)
    if cached is not None:
        print(f"Cache hit for {cache_key}")
        return cached

    print(f"Cache miss for {cache_key}, calculating aggregates...")

    db = get_firestore()
    if db is None:
        return []

    try:
        collection_name = f"{sensor_type}_sensors"

        # Calculate start date
        start_date = datetime.now() - timedelta(days=days)
        start_str = start_date.strftime('%Y-%m-%d')

        # Fetch readings from the past N days
        docs = db.collection(collection_name) \
            .order_by('time', direction='DESCENDING') \
            .stream()

        # Group by date and calculate averages
        daily_data = defaultdict(lambda: {
            'co2': [], 'temperature': [], 'humidity': [],
            'pressure': [], 'light': [], 'count': 0
        })

        for doc in docs:
            data = doc.to_dict()
            time_str = data.get('time', '')

            # Extract date portion
            if time_str:
                try:
                    date_str = time_str.split('T')[0] if 'T' in time_str else time_str[:10]

                    if date_str >= start_str:
                        daily_data[date_str]['co2'].append(data.get('co2', 0))
                        daily_data[date_str]['temperature'].append(data.get('temperature', 0))
                        daily_data[date_str]['humidity'].append(data.get('humidity', 0))
                        daily_data[date_str]['pressure'].append(data.get('pressure', 0))
                        daily_data[date_str]['light'].append(data.get('light', 0))
                        daily_data[date_str]['count'] += 1
                except (ValueError, IndexError):
                    continue

        # Calculate averages
        aggregates = []
        for date_str, values in sorted(daily_data.items()):
            if values['count'] > 0:
                aggregates.append({
                    'date': date_str,
                    'avgCo2': sum(values['co2']) / len(values['co2']) if values['co2'] else 0,
                    'avgTemperature': sum(values['temperature']) / len(values['temperature']) if values['temperature'] else 0,
                    'avgHumidity': sum(values['humidity']) / len(values['humidity']) if values['humidity'] else 0,
                    'avgPressure': sum(values['pressure']) / len(values['pressure']) if values['pressure'] else 0,
                    'avgLight': sum(values['light']) / len(values['light']) if values['light'] else 0,
                    'readingCount': values['count']
                })

        # Cache the results
        sensor_cache.set(cache_key, aggregates)

        return aggregates

    except Exception as e:
        print(f"Error calculating aggregates: {e}")
        return []


async def get_readings_by_date_range(
    sensor_type: str,
    start_date: str,
    end_date: str
) -> List[Dict[str, Any]]:
    """
    Get sensor readings within a date range.

    Args:
        sensor_type: 'indoor' or 'outdoor'
        start_date: Start date (ISO format)
        end_date: End date (ISO format)

    Returns:
        List of sensor readings
    """
    cache_key = f"range_{sensor_type}_{start_date}_{end_date}"

    # Check cache first
    cached = sensor_cache.get(cache_key)
    if cached is not None:
        return cached

    db = get_firestore()
    if db is None:
        return []

    try:
        collection_name = f"{sensor_type}_sensors"

        docs = db.collection(collection_name) \
            .where('time', '>=', start_date) \
            .where('time', '<=', end_date) \
            .order_by('time', direction='DESCENDING') \
            .stream()

        readings = [_serialize_reading(doc) for doc in docs]
        sensor_cache.set(cache_key, readings)

        return readings

    except Exception as e:
        print(f"Error fetching readings by date range: {e}")
        return []


def refresh_cache(sensor_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Force refresh of cached sensor data.

    Args:
        sensor_type: Optional specific type to refresh, or all if None

    Returns:
        Cache status info
    """
    if sensor_type:
        # Clear specific sensor type cache
        keys_to_clear = [
            f"readings_{sensor_type}_50",
            f"latest_{sensor_type}",
            f"aggregates_{sensor_type}_7"
        ]
        for key in keys_to_clear:
            sensor_cache.clear(key)
    else:
        sensor_cache.clear()

    return {
        "status": "cache_cleared",
        "sensor_type": sensor_type or "all",
        "cache_info": sensor_cache.get_cache_info()
    }


def get_cache_status() -> Dict[str, Any]:
    """Get current cache status."""
    return {
        "status": "active",
        "ttl_minutes": sensor_cache.ttl / 60,
        "cache_info": sensor_cache.get_cache_info()
    }
