/**
 * Environmental Impact Score Calculator
 *
 * Scientifically-grounded scoring based on:
 * - ASHRAE 62.1-2019 (Ventilation)
 * - ASHRAE Standard 55 (Thermal Comfort)
 * - WELL Building Standard v2
 * - WHO Housing and Health Guidelines
 * - EPA Indoor Air Quality Guidelines
 * - EN 12464-1:2021 (Lighting)
 */

import {
  MetricName,
  MetricScore,
  EnvironmentalScore,
  ScoreGrade,
  ScoreLabel,
  METRIC_WEIGHTS,
  SCORE_COLORS,
  GRADE_THRESHOLDS,
} from './types';

/**
 * Calculate CO2 score (0-100)
 * Based on WELL Building v2 and ASHRAE 62.1
 *
 * Optimal: 400-600 ppm (near outdoor ambient)
 * Good: 600-800 ppm (WELL optimal threshold)
 * Acceptable: 800-1000 ppm (WHO limit)
 * Poor: 1000-1500 ppm (cognitive effects begin)
 * Hazardous: >1500 ppm
 */
export function calculateCO2Score(co2: number): number {
  if (co2 <= 400) return 100;
  if (co2 <= 600) return 100 - ((co2 - 400) / 200) * 5; // 95-100
  if (co2 <= 800) return 90 - ((co2 - 600) / 200) * 10; // 80-90
  if (co2 <= 1000) return 70 - ((co2 - 800) / 200) * 20; // 50-70
  if (co2 <= 1500) return 50 - ((co2 - 1000) / 500) * 30; // 20-50
  return Math.max(0, 20 - ((co2 - 1500) / 500) * 20); // 0-20
}

/**
 * Calculate Temperature score (0-100)
 * Based on ASHRAE Standard 55 thermal comfort
 *
 * Optimal: 20-24°C (68-75°F)
 * Gaussian curve centered at 22°C
 */
export function calculateTemperatureScore(temp: number): number {
  // Gaussian curve centered at 22°C, sigma = 3
  const optimalTemp = 22;
  const sigma = 3;
  const score = 100 * Math.exp(-0.5 * Math.pow((temp - optimalTemp) / sigma, 2));
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Humidity score (0-100)
 * Based on EPA Guidelines (30-50%) and ASHRAE (30-60%)
 *
 * Optimal: 40-60%
 * Gaussian curve centered at 50%
 */
export function calculateHumidityScore(humidity: number): number {
  // Gaussian curve centered at 50%, sigma = 15
  const optimalHumidity = 50;
  const sigma = 15;
  const score = 100 * Math.exp(-0.5 * Math.pow((humidity - optimalHumidity) / sigma, 2));
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Light score (0-100)
 * Based on EN 12464-1:2021 and WELL Building Standard
 *
 * Optimal: 300-500 lux for office/productivity work
 * Less penalty for bright (may indicate daylight)
 */
export function calculateLightScore(light: number): number {
  if (light >= 300 && light <= 500) return 100;
  if (light < 300) {
    // Penalty for too dim: -0.3 points per lux below 300
    return Math.max(0, 100 - (300 - light) * 0.3);
  }
  // Less penalty for too bright (daylight is beneficial)
  // -0.05 points per lux above 500
  return Math.max(0, 100 - (light - 500) * 0.05);
}

/**
 * Calculate Pressure score (0-100)
 * Based on standard atmospheric pressure
 *
 * Optimal: 1000-1025 hPa (normal range)
 * Minimal health impact, mainly for comfort awareness
 */
export function calculatePressureScore(pressure: number): number {
  const optimalPressure = 1013; // Standard atmospheric pressure
  const deviation = Math.abs(pressure - optimalPressure);
  // -0.5 points per hPa deviation
  return Math.max(0, 100 - deviation * 0.5);
}

/**
 * Get grade and label from score
 */
export function getGradeFromScore(score: number): { grade: ScoreGrade; label: ScoreLabel } {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.min) {
      return { grade: threshold.grade, label: threshold.label };
    }
  }
  return { grade: 'F', label: 'Critical' };
}

/**
 * Get color from grade
 */
export function getColorFromGrade(grade: ScoreGrade): string {
  return SCORE_COLORS[grade];
}

/**
 * Calculate individual metric score
 */
export function calculateMetricScore(
  metric: MetricName,
  value: number | null | undefined
): MetricScore | null {
  if (value === null || value === undefined || isNaN(value)) {
    return null;
  }

  let score: number;
  let unit: string;

  switch (metric) {
    case 'co2':
      score = calculateCO2Score(value);
      unit = 'ppm';
      break;
    case 'temperature':
      score = calculateTemperatureScore(value);
      unit = '°C';
      break;
    case 'humidity':
      score = calculateHumidityScore(value);
      unit = '%';
      break;
    case 'light':
      score = calculateLightScore(value);
      unit = 'lux';
      break;
    case 'pressure':
      score = calculatePressureScore(value);
      unit = 'hPa';
      break;
    default:
      return null;
  }

  const { grade, label } = getGradeFromScore(score);

  return {
    metric,
    value,
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    grade,
    label,
    unit,
    isAvailable: true,
    color: getColorFromGrade(grade),
  };
}

/**
 * Calculate overall Environmental Impact Score
 */
export function calculateEnvironmentalScore(
  sensorData: {
    co2?: number | null;
    temperature?: number | null;
    humidity?: number | null;
    light?: number | null;
    pressure?: number | null;
  } | null,
  lastUpdated?: Date | null
): EnvironmentalScore {
  // Handle no data case
  if (!sensorData) {
    console.warn('[ImpactScore] No sensor data available. Waiting for Firestore connection...');
    return createEmptyScore();
  }

  // Calculate individual metric scores
  const co2Score = calculateMetricScore('co2', sensorData.co2);
  const temperatureScore = calculateMetricScore('temperature', sensorData.temperature);
  const humidityScore = calculateMetricScore('humidity', sensorData.humidity);
  const lightScore = calculateMetricScore('light', sensorData.light);
  const pressureScore = calculateMetricScore('pressure', sensorData.pressure);

  const metrics = {
    co2: co2Score,
    temperature: temperatureScore,
    humidity: humidityScore,
    light: lightScore,
    pressure: pressureScore,
  };

  // Count available metrics
  const availableMetrics = Object.values(metrics).filter((m) => m !== null);
  const availableMetricsCount = availableMetrics.length;
  const totalMetricsCount = 5;

  // Handle no available metrics
  if (availableMetricsCount === 0) {
    console.error('[ImpactScore] All sensor readings unavailable. Displaying N/A.');
    return createEmptyScore();
  }

  // Calculate weighted average (normalize weights for available metrics)
  let totalWeight = 0;
  let weightedSum = 0;

  if (co2Score) {
    weightedSum += co2Score.score * METRIC_WEIGHTS.co2;
    totalWeight += METRIC_WEIGHTS.co2;
  }
  if (temperatureScore) {
    weightedSum += temperatureScore.score * METRIC_WEIGHTS.temperature;
    totalWeight += METRIC_WEIGHTS.temperature;
  }
  if (humidityScore) {
    weightedSum += humidityScore.score * METRIC_WEIGHTS.humidity;
    totalWeight += METRIC_WEIGHTS.humidity;
  }
  if (lightScore) {
    weightedSum += lightScore.score * METRIC_WEIGHTS.light;
    totalWeight += METRIC_WEIGHTS.light;
  }
  if (pressureScore) {
    weightedSum += pressureScore.score * METRIC_WEIGHTS.pressure;
    totalWeight += METRIC_WEIGHTS.pressure;
  }

  const overallScore = Math.round((weightedSum / totalWeight) * 10) / 10;
  const { grade: overallGrade, label: overallLabel } = getGradeFromScore(overallScore);
  const overallColor = getColorFromGrade(overallGrade);

  // Determine data freshness
  let dataFreshness: 'fresh' | 'stale' | 'expired' | 'none' = 'none';
  if (lastUpdated) {
    const age = Date.now() - lastUpdated.getTime();
    if (age < 5 * 60 * 1000) dataFreshness = 'fresh'; // < 5 min
    else if (age < 30 * 60 * 1000) dataFreshness = 'stale'; // < 30 min
    else dataFreshness = 'expired';
  }

  // Log partial data warning
  if (availableMetricsCount < totalMetricsCount) {
    const missing = Object.entries(metrics)
      .filter(([_, v]) => v === null)
      .map(([k]) => k);
    console.warn(`[ImpactScore] Partial data: Missing ${missing.join(', ')}. Score based on ${availableMetricsCount}/${totalMetricsCount} metrics.`);
  }

  return {
    overallScore,
    overallGrade,
    overallLabel,
    overallColor,
    metrics,
    trend: 'stable', // TODO: Calculate from historical data
    trendPercentage: 0,
    availableMetricsCount,
    totalMetricsCount,
    isPartialData: availableMetricsCount < totalMetricsCount,
    lastUpdated: lastUpdated || null,
    dataFreshness,
  };
}

/**
 * Create empty score for no-data state
 */
function createEmptyScore(): EnvironmentalScore {
  return {
    overallScore: 0,
    overallGrade: 'F',
    overallLabel: 'Critical',
    overallColor: SCORE_COLORS.F,
    metrics: {
      co2: null,
      temperature: null,
      humidity: null,
      light: null,
      pressure: null,
    },
    trend: 'stable',
    trendPercentage: 0,
    availableMetricsCount: 0,
    totalMetricsCount: 5,
    isPartialData: true,
    lastUpdated: null,
    dataFreshness: 'none',
  };
}

/**
 * Format score for display: "85/100 - B - Good"
 */
export function formatScoreDisplay(score: EnvironmentalScore): string {
  if (score.availableMetricsCount === 0) {
    return 'N/A';
  }

  const prefix = score.isPartialData ? '~' : '';
  return `${prefix}${Math.round(score.overallScore)}/100 - ${score.overallGrade} - ${score.overallLabel}`;
}

/**
 * Get score interpretation message
 */
export function getScoreInterpretation(score: EnvironmentalScore): string {
  if (score.availableMetricsCount === 0) {
    return 'No sensor data available. Please check your Firebase connection.';
  }

  switch (score.overallGrade) {
    case 'A':
      return 'Excellent environment! Optimal conditions for health and productivity.';
    case 'B':
      return 'Good environment. Conditions are comfortable with minor improvements possible.';
    case 'C':
      return 'Fair environment. Some adjustments recommended for optimal comfort.';
    case 'D':
      return 'Poor environment. Multiple factors need attention for better conditions.';
    case 'F':
      return 'Critical environment. Immediate attention required for health and safety.';
  }
}
