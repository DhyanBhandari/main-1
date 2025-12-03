/**
 * Metric Supplementation Service
 * Supplements N/A remote sensing metrics with external API data (weather, air quality)
 */

import { PHIResponse, MetricData } from '@/types/phi';
import { WeatherResponse, ComprehensiveExternalData } from '@/types/weather';

/**
 * Supplementation mapping: which external API fields can fill N/A remote sensing metrics
 */
const SUPPLEMENTATION_MAP: Record<string, {
  pillar: string;
  getValueFromExternal: (external: ComprehensiveExternalData) => number | null;
  unit: string;
  description: string;
}> = {
  // Pillar A - Atmospheric
  aqi: {
    pillar: 'A',
    getValueFromExternal: (ext) => ext.air_quality?.primary_aqi ?? null,
    unit: 'US AQI',
    description: 'Real-time Air Quality Index from Open-Meteo'
  },
  uv_index: {
    pillar: 'A',
    getValueFromExternal: (ext) => ext.weather?.daily?.uv_index_max?.[0] ?? null,
    unit: 'index',
    description: 'UV Index from weather forecast'
  },

  // Pillar D - Degradation
  soil_moisture: {
    pillar: 'D',
    getValueFromExternal: (ext) => {
      const hourly = ext.weather?.hourly;
      if (!hourly) return null;

      // Average soil moisture from multiple depths
      const values = [
        hourly.soil_moisture_0_to_1cm?.[0],
        hourly.soil_moisture_1_to_3cm?.[0],
        hourly.soil_moisture_3_to_9cm?.[0],
        hourly.soil_moisture_9_to_27cm?.[0]
      ].filter((v): v is number => v !== undefined && v !== null);

      if (values.length === 0) return null;
      return values.reduce((sum, v) => sum + v, 0) / values.length;
    },
    unit: 'm³/m³',
    description: 'Soil moisture from weather API (averaged across depths)'
  },
  lst: {
    pillar: 'D',
    getValueFromExternal: (ext) => ext.weather?.current?.temperature?.value ?? null,
    unit: '°C',
    description: 'Surface temperature from weather API'
  }
};

/**
 * Supplement PHI data with external API data where remote sensing metrics are N/A
 * @param phiData - Original PHI response with potential N/A values
 * @param externalData - Comprehensive external data (weather + AQI)
 * @returns PHI data with supplemented metrics
 */
export const supplementMetrics = (
  phiData: PHIResponse,
  externalData: ComprehensiveExternalData | null
): PHIResponse => {
  if (!externalData || !phiData.pillars) {
    return phiData;
  }

  // Deep clone to avoid mutations
  const supplementedData: PHIResponse = JSON.parse(JSON.stringify(phiData));

  // Track what was supplemented for logging
  const supplementedMetrics: string[] = [];

  // Iterate through all pillars and metrics
  Object.entries(supplementedData.pillars).forEach(([pillarKey, pillar]) => {
    Object.entries(pillar.metrics).forEach(([metricName, metric]) => {
      // Only supplement if value is null/undefined
      if (metric.value === null || metric.value === undefined) {
        const supplementConfig = SUPPLEMENTATION_MAP[metricName];

        if (supplementConfig) {
          const externalValue = supplementConfig.getValueFromExternal(externalData);

          if (externalValue !== null) {
            // Update the metric with external data
            pillar.metrics[metricName] = {
              ...metric,
              value: externalValue,
              unit: supplementConfig.unit,
              quality: 'moderate', // Supplemented data is marked as moderate quality
              description: supplementConfig.description
            };

            supplementedMetrics.push(`${pillarKey}.${metricName}`);
          }
        }
      }
    });
  });

  // Log supplementation actions
  if (supplementedMetrics.length > 0) {
    console.log('[MetricSupplementation] Supplemented metrics from external APIs:', supplementedMetrics);
  }

  return supplementedData;
};

/**
 * Get normalization config for a metric (for radar charts)
 * Returns min, max, and whether higher is better
 */
export const getMetricNormalization = (metricName: string): {
  min: number;
  max: number;
  higherIsBetter: boolean;
} => {
  const normalizations: Record<string, { min: number; max: number; higherIsBetter: boolean }> = {
    // Pillar A - Atmospheric
    aod: { min: 0, max: 1, higherIsBetter: false }, // Lower AOD = cleaner air
    aqi: { min: 0, max: 500, higherIsBetter: false }, // Lower AQI = better
    uv_index: { min: 0, max: 15, higherIsBetter: false }, // Lower UV = safer
    cloud_fraction: { min: 0, max: 1, higherIsBetter: false }, // Context-dependent

    // Pillar B - Biodiversity
    ndvi: { min: -1, max: 1, higherIsBetter: true }, // Higher = more vegetation
    evi: { min: -1, max: 1, higherIsBetter: true },
    lai: { min: 0, max: 10, higherIsBetter: true },
    fpar: { min: 0, max: 1, higherIsBetter: true },
    land_cover: { min: 0, max: 100, higherIsBetter: true }, // Context-dependent

    // Pillar C - Carbon
    tree_cover: { min: 0, max: 100, higherIsBetter: true },
    forest_loss: { min: 0, max: 1, higherIsBetter: false }, // Lower loss = better
    canopy_height: { min: 0, max: 60, higherIsBetter: true },
    biomass: { min: 0, max: 500, higherIsBetter: true },
    carbon_stock: { min: 0, max: 250, higherIsBetter: true },

    // Pillar D - Degradation
    lst: { min: -40, max: 60, higherIsBetter: false }, // Context-dependent
    soil_moisture: { min: 0, max: 0.6, higherIsBetter: true }, // Higher moisture generally better
    water_occurrence: { min: 0, max: 100, higherIsBetter: true },
    drought_index: { min: -3, max: 3, higherIsBetter: false }, // Lower = less drought
    evaporative_stress: { min: -2, max: 2, higherIsBetter: false },

    // Pillar E - Ecosystem
    population: { min: 0, max: 10000, higherIsBetter: false }, // Context-dependent
    nightlights: { min: 0, max: 300, higherIsBetter: false }, // Lower = less light pollution
    human_modification: { min: 0, max: 1, higherIsBetter: false },
    elevation: { min: -500, max: 9000, higherIsBetter: false }, // Neutral
    distance_to_water: { min: 0, max: 100000, higherIsBetter: false } // Closer = better
  };

  return normalizations[metricName] || { min: 0, max: 100, higherIsBetter: true };
};

/**
 * Normalize a metric value to 0-100 scale for radar chart
 * @param value - Raw metric value
 * @param metricName - Name of the metric for normalization config
 * @returns Normalized value 0-100 (higher always = better for chart display)
 */
export const normalizeMetricForChart = (value: number | null, metricName: string): number => {
  if (value === null || value === undefined) return 0;

  const config = getMetricNormalization(metricName);

  // Clamp to range
  const clampedValue = Math.max(config.min, Math.min(config.max, value));

  // Normalize to 0-1
  let normalized = (clampedValue - config.min) / (config.max - config.min);

  // Invert if lower is better (so higher on chart always = better)
  if (!config.higherIsBetter) {
    normalized = 1 - normalized;
  }

  // Scale to 0-100
  return Math.round(normalized * 100);
};

/**
 * Prepare radar chart data for a single pillar
 * @param pillar - Pillar data with metrics
 * @returns Data for radar chart (labels, values)
 */
export const preparePillarRadarData = (
  metrics: Record<string, MetricData>
): { labels: string[]; values: number[] } => {
  const labels: string[] = [];
  const values: number[] = [];

  Object.entries(metrics).forEach(([metricName, metric]) => {
    // Include all metrics, even with null values (show as 0)
    const displayName = metricName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    labels.push(displayName);
    values.push(normalizeMetricForChart(metric.value, metricName));
  });

  return { labels, values };
};

/**
 * Get data fetch timestamp
 */
export const getDataTimestamp = (): string => {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};
