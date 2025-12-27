/**
 * TypeScript interfaces for Planetary Performance Assessment API
 * Matches the backend response structure from Hello-/app.py
 */

// Request types
export interface PPAQueryRequest {
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

// Score interpretation (AAA to CCC grading scale)
export type ScoreInterpretation =
  | 'AAA'    // Excellent (86-100)
  | 'AA'     // Very Good (72-85)
  | 'A'      // Good (58-71)
  | 'BBB'    // Above Average (44-57)
  | 'BB'     // Average (30-43)
  | 'B'      // Below Average (16-29)
  | 'CCC'    // Poor (0-15)
  | 'Unavailable';

// Grade labels for display
export const GRADE_LABELS: Record<string, string> = {
  'AAA': 'Excellent',
  'AA': 'Very Good',
  'A': 'Good',
  'BBB': 'Above Average',
  'BB': 'Average',
  'B': 'Below Average',
  'CCC': 'Poor',
  'Unavailable': 'Unavailable'
};

// Helper function to get grade from score
export const getGradeFromScore = (score: number | null | undefined): ScoreInterpretation => {
  if (score === null || score === undefined) return 'Unavailable';
  if (score >= 86) return 'AAA';
  if (score >= 72) return 'AA';
  if (score >= 58) return 'A';
  if (score >= 44) return 'BBB';
  if (score >= 30) return 'BB';
  if (score >= 16) return 'B';
  return 'CCC';
};

// Summary structure (PPA Technical Framework)
export interface PPASummary {
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
export interface PPAResponse {
  query: QueryMetadata;
  pillars: Record<string, PillarData>;
  summary: PPASummary;
  time_series: TimeSeriesInfo;
}

// Backward compatibility aliases
export type PHIQueryRequest = PPAQueryRequest;
export type PHISummary = PPASummary;
export type PHIResponse = PPAResponse;

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
    fullName: 'Atmospheric Health',
    color: '#3498db',
    icon: 'Wind',
    description: 'Air quality, aerosol optical depth, UV index'
  },
  B: {
    id: 'B',
    name: 'Biodiversity',
    fullName: 'Biodiversity',
    color: '#27ae60',
    icon: 'Leaf',
    description: 'Vegetation indices, land cover classification'
  },
  C: {
    id: 'C',
    name: 'Climate',
    fullName: 'Climate',
    color: '#8e44ad',
    icon: 'TreePine',
    description: 'Forest cover, biomass, carbon sequestration'
  },
  D: {
    id: 'D',
    name: 'DLWD',
    fullName: 'Decrease in Land & Water Degradation',
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

// Helper function to get interpretation/grade color
export const getInterpretationColor = (interpretation: ScoreInterpretation | undefined): string => {
  switch (interpretation) {
    case 'AAA':
      return '#22c55e'; // green - Excellent
    case 'AA':
      return '#4ade80'; // light green - Very Good
    case 'A':
      return '#84cc16'; // lime - Good
    case 'BBB':
      return '#facc15'; // yellow - Above Average
    case 'BB':
      return '#f59e0b'; // amber - Average
    case 'B':
      return '#f97316'; // orange - Below Average
    case 'CCC':
      return '#ef4444'; // red - Poor
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
