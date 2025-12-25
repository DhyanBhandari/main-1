-- ============================================
-- Supabase Schema for Dashboard Data Backup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Dashboard Locations Table
-- Stores tracked locations for monitoring
-- ============================================
CREATE TABLE IF NOT EXISTS dashboard_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    poll_interval_seconds INTEGER DEFAULT 300,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Satellite Readings Table
-- Stores PHI/satellite data from GEE
-- ============================================
CREATE TABLE IF NOT EXISTS satellite_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    query_mode TEXT DEFAULT 'comprehensive',

    -- PHI Scores
    overall_score DOUBLE PRECISION,
    pillar_a_score DOUBLE PRECISION,
    pillar_b_score DOUBLE PRECISION,
    pillar_c_score DOUBLE PRECISION,
    pillar_d_score DOUBLE PRECISION,
    pillar_e_score DOUBLE PRECISION,

    -- Key metrics
    ndvi DOUBLE PRECISION,
    evi DOUBLE PRECISION,
    tree_cover DOUBLE PRECISION,
    soil_moisture DOUBLE PRECISION,
    lst DOUBLE PRECISION,
    aod DOUBLE PRECISION,
    population DOUBLE PRECISION,
    nightlights DOUBLE PRECISION,
    human_modification DOUBLE PRECISION,

    -- Metadata
    ecosystem_type TEXT,
    data_quality_score DOUBLE PRECISION,
    data_completeness DOUBLE PRECISION,

    -- Full response JSON
    raw_data JSONB,

    -- Sync tracking
    sqlite_id INTEGER,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Weather Readings Table (optional backup)
-- Only sync if needed for historical analysis
-- ============================================
CREATE TABLE IF NOT EXISTS weather_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    source TEXT DEFAULT 'open_meteo',

    -- Weather data
    temperature DOUBLE PRECISION,
    feels_like DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    pressure DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    wind_direction DOUBLE PRECISION,
    wind_gusts DOUBLE PRECISION,
    weather_code INTEGER,
    weather_description TEXT,
    cloud_cover DOUBLE PRECISION,
    precipitation DOUBLE PRECISION,
    is_day BOOLEAN,

    -- Full response
    raw_data JSONB,

    -- Sync tracking
    sqlite_id INTEGER,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Air Quality Readings Table (optional backup)
-- ============================================
CREATE TABLE IF NOT EXISTS air_quality_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    source TEXT DEFAULT 'open_meteo',

    -- AQI data
    us_aqi DOUBLE PRECISION,
    european_aqi DOUBLE PRECISION,
    aqi_category TEXT,
    pm25 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    ozone DOUBLE PRECISION,
    carbon_monoxide DOUBLE PRECISION,
    nitrogen_dioxide DOUBLE PRECISION,
    sulphur_dioxide DOUBLE PRECISION,
    uv_index DOUBLE PRECISION,
    uv_category TEXT,

    -- Full response
    raw_data JSONB,

    -- Sync tracking
    sqlite_id INTEGER,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for fast queries
-- ============================================

-- Satellite readings indexes
CREATE INDEX IF NOT EXISTS idx_satellite_readings_location
ON satellite_readings(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_satellite_readings_timestamp
ON satellite_readings(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_satellite_readings_location_time
ON satellite_readings(latitude, longitude, timestamp DESC);

-- Weather readings indexes
CREATE INDEX IF NOT EXISTS idx_weather_readings_location
ON weather_readings(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_weather_readings_timestamp
ON weather_readings(timestamp DESC);

-- Air quality readings indexes
CREATE INDEX IF NOT EXISTS idx_aqi_readings_location
ON air_quality_readings(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_aqi_readings_timestamp
ON air_quality_readings(timestamp DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE dashboard_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_readings ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
CREATE POLICY "Service role access dashboard_locations" ON dashboard_locations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role access satellite_readings" ON satellite_readings
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role access weather_readings" ON weather_readings
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role access air_quality_readings" ON air_quality_readings
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboard_locations_updated_at
    BEFORE UPDATE ON dashboard_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Helpful views for analytics
-- ============================================

-- Latest satellite reading per location
CREATE OR REPLACE VIEW latest_satellite_readings AS
SELECT DISTINCT ON (latitude, longitude)
    id, timestamp, latitude, longitude,
    overall_score, pillar_a_score, pillar_b_score,
    pillar_c_score, pillar_d_score, pillar_e_score,
    ndvi, evi, tree_cover, ecosystem_type
FROM satellite_readings
ORDER BY latitude, longitude, timestamp DESC;

-- Daily satellite data summary
CREATE OR REPLACE VIEW daily_satellite_stats AS
SELECT
    DATE(timestamp) as reading_date,
    COUNT(*) as total_readings,
    AVG(overall_score) as avg_overall_score,
    AVG(ndvi) as avg_ndvi,
    AVG(tree_cover) as avg_tree_cover
FROM satellite_readings
GROUP BY DATE(timestamp)
ORDER BY reading_date DESC;

-- ============================================
-- Sample queries for testing
-- ============================================

-- Get latest satellite reading for a location
-- SELECT * FROM satellite_readings
-- WHERE latitude BETWEEN 11.9 AND 11.91
-- AND longitude BETWEEN 79.8 AND 79.81
-- ORDER BY timestamp DESC LIMIT 1;

-- Get satellite history for a location (7 days)
-- SELECT timestamp, overall_score, ndvi, tree_cover
-- FROM satellite_readings
-- WHERE latitude BETWEEN 11.9 AND 11.91
-- AND longitude BETWEEN 79.8 AND 79.81
-- AND timestamp > NOW() - INTERVAL '7 days'
-- ORDER BY timestamp DESC;
