/**
 * Environmental Impact Score - Type Definitions
 * Based on ASHRAE, WHO, WELL Building, and EPA standards
 */

export type MetricName = 'co2' | 'temperature' | 'humidity' | 'light' | 'pressure';

export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type ScoreLabel = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';

export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface MetricThresholds {
  optimal: { min: number; max: number };
  good: { min: number; max: number };
  acceptable: { min: number; max: number };
  unit: string;
  weight: number;
}

export interface MetricScore {
  metric: MetricName;
  value: number;           // Raw sensor value
  score: number;           // Calculated score 0-100
  grade: ScoreGrade;
  label: ScoreLabel;
  unit: string;
  isAvailable: boolean;
  color: string;
}

export interface EnvironmentalScore {
  // Overall composite score
  overallScore: number;
  overallGrade: ScoreGrade;
  overallLabel: ScoreLabel;
  overallColor: string;

  // Individual metric scores
  metrics: {
    co2: MetricScore | null;
    temperature: MetricScore | null;
    humidity: MetricScore | null;
    light: MetricScore | null;
    pressure: MetricScore | null;
  };

  // Trend information
  trend: TrendDirection;
  trendPercentage: number;

  // Data quality indicators
  availableMetricsCount: number;
  totalMetricsCount: number;
  isPartialData: boolean;

  // Timestamp
  lastUpdated: Date | null;
  dataFreshness: 'fresh' | 'stale' | 'expired' | 'none';
}

export interface ScoreDisplayProps {
  score: number | null;
  grade: ScoreGrade | null;
  label: ScoreLabel | null;
  color: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}

// Metric weights based on health impact research
export const METRIC_WEIGHTS: Record<MetricName, number> = {
  co2: 0.30,         // 30% - Highest cognitive impact
  temperature: 0.25, // 25% - Productivity correlation
  humidity: 0.20,    // 20% - Respiratory health
  light: 0.15,       // 15% - Circadian rhythm
  pressure: 0.10,    // 10% - Minimal direct impact
};

// Color mapping for score visualization
export const SCORE_COLORS: Record<ScoreGrade, string> = {
  A: '#16a34a', // green-600
  B: '#84cc16', // lime-500
  C: '#eab308', // yellow-500
  D: '#f97316', // orange-500
  F: '#dc2626', // red-600
};

// Grade thresholds
export const GRADE_THRESHOLDS: { min: number; grade: ScoreGrade; label: ScoreLabel }[] = [
  { min: 90, grade: 'A', label: 'Excellent' },
  { min: 70, grade: 'B', label: 'Good' },
  { min: 50, grade: 'C', label: 'Fair' },
  { min: 30, grade: 'D', label: 'Poor' },
  { min: 0, grade: 'F', label: 'Critical' },
];
