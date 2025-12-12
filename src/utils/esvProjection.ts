/**
 * ESV Projection Utility
 * Calculates future ecosystem service values based on different growth scenarios
 */

export type ScenarioName = 'conservative' | 'moderate' | 'optimistic';

export interface ProjectionScenario {
  name: ScenarioName;
  label: string;
  color: string;
  fillColor: string;
  growthRate: number;
  carbonRate: number; // tCO2/ha/year
  description: string;
}

export interface YearlyProjection {
  year: number;
  esv: number;
  carbon: number;
  cumulativeCarbon: number;
  phi: number;
}

export interface ProjectionResult {
  scenario: ProjectionScenario;
  projections: YearlyProjection[];
  totalCarbon: number;
  esvGrowthPercent: number;
  year5ESV: number;
}

export interface AllProjections {
  currentESV: number;
  currentPHI: number;
  conservative: ProjectionResult;
  moderate: ProjectionResult;
  optimistic: ProjectionResult;
}

// Scenario definitions
export const PROJECTION_SCENARIOS: Record<ScenarioName, ProjectionScenario> = {
  conservative: {
    name: 'conservative',
    label: 'Conservative',
    color: '#f59e0b', // amber
    fillColor: 'rgba(245, 158, 11, 0.2)',
    growthRate: 0.02, // 2% annual
    carbonRate: 1.5, // tCO2/ha/year
    description: 'Minimal intervention, natural recovery only',
  },
  moderate: {
    name: 'moderate',
    label: 'Moderate',
    color: '#22c55e', // green
    fillColor: 'rgba(34, 197, 94, 0.2)',
    growthRate: 0.05, // 5% annual
    carbonRate: 3.5, // tCO2/ha/year
    description: 'Active management, sustainable practices',
  },
  optimistic: {
    name: 'optimistic',
    label: 'Optimistic',
    color: '#3b82f6', // blue
    fillColor: 'rgba(59, 130, 246, 0.2)',
    growthRate: 0.10, // 10% annual
    carbonRate: 6.0, // tCO2/ha/year
    description: 'Restoration projects, reforestation',
  },
};

/**
 * Calculate ESV for a specific year
 */
function calculateYearESV(currentESV: number, growthRate: number, year: number): number {
  return currentESV * Math.pow(1 + growthRate, year);
}

/**
 * Calculate PHI for a specific year (grows slower than ESV)
 */
function calculateYearPHI(currentPHI: number, growthRate: number, year: number): number {
  const phiGrowthRate = growthRate * 0.3; // PHI improves slower
  return Math.min(100, currentPHI * Math.pow(1 + phiGrowthRate, year));
}

/**
 * Calculate cumulative carbon sequestration
 */
function calculateCumulativeCarbon(
  carbonRate: number,
  year: number,
  growthRate: number
): number {
  // Carbon accumulation increases as trees mature
  let total = 0;
  for (let y = 1; y <= year; y++) {
    total += carbonRate * (1 + (growthRate / 2) * (y - 1));
  }
  return total;
}

/**
 * Calculate projections for a single scenario
 */
export function calculateScenarioProjections(
  currentESV: number,
  currentPHI: number,
  scenario: ProjectionScenario,
  years: number[] = [0, 1, 3, 5]
): ProjectionResult {
  const projections: YearlyProjection[] = years.map((year) => ({
    year,
    esv: Math.round(calculateYearESV(currentESV, scenario.growthRate, year)),
    carbon: scenario.carbonRate * (1 + (scenario.growthRate / 2) * Math.max(0, year - 1)),
    cumulativeCarbon: year === 0 ? 0 : calculateCumulativeCarbon(scenario.carbonRate, year, scenario.growthRate),
    phi: Math.round(calculateYearPHI(currentPHI, scenario.growthRate, year) * 10) / 10,
  }));

  const year5Projection = projections.find((p) => p.year === 5) || projections[projections.length - 1];

  return {
    scenario,
    projections,
    totalCarbon: year5Projection.cumulativeCarbon,
    esvGrowthPercent: Math.round(((year5Projection.esv - currentESV) / currentESV) * 100),
    year5ESV: year5Projection.esv,
  };
}

/**
 * Calculate all projections for all scenarios
 */
export function calculateAllProjections(
  currentESV: number,
  currentPHI: number
): AllProjections {
  return {
    currentESV,
    currentPHI,
    conservative: calculateScenarioProjections(
      currentESV,
      currentPHI,
      PROJECTION_SCENARIOS.conservative
    ),
    moderate: calculateScenarioProjections(
      currentESV,
      currentPHI,
      PROJECTION_SCENARIOS.moderate
    ),
    optimistic: calculateScenarioProjections(
      currentESV,
      currentPHI,
      PROJECTION_SCENARIOS.optimistic
    ),
  };
}

/**
 * Format projections for line chart
 */
export function formatForLineChart(projections: AllProjections) {
  const labels = ['Now', 'Year 1', 'Year 3', 'Year 5'];

  return {
    labels,
    datasets: [
      {
        label: PROJECTION_SCENARIOS.conservative.label,
        data: projections.conservative.projections.map((p) => p.esv),
        borderColor: PROJECTION_SCENARIOS.conservative.color,
        backgroundColor: PROJECTION_SCENARIOS.conservative.fillColor,
        tension: 0.3,
      },
      {
        label: PROJECTION_SCENARIOS.moderate.label,
        data: projections.moderate.projections.map((p) => p.esv),
        borderColor: PROJECTION_SCENARIOS.moderate.color,
        backgroundColor: PROJECTION_SCENARIOS.moderate.fillColor,
        tension: 0.3,
      },
      {
        label: PROJECTION_SCENARIOS.optimistic.label,
        data: projections.optimistic.projections.map((p) => p.esv),
        borderColor: PROJECTION_SCENARIOS.optimistic.color,
        backgroundColor: PROJECTION_SCENARIOS.optimistic.fillColor,
        tension: 0.3,
      },
    ],
  };
}

/**
 * Format carbon data for area chart
 */
export function formatForCarbonAreaChart(projections: AllProjections) {
  const labels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

  // Generate yearly data for all 5 years
  const getYearlyCarbonData = (scenario: ProjectionResult) => {
    return [1, 2, 3, 4, 5].map((year) =>
      Math.round(calculateCumulativeCarbon(
        scenario.scenario.carbonRate,
        year,
        scenario.scenario.growthRate
      ) * 10) / 10
    );
  };

  return {
    labels,
    datasets: [
      {
        label: `${PROJECTION_SCENARIOS.optimistic.label} (tCO2/ha)`,
        data: getYearlyCarbonData(projections.optimistic),
        borderColor: PROJECTION_SCENARIOS.optimistic.color,
        backgroundColor: PROJECTION_SCENARIOS.optimistic.fillColor,
        fill: true,
      },
      {
        label: `${PROJECTION_SCENARIOS.moderate.label} (tCO2/ha)`,
        data: getYearlyCarbonData(projections.moderate),
        borderColor: PROJECTION_SCENARIOS.moderate.color,
        backgroundColor: PROJECTION_SCENARIOS.moderate.fillColor,
        fill: true,
      },
      {
        label: `${PROJECTION_SCENARIOS.conservative.label} (tCO2/ha)`,
        data: getYearlyCarbonData(projections.conservative),
        borderColor: PROJECTION_SCENARIOS.conservative.color,
        backgroundColor: PROJECTION_SCENARIOS.conservative.fillColor,
        fill: true,
      },
    ],
  };
}

/**
 * Format for comparison bar chart
 */
export function formatForComparisonBarChart(projections: AllProjections) {
  return {
    labels: ['Current', 'Year 5 (Conservative)', 'Year 5 (Moderate)', 'Year 5 (Optimistic)'],
    datasets: [
      {
        label: 'ESV ($/ha/year)',
        data: [
          projections.currentESV,
          projections.conservative.year5ESV,
          projections.moderate.year5ESV,
          projections.optimistic.year5ESV,
        ],
        backgroundColor: [
          '#6b7280', // gray for current
          PROJECTION_SCENARIOS.conservative.color,
          PROJECTION_SCENARIOS.moderate.color,
          PROJECTION_SCENARIOS.optimistic.color,
        ],
      },
    ],
  };
}

/**
 * Format currency
 */
export function formatProjectedValue(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Get growth percentage string
 */
export function formatGrowthPercent(current: number, projected: number): string {
  const percent = Math.round(((projected - current) / current) * 100);
  return percent >= 0 ? `+${percent}%` : `${percent}%`;
}
