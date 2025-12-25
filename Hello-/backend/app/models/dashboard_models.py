"""
Dashboard SQLite Database Models.

Provides async database access for storing and retrieving:
- Weather readings (from Open-Meteo)
- Air quality readings (from Open-Meteo)
- Satellite data snapshots (from GEE)
- Historical trends
"""

import aiosqlite
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path

# Database path - in backend directory
DATABASE_PATH = Path(__file__).parent.parent.parent / "dashboard.db"


class DashboardDatabase:
    """Async SQLite database manager for dashboard data."""

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DATABASE_PATH
        self._initialized = False

    async def init_db(self) -> None:
        """Initialize database with required tables."""
        async with aiosqlite.connect(self.db_path) as db:
            # Weather readings table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS weather_readings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    source TEXT DEFAULT 'open_meteo',
                    temperature REAL,
                    feels_like REAL,
                    humidity REAL,
                    pressure REAL,
                    wind_speed REAL,
                    wind_direction REAL,
                    wind_gusts REAL,
                    weather_code INTEGER,
                    weather_description TEXT,
                    cloud_cover REAL,
                    precipitation REAL,
                    is_day INTEGER,
                    raw_data TEXT
                )
            """)

            # Air quality readings table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS air_quality_readings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    source TEXT DEFAULT 'open_meteo',
                    us_aqi REAL,
                    european_aqi REAL,
                    aqi_category TEXT,
                    pm25 REAL,
                    pm10 REAL,
                    ozone REAL,
                    carbon_monoxide REAL,
                    nitrogen_dioxide REAL,
                    sulphur_dioxide REAL,
                    uv_index REAL,
                    uv_category TEXT,
                    raw_data TEXT
                )
            """)

            # Satellite data snapshots table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS satellite_readings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    query_mode TEXT DEFAULT 'comprehensive',
                    overall_score INTEGER,
                    pillar_a_score INTEGER,
                    pillar_b_score INTEGER,
                    pillar_c_score INTEGER,
                    pillar_d_score INTEGER,
                    pillar_e_score INTEGER,
                    ndvi REAL,
                    evi REAL,
                    tree_cover REAL,
                    soil_moisture REAL,
                    lst REAL,
                    aod REAL,
                    population REAL,
                    nightlights REAL,
                    human_modification REAL,
                    ecosystem_type TEXT,
                    raw_data TEXT
                )
            """)

            # Dashboard locations (tracked locations)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS dashboard_locations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    is_active INTEGER DEFAULT 1,
                    poll_interval_seconds INTEGER DEFAULT 300,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Create indexes for efficient time-based queries
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_weather_timestamp
                ON weather_readings(timestamp)
            """)
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_weather_location
                ON weather_readings(latitude, longitude)
            """)
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_aqi_timestamp
                ON air_quality_readings(timestamp)
            """)
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_aqi_location
                ON air_quality_readings(latitude, longitude)
            """)
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_satellite_timestamp
                ON satellite_readings(timestamp)
            """)
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_satellite_location
                ON satellite_readings(latitude, longitude)
            """)

            await db.commit()
            self._initialized = True
            print(f"Dashboard database initialized at: {self.db_path}")

    async def ensure_initialized(self) -> None:
        """Ensure database is initialized."""
        if not self._initialized:
            await self.init_db()

    # ==================== WEATHER OPERATIONS ====================

    async def store_weather_reading(
        self,
        lat: float,
        lon: float,
        weather_data: Dict[str, Any]
    ) -> int:
        """
        Store a weather reading.

        Args:
            lat: Latitude
            lon: Longitude
            weather_data: Normalized weather data from Open-Meteo

        Returns:
            Inserted row ID
        """
        await self.ensure_initialized()

        current = weather_data.get("current", {})
        temp = current.get("temperature", {})
        wind = current.get("wind", {})
        weather = current.get("weather", {})
        precip = current.get("precipitation", {})
        cloud = current.get("cloud_cover", {})
        pressure = current.get("pressure", {})

        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                INSERT INTO weather_readings (
                    latitude, longitude, source,
                    temperature, feels_like, humidity, pressure,
                    wind_speed, wind_direction, wind_gusts,
                    weather_code, weather_description, cloud_cover,
                    precipitation, is_day, raw_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                lat, lon, weather_data.get("source", "open_meteo"),
                temp.get("value"), temp.get("feels_like"),
                current.get("humidity", {}).get("value"),
                pressure.get("sea_level"),
                wind.get("speed"), wind.get("direction"), wind.get("gusts"),
                weather.get("code"), weather.get("description"),
                cloud.get("value"),
                precip.get("value"),
                1 if weather.get("is_day") else 0,
                json.dumps(weather_data)
            ))
            await db.commit()
            return cursor.lastrowid

    async def get_weather_history(
        self,
        lat: float,
        lon: float,
        hours: int = 24,
        tolerance: float = 0.01
    ) -> List[Dict[str, Any]]:
        """
        Get historical weather readings.

        Args:
            lat: Latitude
            lon: Longitude
            hours: Hours of history to retrieve
            tolerance: Coordinate tolerance for matching

        Returns:
            List of weather readings
        """
        await self.ensure_initialized()

        since = datetime.now() - timedelta(hours=hours)

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT * FROM weather_readings
                WHERE latitude BETWEEN ? AND ?
                AND longitude BETWEEN ? AND ?
                AND timestamp >= ?
                ORDER BY timestamp DESC
            """, (
                lat - tolerance, lat + tolerance,
                lon - tolerance, lon + tolerance,
                since.isoformat()
            ))
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    # ==================== AIR QUALITY OPERATIONS ====================

    async def store_aqi_reading(
        self,
        lat: float,
        lon: float,
        aqi_data: Dict[str, Any]
    ) -> int:
        """
        Store an air quality reading.

        Args:
            lat: Latitude
            lon: Longitude
            aqi_data: Normalized AQI data from Open-Meteo

        Returns:
            Inserted row ID
        """
        await self.ensure_initialized()

        aqi = aqi_data.get("aqi", {})
        pollutants = aqi_data.get("pollutants", {})
        uv = aqi_data.get("uv_index", {})

        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                INSERT INTO air_quality_readings (
                    latitude, longitude, source,
                    us_aqi, european_aqi, aqi_category,
                    pm25, pm10, ozone, carbon_monoxide, nitrogen_dioxide, sulphur_dioxide,
                    uv_index, uv_category, raw_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                lat, lon, aqi_data.get("source", "open_meteo"),
                aqi.get("us_aqi"), aqi.get("european_aqi"), aqi.get("category"),
                pollutants.get("pm2_5", {}).get("value"),
                pollutants.get("pm10", {}).get("value"),
                pollutants.get("ozone", {}).get("value"),
                pollutants.get("carbon_monoxide", {}).get("value"),
                pollutants.get("nitrogen_dioxide", {}).get("value"),
                pollutants.get("sulphur_dioxide", {}).get("value"),
                uv.get("value"), uv.get("category"),
                json.dumps(aqi_data)
            ))
            await db.commit()
            return cursor.lastrowid

    async def get_aqi_history(
        self,
        lat: float,
        lon: float,
        hours: int = 24,
        tolerance: float = 0.01
    ) -> List[Dict[str, Any]]:
        """
        Get historical air quality readings.

        Args:
            lat: Latitude
            lon: Longitude
            hours: Hours of history to retrieve
            tolerance: Coordinate tolerance for matching

        Returns:
            List of AQI readings
        """
        await self.ensure_initialized()

        since = datetime.now() - timedelta(hours=hours)

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT * FROM air_quality_readings
                WHERE latitude BETWEEN ? AND ?
                AND longitude BETWEEN ? AND ?
                AND timestamp >= ?
                ORDER BY timestamp DESC
            """, (
                lat - tolerance, lat + tolerance,
                lon - tolerance, lon + tolerance,
                since.isoformat()
            ))
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    # ==================== SATELLITE OPERATIONS ====================

    async def store_satellite_reading(
        self,
        lat: float,
        lon: float,
        satellite_data: Dict[str, Any]
    ) -> int:
        """
        Store a satellite data snapshot.

        Args:
            lat: Latitude
            lon: Longitude
            satellite_data: PHI query result from GEE

        Returns:
            Inserted row ID
        """
        await self.ensure_initialized()

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

        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                INSERT INTO satellite_readings (
                    latitude, longitude, query_mode,
                    overall_score, pillar_a_score, pillar_b_score,
                    pillar_c_score, pillar_d_score, pillar_e_score,
                    ndvi, evi, tree_cover, soil_moisture, lst, aod,
                    population, nightlights, human_modification,
                    ecosystem_type, raw_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                lat, lon, satellite_data.get("query", {}).get("mode", "comprehensive"),
                summary.get("overall_score"),
                pillar_scores.get("A"), pillar_scores.get("B"),
                pillar_scores.get("C"), pillar_scores.get("D"), pillar_scores.get("E"),
                ndvi, evi, tree_cover, soil_moisture, lst, aod,
                population, nightlights, human_mod,
                summary.get("ecosystem_type"),
                json.dumps(satellite_data)
            ))
            await db.commit()
            return cursor.lastrowid

    async def get_satellite_history(
        self,
        lat: float,
        lon: float,
        days: int = 7,
        tolerance: float = 0.01
    ) -> List[Dict[str, Any]]:
        """
        Get historical satellite readings.

        Args:
            lat: Latitude
            lon: Longitude
            days: Days of history to retrieve
            tolerance: Coordinate tolerance for matching

        Returns:
            List of satellite readings
        """
        await self.ensure_initialized()

        since = datetime.now() - timedelta(days=days)

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT * FROM satellite_readings
                WHERE latitude BETWEEN ? AND ?
                AND longitude BETWEEN ? AND ?
                AND timestamp >= ?
                ORDER BY timestamp DESC
            """, (
                lat - tolerance, lat + tolerance,
                lon - tolerance, lon + tolerance,
                since.isoformat()
            ))
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_latest_satellite(
        self,
        lat: float,
        lon: float,
        tolerance: float = 0.01
    ) -> Optional[Dict[str, Any]]:
        """Get the most recent satellite reading for a location."""
        await self.ensure_initialized()

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT * FROM satellite_readings
                WHERE latitude BETWEEN ? AND ?
                AND longitude BETWEEN ? AND ?
                ORDER BY timestamp DESC
                LIMIT 1
            """, (
                lat - tolerance, lat + tolerance,
                lon - tolerance, lon + tolerance
            ))
            row = await cursor.fetchone()
            return dict(row) if row else None

    # ==================== LOCATION OPERATIONS ====================

    async def add_location(
        self,
        name: str,
        lat: float,
        lon: float,
        poll_interval: int = 300
    ) -> int:
        """Add a location to track."""
        await self.ensure_initialized()

        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                INSERT INTO dashboard_locations (name, latitude, longitude, poll_interval_seconds)
                VALUES (?, ?, ?, ?)
            """, (name, lat, lon, poll_interval))
            await db.commit()
            return cursor.lastrowid

    async def get_active_locations(self) -> List[Dict[str, Any]]:
        """Get all active locations being tracked."""
        await self.ensure_initialized()

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT * FROM dashboard_locations
                WHERE is_active = 1
            """)
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    # ==================== CLEANUP OPERATIONS ====================

    async def cleanup_old_data(self, days_to_keep: int = 30) -> Dict[str, int]:
        """
        Remove data older than specified days.

        Args:
            days_to_keep: Number of days of data to retain

        Returns:
            Dict with counts of deleted rows per table
        """
        await self.ensure_initialized()

        cutoff = datetime.now() - timedelta(days=days_to_keep)
        deleted = {}

        async with aiosqlite.connect(self.db_path) as db:
            for table in ["weather_readings", "air_quality_readings", "satellite_readings"]:
                cursor = await db.execute(f"""
                    DELETE FROM {table} WHERE timestamp < ?
                """, (cutoff.isoformat(),))
                deleted[table] = cursor.rowcount

            await db.commit()

        return deleted

    async def get_db_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        await self.ensure_initialized()

        stats = {}

        async with aiosqlite.connect(self.db_path) as db:
            for table in ["weather_readings", "air_quality_readings", "satellite_readings", "dashboard_locations"]:
                cursor = await db.execute(f"SELECT COUNT(*) FROM {table}")
                row = await cursor.fetchone()
                stats[f"{table}_count"] = row[0] if row else 0

        stats["db_path"] = str(self.db_path)
        stats["initialized"] = self._initialized

        return stats


# Singleton instance
_dashboard_db: Optional[DashboardDatabase] = None


def get_dashboard_db() -> DashboardDatabase:
    """Get or create the dashboard database singleton."""
    global _dashboard_db
    if _dashboard_db is None:
        _dashboard_db = DashboardDatabase()
    return _dashboard_db
