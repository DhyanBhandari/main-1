/**
 * Unified Dashboard Data Types
 *
 * These types define the data structure for all dashboard instances:
 * - Public Dashboard (point location)
 * - Institute Dashboard (polygon area)
 * - Admin Preview Dashboard
 */

// ==================== LOCATION ====================

export interface DashboardLocation {
  name: string;
  type: 'point' | 'polygon';
  coordinates: number[][] | [number, number];
  area_hectares?: number;
}

// ==================== USER ====================

export interface DashboardUser {
  name: string;
  role: 'public' | 'institute' | 'admin';
}

// ==================== OPTIONS ====================

export interface DashboardOptions {
  showLogout?: boolean;
  showRefresh?: boolean;
  isPreview?: boolean;
  readOnly?: boolean;
}

// ==================== METRICS ====================

export interface MetricData {
  value: number | string | null;
  unit: string;
  quality?: 'good' | 'moderate' | 'low' | 'realtime';
  description?: string;
  // Additional fields for complex metrics
  min?: number;
  max?: number;
  lst_night?: number;
  diurnal_range?: number;
}

export interface PillarData {
  name: string;
  score: number;
  metrics: Record<string, MetricData>;
}

// ==================== SUMMARY ====================

export interface DashboardSummary {
  overall_score: number;
  overall_interpretation: string;
  ecosystem_type: string;
  pillar_scores: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
  area_hectares?: number;
}

// ==================== WEATHER ====================

export interface WeatherData {
  available: boolean;
  source: string;
  current: {
    temperature: { value: number; unit: string; feels_like?: number };
    humidity: { value: number; unit: string };
    pressure: { sea_level: number; surface?: number; unit: string };
    wind: { speed: number; direction: number; gusts?: number; unit: string };
    weather: {
      code: number;
      description: string;
      icon?: string;
      is_day?: boolean;
    };
    cloud_cover: { value: number; unit: string };
    precipitation: { value: number; unit: string };
  };
  timestamp?: string;
}

// ==================== AQI ====================

export interface AQIData {
  available: boolean;
  source: string;
  aqi: {
    us_aqi: number;
    european_aqi?: number;
    category: string;
  };
  pollutants: {
    pm2_5: { value: number; unit: string };
    pm10: { value: number; unit: string };
    ozone: { value: number; unit: string };
    carbon_monoxide: { value: number; unit: string };
    nitrogen_dioxide: { value: number; unit: string };
    sulphur_dioxide?: { value: number; unit: string };
  };
  uv_index: {
    value: number;
    category: string;
  };
  timestamp?: string;
}

// ==================== IMAGERY ====================

export interface ImageryData {
  true_color?: string;
  ndvi?: string;
  lst?: string;
  land_cover?: string;
  forest_cover?: string;
}

// ==================== MAIN DATA ====================

export interface DashboardData {
  query: {
    type: 'point' | 'polygon';
    coordinates: any;
    area_hectares?: number;
    mode: string;
  };
  summary: DashboardSummary;
  pillars: {
    A: PillarData;
    B: PillarData;
    C: PillarData;
    D: PillarData;
    E: PillarData;
  };
  weather?: WeatherData;
  aqi?: AQIData;
  imagery?: ImageryData;
  timestamp: string;
  sources: string[];
}

// ==================== TEMPLATE PROPS ====================

export interface DashboardTemplateProps {
  data: DashboardData | null;
  location: DashboardLocation;
  user?: DashboardUser;
  options?: DashboardOptions;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onLogout?: () => void;
}

// ==================== PILLAR CONFIG ====================

export interface PillarConfig {
  id: string;
  name: string;
  fullName: string;
  color: string;
  icon: any;
  gradient: string;
}

export const PILLAR_CONFIGS: Record<string, PillarConfig> = {
  A: {
    id: 'A',
    name: 'Atmospheric',
    fullName: 'Atmospheric Health',
    color: '#3498db',
    icon: null, // Will be set by component
    gradient: 'from-blue-500 to-blue-600',
  },
  B: {
    id: 'B',
    name: 'Biodiversity',
    fullName: 'Biodiversity',
    color: '#27ae60',
    icon: null,
    gradient: 'from-green-500 to-green-600',
  },
  C: {
    id: 'C',
    name: 'Climate',
    fullName: 'Climate',
    color: '#8e44ad',
    icon: null,
    gradient: 'from-purple-500 to-purple-600',
  },
  D: {
    id: 'D',
    name: 'DLWD',
    fullName: 'Decrease in Land & Water Degradation',
    color: '#e74c3c',
    icon: null,
    gradient: 'from-red-500 to-red-600',
  },
  E: {
    id: 'E',
    name: 'Ecosystem',
    fullName: 'Ecosystem Services',
    color: '#f39c12',
    icon: null,
    gradient: 'from-orange-500 to-orange-600',
  },
};
