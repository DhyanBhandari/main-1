/**
 * TypeScript interfaces for Planetary Health Index API
 * Matches the backend response structure from Hello-/app.py
 */

// Request types
export interface PHIQueryRequest {
  latitude: number;
  longitude: number;
  mode?: 'simple' | 'comprehensive';
  temporal?: 'latest' | 'monthly' | 'annual';
  buffer_radius?: number;
  pillars?: string[];
}

// Metric data structure
export interface MetricData {
  value: number | null;
  unit?: string;
  description?: string;
  quality?: 'good' | 'moderate' | 'poor' | 'unavailable';
  source?: string;
  resolution?: string;
  error?: string;
  // Additional fields for specific metrics
  [key: string]: unknown;
}

// Pillar data structure
export interface PillarData {
  metrics: Record<string, MetricData>;
  pillar_id: string;
  pillar_name: string;
  pillar_color: string;
  score: number | null;
  data_date?: string;
  mode: string;
  query_time: string;
  error?: string;
}

// Query metadata
export interface QueryMetadata {
  latitude: number;
  longitude: number;
  timestamp: string;
  mode: string;
  temporal: string;
  buffer_radius_m: number;
  date_range: {
    start: string;
    end: string;
  };
}

// Summary structure
export interface PHISummary {
  overall_score: number;
  pillar_scores: Record<string, number>;
  data_completeness: number;
  quality_flags: string[];
}

// Time series info
export interface TimeSeriesInfo {
  enabled: boolean;
  mode: string;
}

// Full API response
export interface PHIResponse {
  query: QueryMetadata;
  pillars: Record<string, PillarData>;
  summary: PHISummary;
  time_series: TimeSeriesInfo;
}

// Pillar configuration (for UI display)
export interface PillarConfig {
  id: string;
  name: string;
  fullName: string;
  color: string;
  icon: string;
  description: string;
}

// Pillar configurations for UI
export const PILLAR_CONFIGS: Record<string, PillarConfig> = {
  A: {
    id: 'A',
    name: 'Atmospheric',
    fullName: 'Atmospheric Quality',
    color: '#3498db',
    icon: 'Wind',
    description: 'Air quality, aerosol optical depth, UV index'
  },
  B: {
    id: 'B',
    name: 'Biodiversity',
    fullName: 'Biodiversity Index',
    color: '#27ae60',
    icon: 'Leaf',
    description: 'Vegetation indices, land cover classification'
  },
  C: {
    id: 'C',
    name: 'Carbon',
    fullName: 'Carbon Stock',
    color: '#8e44ad',
    icon: 'TreePine',
    description: 'Forest cover, biomass, carbon sequestration'
  },
  D: {
    id: 'D',
    name: 'Degradation',
    fullName: 'Land Degradation',
    color: '#e74c3c',
    icon: 'Thermometer',
    description: 'Land surface temperature, soil moisture, drought'
  },
  E: {
    id: 'E',
    name: 'Ecosystem',
    fullName: 'Ecosystem Services',
    color: '#f39c12',
    icon: 'Globe',
    description: 'Population density, human modification, elevation'
  }
};

// Helper function to get pillar ID from key (e.g., "A_atmospheric" -> "A")
export const getPillarId = (pillarKey: string): string => {
  return pillarKey.charAt(0);
};

// Helper function to get quality color
export const getQualityColor = (quality: string | undefined): string => {
  switch (quality) {
    case 'good':
      return '#22c55e'; // green
    case 'moderate':
      return '#f59e0b'; // amber
    case 'poor':
      return '#ef4444'; // red
    case 'unavailable':
    default:
      return '#6b7280'; // gray
  }
};

// Helper function to get score color
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#84cc16'; // lime
  if (score >= 40) return '#f59e0b'; // amber
  if (score >= 20) return '#f97316'; // orange
  return '#ef4444'; // red
};

// Helper function to format metric value
export const formatMetricValue = (value: number | null, unit?: string): string => {
  if (value === null || value === undefined) return 'N/A';

  // Format based on value magnitude
  let formatted: string;
  if (Math.abs(value) >= 1000) {
    formatted = value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  } else if (Math.abs(value) >= 1) {
    formatted = value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } else {
    formatted = value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }

  return unit ? `${formatted} ${unit}` : formatted;
};
