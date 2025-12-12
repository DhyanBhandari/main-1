/**
 * PHI Score Summary Component
 * Displays PHI score with human-readable impact assessments
 * White theme version
 */

import { motion } from 'framer-motion';
import {
  Activity,
  Heart,
  TrendingUp,
  Leaf,
  Globe,
  TreePine,
  Droplets,
  Sun,
  Building2,
  Wheat,
  Waves,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { RadialGauge } from './charts/RadialGauge';
import {
  PHISummary,
  EcosystemType,
  formatEcosystemType,
} from '../types/phi';
import {
  getAllImpacts,
  getOverallStatus,
  ImpactAssessment,
} from '../utils/impactAssessment';

interface PHIScoreSummaryProps {
  summary: PHISummary;
  className?: string;
}

// Ecosystem type icons mapping
const ecosystemIcons: Record<EcosystemType, React.ReactNode> = {
  tropical_forest: <TreePine className="w-5 h-5" />,
  mangrove: <Waves className="w-5 h-5" />,
  grassland_savanna: <Sun className="w-5 h-5" />,
  wetland: <Droplets className="w-5 h-5" />,
  agricultural: <Wheat className="w-5 h-5" />,
  urban_green: <Building2 className="w-5 h-5" />,
  default: <Globe className="w-5 h-5" />,
};

// Impact category icons
const impactIcons: Record<string, React.ReactNode> = {
  Heart: <Heart className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
};

export const PHIScoreSummary = ({ summary, className = '' }: PHIScoreSummaryProps) => {
  const overallStatus = getOverallStatus(summary.overall_score || 0);
  const impacts = getAllImpacts(
    summary.overall_score || 0,
    summary.pillar_scores,
    summary.esv_multiplier
  );

  return (
    <div className={`bg-white border border-gray-200 shadow-lg rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-900">Planetary Health Index</h2>
      </div>

      {/* Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Score */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6">
          <RadialGauge
            score={summary.overall_score || 0}
            label="PHI Score"
            size={180}
            showGrade={true}
          />

          <div
            className="mt-4 px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: `${overallStatus.color}15`,
              color: overallStatus.color,
            }}
          >
            {overallStatus.status}
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            {overallStatus.description}
          </p>
        </div>

        {/* Ecosystem Type */}
        <div className="lg:col-span-2 space-y-4">
          {summary.ecosystem_type && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  {ecosystemIcons[summary.ecosystem_type] || <Globe className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ecosystem Type</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatEcosystemType(summary.ecosystem_type)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Impact Assessment Section */}
      <div className="space-y-6">
        {/* Positive Impacts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">Current Benefits</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {impacts.map((impact, index) => (
              <ImpactCard
                key={impact.category}
                impact={impact}
                type="positive"
                delay={0.6 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Risk Impacts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Risks if Degraded</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {impacts.map((impact, index) => (
              <ImpactCard
                key={impact.category}
                impact={impact}
                type="risk"
                delay={0.9 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Impact Card Component
interface ImpactCardProps {
  impact: ImpactAssessment;
  type: 'positive' | 'risk';
  delay: number;
}

const ImpactCard = ({ impact, type, delay }: ImpactCardProps) => {
  const isPositive = type === 'positive';
  const text = isPositive ? impact.positive : impact.risk;
  const borderColor = isPositive ? impact.color : '#f59e0b';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-gray-50 rounded-xl p-4 border-l-4"
      style={{ borderColor }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: isPositive ? impact.color : '#f59e0b' }}>
          {impactIcons[impact.icon]}
        </span>
        <h4 className="text-sm font-semibold text-gray-900">{impact.title}</h4>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
    </motion.div>
  );
};

export default PHIScoreSummary;
