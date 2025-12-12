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
  quality?: 'good' | 'moderate' | 'poor' | 'unavailable' | 'supplemented';
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

// Ecosystem type for adaptive weighting
export type EcosystemType =
  | 'tropical_forest'
  | 'mangrove'
  | 'grassland_savanna'
  | 'wetland'
  | 'agricultural'
  | 'urban_green'
  | 'default';

// Score interpretation
export type ScoreInterpretation =
  | 'Excellent'
  | 'Good'
  | 'Moderate'
  | 'Poor'
  | 'Critical'
  | 'Unavailable';

// Summary structure (PHI Technical Framework)
export interface PHISummary {
  // Core scores
  overall_score: number;
  overall_interpretation?: ScoreInterpretation;
  pillar_scores: Record<string, number>;

  // Ecosystem-adaptive weighting
  ecosystem_type?: EcosystemType;
  ecosystem_weights?: Record<string, number>;

  // Data quality (PHI Technical Framework DQS)
  data_quality_score?: number;
  data_completeness: number;
  dqs_recommendation?: string;
  missing_critical_metrics?: string[];
  quality_flags: string[];

  // Economic valuation
  esv_multiplier?: number;

  // Methodology
  methodology?: string;
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
    case 'supplemented':
      return '#3b82f6'; // blue - data from external API
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

// Helper function to get interpretation color
export const getInterpretationColor = (interpretation: ScoreInterpretation | undefined): string => {
  switch (interpretation) {
    case 'Excellent':
      return '#22c55e'; // green
    case 'Good':
      return '#84cc16'; // lime
    case 'Moderate':
      return '#f59e0b'; // amber
    case 'Poor':
      return '#f97316'; // orange
    case 'Critical':
      return '#ef4444'; // red
    case 'Unavailable':
    default:
      return '#6b7280'; // gray
  }
};

// Helper function to format ecosystem type for display
export const formatEcosystemType = (ecosystemType: EcosystemType | undefined): string => {
  if (!ecosystemType) return 'Mixed/Unknown';

  const labels: Record<EcosystemType, string> = {
    tropical_forest: 'Tropical Forest',
    mangrove: 'Mangrove',
    grassland_savanna: 'Grassland/Savanna',
    wetland: 'Wetland',
    agricultural: 'Agricultural',
    urban_green: 'Urban Green',
    default: 'Mixed/Unknown'
  };

  return labels[ecosystemType] || 'Mixed/Unknown';
};

// Helper function to get ecosystem type icon
export const getEcosystemIcon = (ecosystemType: EcosystemType | undefined): string => {
  const icons: Record<EcosystemType, string> = {
    tropical_forest: 'TreePine',
    mangrove: 'Waves',
    grassland_savanna: 'Sun',
    wetland: 'Droplets',
    agricultural: 'Wheat',
    urban_green: 'Building2',
    default: 'Globe'
  };

  return icons[ecosystemType || 'default'] || 'Globe';
};

// Helper function to get DQS confidence level
export const getDQSConfidenceLevel = (dqs: number | undefined): {
  level: string;
  color: string;
  description: string;
} => {
  if (dqs === undefined || dqs === null) {
    return { level: 'Unknown', color: '#6b7280', description: 'Data quality score unavailable' };
  }

  if (dqs >= 85) {
    return { level: 'High', color: '#22c55e', description: 'High confidence results' };
  } else if (dqs >= 70) {
    return { level: 'Investment Grade', color: '#84cc16', description: 'Suitable for most applications' };
  } else if (dqs >= 50) {
    return { level: 'Acceptable', color: '#f59e0b', description: 'Consider supplementing data' };
  } else if (dqs >= 40) {
    return { level: 'Marginal', color: '#f97316', description: 'Interpret with caution' };
  } else {
    return { level: 'Low', color: '#ef4444', description: 'Limited data coverage' };
  }
};

// Helper function to format ESV multiplier
export const formatESVMultiplier = (multiplier: number | null | undefined): string => {
  if (multiplier === null || multiplier === undefined) return 'N/A';

  const sign = multiplier >= 0 ? '+' : '';
  const percentage = (multiplier * 100).toFixed(1);
  return `${sign}${percentage}%`;
};

// Critical metrics list for reference
export const CRITICAL_METRICS = ['ndvi', 'tree_cover', 'soil_moisture', 'human_modification'];
