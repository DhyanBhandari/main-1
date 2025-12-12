/**
 * Ecosystem Service Value (ESV) Calculation Utility
 * Based on PHI Technical Framework documentation
 */

import { EcosystemType } from '../types/phi';

// Service categories for ESV breakdown
export interface ServiceValue {
  name: string;
  icon: string;
  value: number;
  percentage: number;
  color: string;
  description: string;
}

export interface ESVBreakdownResult {
  totalValue: number;
  adjustedValue: number;
  phiMultiplier: number;
  regionalFactor: number;
  ecosystemType: string;
  services: ServiceValue[];
  baselineValue: number;
}

// Baseline ESV values by ecosystem type (USD/ha/year) from documentation
const ECOSYSTEM_BASELINE_ESV: Record<string, number> = {
  tropical_forest: 5382,
  temperate_forest: 3137,
  mangrove: 12696,
  coral_reef: 352249,
  wetland: 25682,
  grassland_savanna: 2871,
  agricultural: 5567,
  urban_green: 6661,
  desert: 591,
  default: 3500,
};

// Service-specific values by ecosystem type (USD/ha/year)
const SERVICE_VALUES: Record<string, Record<string, number>> = {
  tropical_forest: {
    carbon_sequestration: 800,
    water_regulation: 600,
    air_quality: 300,
    biodiversity_habitat: 1500,
    recreation_cultural: 400,
    pollination: 200,
    erosion_control: 400,
  },
  wetland: {
    carbon_sequestration: 600,
    water_regulation: 8000,
    air_quality: 200,
    biodiversity_habitat: 3000,
    recreation_cultural: 1000,
    pollination: 500,
    erosion_control: 2000,
  },
  urban_green: {
    carbon_sequestration: 200,
    water_regulation: 400,
    air_quality: 2500,
    biodiversity_habitat: 500,
    recreation_cultural: 2000,
    pollination: 100,
    erosion_control: 300,
  },
  grassland_savanna: {
    carbon_sequestration: 400,
    water_regulation: 300,
    air_quality: 150,
    biodiversity_habitat: 900,
    recreation_cultural: 500,
    pollination: 300,
    erosion_control: 200,
  },
  agricultural: {
    carbon_sequestration: 300,
    water_regulation: 500,
    air_quality: 200,
    biodiversity_habitat: 400,
    recreation_cultural: 200,
    pollination: 800,
    erosion_control: 350,
  },
  mangrove: {
    carbon_sequestration: 1200,
    water_regulation: 3000,
    air_quality: 400,
    biodiversity_habitat: 4000,
    recreation_cultural: 800,
    pollination: 200,
    erosion_control: 5000,
  },
  default: {
    carbon_sequestration: 500,
    water_regulation: 600,
    air_quality: 300,
    biodiversity_habitat: 800,
    recreation_cultural: 400,
    pollination: 200,
    erosion_control: 300,
  },
};

// Regional Adjustment Factors (RAF) from documentation
const REGIONAL_FACTORS: Record<string, number> = {
  india_tier1: 0.45,
  india_tier2_3: 0.35,
  india_rural: 0.25,
  southeast_asia_urban: 0.50,
  africa_subsaharan: 0.20,
  europe_north_america: 1.00,
  default: 0.35, // India Tier 2/3 average
};

// Service display configuration
const SERVICE_CONFIG: Record<string, { icon: string; color: string; description: string }> = {
  carbon_sequestration: {
    icon: 'Leaf',
    color: '#22c55e',
    description: 'Carbon capture and storage by vegetation',
  },
  water_regulation: {
    icon: 'Droplets',
    color: '#3b82f6',
    description: 'Water filtration, flood control, and groundwater recharge',
  },
  air_quality: {
    icon: 'Wind',
    color: '#06b6d4',
    description: 'Air purification and pollution removal',
  },
  biodiversity_habitat: {
    icon: 'Trees',
    color: '#10b981',
    description: 'Wildlife habitat and species support',
  },
  recreation_cultural: {
    icon: 'Users',
    color: '#8b5cf6',
    description: 'Tourism, recreation, and cultural value',
  },
  pollination: {
    icon: 'Flower2',
    color: '#f59e0b',
    description: 'Pollination services for agriculture',
  },
  erosion_control: {
    icon: 'Mountain',
    color: '#78716c',
    description: 'Soil stabilization and erosion prevention',
  },
};

/**
 * Calculate PHI-to-ESV multiplier
 * Formula: M_PHI = [(PHI − 50) / 100] × k × [1 + α × ln(PHI / 50)]
 * where k = 0.6, α = 0.15
 */
export function calculatePHIMultiplier(phiScore: number): number {
  if (phiScore <= 0) return -0.30; // Cap at -30% for zero/negative scores

  const k = 0.6;
  const alpha = 0.15;

  const baseTerm = (phiScore - 50) / 100;
  const logTerm = 1 + alpha * Math.log(phiScore / 50);

  const multiplier = baseTerm * k * logTerm;

  // Clamp between -0.30 and +0.50
  return Math.max(-0.30, Math.min(0.50, multiplier));
}

/**
 * Get baseline ESV for ecosystem type
 */
export function getBaselineESV(ecosystemType: EcosystemType | string): number {
  return ECOSYSTEM_BASELINE_ESV[ecosystemType] || ECOSYSTEM_BASELINE_ESV.default;
}

/**
 * Get regional adjustment factor
 */
export function getRegionalFactor(region: string = 'default'): number {
  return REGIONAL_FACTORS[region] || REGIONAL_FACTORS.default;
}

/**
 * Calculate full ESV breakdown
 */
export function calculateESVBreakdown(
  phiScore: number,
  ecosystemType: EcosystemType | string = 'default',
  region: string = 'default'
): ESVBreakdownResult {
  const baselineValue = getBaselineESV(ecosystemType);
  const regionalFactor = getRegionalFactor(region);
  const phiMultiplier = calculatePHIMultiplier(phiScore);

  // Get service values for ecosystem type
  const serviceValues = SERVICE_VALUES[ecosystemType] || SERVICE_VALUES.default;

  // Calculate total from services
  const totalServiceValue = Object.values(serviceValues).reduce((sum, val) => sum + val, 0);

  // Apply PHI multiplier and regional factor
  const adjustedTotal = totalServiceValue * (1 + phiMultiplier) * regionalFactor;

  // Build service breakdown
  const services: ServiceValue[] = Object.entries(serviceValues).map(([key, value]) => {
    const config = SERVICE_CONFIG[key];
    const adjustedValue = value * (1 + phiMultiplier) * regionalFactor;

    return {
      name: formatServiceName(key),
      icon: config?.icon || 'Circle',
      value: Math.round(adjustedValue),
      percentage: Math.round((value / totalServiceValue) * 100),
      color: config?.color || '#6b7280',
      description: config?.description || '',
    };
  });

  // Sort by value descending
  services.sort((a, b) => b.value - a.value);

  return {
    totalValue: totalServiceValue,
    adjustedValue: Math.round(adjustedTotal),
    phiMultiplier,
    regionalFactor,
    ecosystemType: formatEcosystemTypeName(ecosystemType),
    services,
    baselineValue,
  };
}

/**
 * Format service name for display
 */
function formatServiceName(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format ecosystem type for display
 */
function formatEcosystemTypeName(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get multiplier effect description
 */
export function getMultiplierDescription(multiplier: number): string {
  if (multiplier >= 0.25) return 'Excellent ecosystem health boosting value';
  if (multiplier >= 0.10) return 'Good health adding value';
  if (multiplier >= 0) return 'Baseline ecosystem condition';
  if (multiplier >= -0.10) return 'Slight degradation reducing value';
  return 'Significant degradation reducing value';
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Get PHI multiplier as percentage string
 */
export function formatMultiplierPercent(multiplier: number): string {
  const percent = multiplier * 100;
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(0)}%`;
}
