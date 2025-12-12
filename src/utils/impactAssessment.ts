/**
 * Rule-based Impact Assessment Utility
 * Provides human-readable impact messages based on PHI scores
 */

export interface ImpactAssessment {
  category: 'health' | 'economic' | 'biodiversity';
  icon: string;
  title: string;
  positive: string;
  risk: string;
  severity: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  color: string;
}

// Score ranges for severity classification
function getSeverity(score: number): 'excellent' | 'good' | 'moderate' | 'poor' | 'critical' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'poor';
  return 'critical';
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'excellent': return '#10b981'; // emerald
    case 'good': return '#22c55e'; // green
    case 'moderate': return '#f59e0b'; // amber
    case 'poor': return '#f97316'; // orange
    case 'critical': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
}

/**
 * Get health impact assessment based on PHI score and atmospheric pillar
 */
export function getHealthImpact(phiScore: number, atmosphericScore?: number): ImpactAssessment {
  const score = atmosphericScore ?? phiScore;
  const severity = getSeverity(score);

  const impacts: Record<string, { positive: string; risk: string }> = {
    excellent: {
      positive: 'Clean air supports optimal respiratory health. Low pollution levels reduce disease risk by up to 30%.',
      risk: 'Even small increases in pollution can begin to affect sensitive individuals.'
    },
    good: {
      positive: 'Air quality meets healthy standards. Most people can breathe comfortably without health concerns.',
      risk: 'Sensitive groups (elderly, children, asthma patients) may experience mild discomfort if conditions worsen.'
    },
    moderate: {
      positive: 'Air quality is acceptable for most activities. Some natural air filtering is still functioning.',
      risk: 'Prolonged exposure may cause respiratory irritation. Risk of chronic issues increases over time.'
    },
    poor: {
      positive: 'Limited natural air purification remains. Some ecosystem functions still provide partial protection.',
      risk: 'Significant health risks for all. Increased respiratory diseases, cardiovascular stress, and reduced life expectancy.'
    },
    critical: {
      positive: 'Urgent action could still restore some air quality functions if taken immediately.',
      risk: 'Critical health emergency. Immediate respiratory distress likely. Long-term neurological impacts possible.'
    }
  };

  return {
    category: 'health',
    icon: 'Heart',
    title: 'Health Impact',
    positive: impacts[severity].positive,
    risk: impacts[severity].risk,
    severity,
    color: getSeverityColor(severity)
  };
}

/**
 * Get economic impact assessment based on PHI score and ESV multiplier
 */
export function getEconomicImpact(phiScore: number, esvMultiplier?: number): ImpactAssessment {
  const severity = getSeverity(phiScore);

  // Estimate ecosystem service value based on PHI score
  const estimatedValue: Record<string, string> = {
    excellent: '$3,000+',
    good: '$2,000-3,000',
    moderate: '$1,000-2,000',
    poor: '$400-1,000',
    critical: '< $400'
  };

  const impacts: Record<string, { positive: string; risk: string }> = {
    excellent: {
      positive: `High ecosystem service value (${estimatedValue[severity]}/ha/year). Natural water filtration, carbon storage, and pollination provide significant economic benefits.`,
      risk: 'Degradation would result in expensive artificial alternatives for water treatment and agriculture support.'
    },
    good: {
      positive: `Good ecosystem value (${estimatedValue[severity]}/ha/year). Natural systems effectively support agriculture, tourism, and clean water supply.`,
      risk: 'Moderate decline could reduce agricultural productivity and increase infrastructure costs.'
    },
    moderate: {
      positive: `Moderate ecosystem services (${estimatedValue[severity]}/ha/year). Some natural capital still provides economic benefits.`,
      risk: 'Continued degradation threatens food security and water resources, requiring costly interventions.'
    },
    poor: {
      positive: `Reduced but recoverable ecosystem services (${estimatedValue[severity]}/ha/year). Restoration is still economically viable.`,
      risk: 'Significant economic losses likely. Agricultural yields declining, water treatment costs rising.'
    },
    critical: {
      positive: `Minimal ecosystem services remain (${estimatedValue[severity]}/ha/year). Emergency restoration could prevent total loss.`,
      risk: 'Near total loss of natural capital. Rebuilding would cost 10-100x more than preservation would have.'
    }
  };

  return {
    category: 'economic',
    icon: 'TrendingUp',
    title: 'Economic Value',
    positive: impacts[severity].positive,
    risk: impacts[severity].risk,
    severity,
    color: getSeverityColor(severity)
  };
}

/**
 * Get biodiversity impact assessment based on PHI score and biodiversity pillar
 */
export function getBiodiversityImpact(phiScore: number, biodiversityScore?: number): ImpactAssessment {
  const score = biodiversityScore ?? phiScore;
  const severity = getSeverity(score);

  const impacts: Record<string, { positive: string; risk: string }> = {
    excellent: {
      positive: 'Thriving habitat supporting diverse species. Ecosystem functions at near-optimal capacity with robust food chains.',
      risk: 'Even healthy ecosystems are vulnerable to sudden changes. Monitoring remains important.'
    },
    good: {
      positive: 'Healthy ecosystem with good species diversity. Native species populations are stable and reproducing successfully.',
      risk: 'Some species may begin to show stress. Keystone species loss could trigger cascading effects.'
    },
    moderate: {
      positive: 'Moderate habitat quality. Core ecosystem structure remains intact with potential for recovery.',
      risk: 'Declining populations of sensitive species. Pollinator decline may affect food production.'
    },
    poor: {
      positive: 'Degraded but not destroyed. Key habitat features remain that could support restoration efforts.',
      risk: 'Significant species loss underway. Local extinctions possible. Ecosystem services severely compromised.'
    },
    critical: {
      positive: 'Emergency intervention could still save some species and prevent complete ecosystem collapse.',
      risk: 'Ecosystem collapse imminent. Mass species loss. Recovery may take decades or be impossible.'
    }
  };

  return {
    category: 'biodiversity',
    icon: 'Leaf',
    title: 'Biodiversity',
    positive: impacts[severity].positive,
    risk: impacts[severity].risk,
    severity,
    color: getSeverityColor(severity)
  };
}

/**
 * Get all impact assessments for a location
 */
export function getAllImpacts(
  phiScore: number,
  pillarScores?: Record<string, number>,
  esvMultiplier?: number
): ImpactAssessment[] {
  const atmosphericScore = pillarScores?.['A'];
  const biodiversityScore = pillarScores?.['B'];

  return [
    getHealthImpact(phiScore, atmosphericScore),
    getEconomicImpact(phiScore, esvMultiplier),
    getBiodiversityImpact(phiScore, biodiversityScore)
  ];
}

/**
 * Get overall status text based on PHI score
 */
export function getOverallStatus(phiScore: number): { status: string; description: string; color: string } {
  if (phiScore >= 80) {
    return {
      status: 'Excellent',
      description: 'This ecosystem is thriving and providing maximum benefits',
      color: '#10b981'
    };
  }
  if (phiScore >= 60) {
    return {
      status: 'Good',
      description: 'Healthy ecosystem with strong environmental functions',
      color: '#22c55e'
    };
  }
  if (phiScore >= 40) {
    return {
      status: 'Moderate',
      description: 'Some environmental concerns require attention',
      color: '#f59e0b'
    };
  }
  if (phiScore >= 20) {
    return {
      status: 'Poor',
      description: 'Significant degradation affecting health and services',
      color: '#f97316'
    };
  }
  return {
    status: 'Critical',
    description: 'Urgent intervention needed to prevent collapse',
    color: '#ef4444'
  };
}
