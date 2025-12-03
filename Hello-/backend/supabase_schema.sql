-- ============================================
-- Supabase Schema for Erthaloka PHI Tracking
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PHI Queries Table
-- Stores all user queries with tracking info
-- ============================================
CREATE TABLE IF NOT EXISTS phi_queries (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User identification (from Firebase Auth)
    user_id TEXT NOT NULL DEFAULT 'anonymous',
    user_email TEXT,

    -- Location data
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name TEXT,  -- Reverse geocoded name (e.g., "Mumbai, Maharashtra, India")

    -- Query metadata
    query_mode TEXT NOT NULL DEFAULT 'comprehensive',  -- 'simple' or 'comprehensive'
    ip_address TEXT,
    user_agent TEXT DEFAULT 'web',

    -- PHI response data (full JSON)
    phi_response JSONB,

    -- Extracted scores for easy querying
    overall_score DOUBLE PRECISION,
    pillar_scores JSONB,  -- {"A": 75, "B": 82, "C": 68, "D": 71, "E": 79}
    data_completeness DOUBLE PRECISION,
    quality_flags TEXT[],  -- Array of quality flags

    -- PDF tracking
    pdf_generated BOOLEAN DEFAULT FALSE,
    pdf_url TEXT,
    pdf_filename TEXT,
    pdf_generated_at TIMESTAMPTZ,
    pdf_downloaded BOOLEAN DEFAULT FALSE,
    pdf_download_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for fast queries
-- ============================================

-- Index for user queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_phi_queries_user_id ON phi_queries(user_id);

-- Index for user + created_at (for paginated history)
CREATE INDEX IF NOT EXISTS idx_phi_queries_user_created ON phi_queries(user_id, created_at DESC);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_phi_queries_location ON phi_queries(latitude, longitude);

-- Index for PDF tracking
CREATE INDEX IF NOT EXISTS idx_phi_queries_pdf ON phi_queries(user_id, pdf_generated);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE phi_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything
CREATE POLICY "Service role full access" ON phi_queries
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow inserts from service role (backend uses service key)
CREATE POLICY "Allow inserts" ON phi_queries
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow reads from service role
CREATE POLICY "Allow reads" ON phi_queries
    FOR SELECT
    USING (true);

-- Policy: Allow updates from service role
CREATE POLICY "Allow updates" ON phi_queries
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

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

CREATE TRIGGER update_phi_queries_updated_at
    BEFORE UPDATE ON phi_queries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Helpful views
-- ============================================

-- View: User statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT
    user_id,
    COUNT(*) as total_queries,
    COUNT(*) FILTER (WHERE pdf_generated = true) as pdfs_generated,
    SUM(pdf_download_count) as total_downloads,
    AVG(overall_score) as avg_score,
    MIN(created_at) as first_query,
    MAX(created_at) as last_query
FROM phi_queries
GROUP BY user_id;

-- View: Daily query stats
CREATE OR REPLACE VIEW daily_stats AS
SELECT
    DATE(created_at) as query_date,
    COUNT(*) as total_queries,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) FILTER (WHERE pdf_generated = true) as pdfs_generated,
    AVG(overall_score) as avg_score
FROM phi_queries
GROUP BY DATE(created_at)
ORDER BY query_date DESC;

-- ============================================
-- Storage bucket for PDFs
-- Run this separately in Supabase Storage settings
-- or via the dashboard:
-- 1. Go to Storage
-- 2. Create new bucket: "phi-reports"
-- 3. Make it public (or private with signed URLs)
-- ============================================

-- Grant access to storage (if using programmatic bucket creation)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('phi-reports', 'phi-reports', true);

-- ============================================
-- Sample queries for testing
-- ============================================

-- Get user's recent queries
-- SELECT * FROM phi_queries WHERE user_id = 'user123' ORDER BY created_at DESC LIMIT 10;

-- Get user stats
-- SELECT * FROM user_stats WHERE user_id = 'user123';

-- Get daily stats
-- SELECT * FROM daily_stats LIMIT 30;

-- Count queries by location
-- SELECT location_name, COUNT(*) as query_count, AVG(overall_score) as avg_score
-- FROM phi_queries
-- WHERE location_name IS NOT NULL
-- GROUP BY location_name
-- ORDER BY query_count DESC
-- LIMIT 20;
