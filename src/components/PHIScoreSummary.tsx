/**
 * PHI Score Summary Component
 * Displays the comprehensive PHI Technical Framework scoring data
 */

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Globe,
  Info,
  Leaf,
  TrendingUp,
  TreePine,
  Droplets,
  Sun,
  Building2,
  Wheat,
  Waves,
} from 'lucide-react';
import { RadialGauge } from './charts/RadialGauge';
import {
  PHISummary,
  EcosystemType,
  formatEcosystemType,
  getDQSConfidenceLevel,
  formatESVMultiplier,
  getInterpretationColor,
  PILLAR_CONFIGS,
} from '../types/phi';

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

export const PHIScoreSummary = ({ summary, className = '' }: PHIScoreSummaryProps) => {
  const dqsInfo = getDQSConfidenceLevel(summary.data_quality_score);
  const interpretationColor = getInterpretationColor(summary.overall_interpretation);

  return (
    <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">PHI Score Analysis</h2>
        {summary.methodology && (
          <span className="ml-auto text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
            {summary.methodology}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Section */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center bg-gray-800/50 rounded-xl p-6">
          <RadialGauge
            score={summary.overall_score || 0}
            label="Planetary Health Index"
            size={180}
            showGrade={true}
          />

          {summary.overall_interpretation && (
            <div
              className="mt-4 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: `${interpretationColor}20`,
                color: interpretationColor,
              }}
            >
              {summary.overall_interpretation}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ecosystem Type Card */}
          {summary.ecosystem_type && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  {ecosystemIcons[summary.ecosystem_type] || <Globe className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Ecosystem Type</h3>
                  <p className="text-lg font-semibold text-white">
                    {formatEcosystemType(summary.ecosystem_type)}
                  </p>
                </div>
              </div>

              {/* Adaptive Weights */}
              {summary.ecosystem_weights && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Adaptive Category Weights</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(summary.ecosystem_weights).map(([pillarId, weight]) => {
                      const pillarConfig = PILLAR_CONFIGS[pillarId];
                      return (
                        <div
                          key={pillarId}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: `${pillarConfig?.color}20`,
                            color: pillarConfig?.color || '#fff',
                          }}
                        >
                          <span className="font-semibold">{pillarId}</span>
                          <span className="opacity-70">
                            {typeof weight === 'number' ? `${(weight * 100).toFixed(0)}%` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Data Quality Score */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-medium text-gray-400">Data Quality Score (DQS)</h3>
              </div>
              <div
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ backgroundColor: `${dqsInfo.color}20`, color: dqsInfo.color }}
              >
                {dqsInfo.level}
              </div>
            </div>

            {/* DQS Progress Bar */}
            <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary.data_quality_score || 0}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute h-full rounded-full"
                style={{ backgroundColor: dqsInfo.color }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-lg font-bold text-white">
                {summary.data_quality_score?.toFixed(1) || 0}%
              </span>
              <span className="text-xs text-gray-400">{dqsInfo.description}</span>
            </div>

            {/* DQS Recommendation */}
            {summary.dqs_recommendation && (
              <p className="mt-2 text-xs text-gray-400 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {summary.dqs_recommendation}
              </p>
            )}
          </motion.div>

          {/* ESV Multiplier & Missing Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ESV Multiplier */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-medium text-gray-400">ESV Multiplier</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatESVMultiplier(summary.esv_multiplier)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Ecosystem Service Value adjustment
              </p>
            </motion.div>

            {/* Missing Critical Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {summary.missing_critical_metrics && summary.missing_critical_metrics.length > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                <h3 className="text-sm font-medium text-gray-400">Critical Metrics</h3>
              </div>

              {summary.missing_critical_metrics && summary.missing_critical_metrics.length > 0 ? (
                <div>
                  <p className="text-sm text-amber-400 font-medium">
                    {summary.missing_critical_metrics.length} missing
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {summary.missing_critical_metrics.slice(0, 3).map((metric) => (
                      <span
                        key={metric}
                        className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded"
                      >
                        {metric}
                      </span>
                    ))}
                    {summary.missing_critical_metrics.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{summary.missing_critical_metrics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-emerald-400 font-medium">All available</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pillar Scores Bar */}
      {summary.pillar_scores && Object.keys(summary.pillar_scores).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-gray-800/50 rounded-xl p-4"
        >
          <h3 className="text-sm font-medium text-gray-400 mb-3">Category Scores</h3>
          <div className="grid grid-cols-5 gap-2">
            {['A', 'B', 'C', 'D', 'E'].map((pillarId) => {
              const score = summary.pillar_scores[pillarId];
              const config = PILLAR_CONFIGS[pillarId];
              const weight = summary.ecosystem_weights?.[pillarId];

              return (
                <div key={pillarId} className="text-center">
                  <div
                    className="h-24 rounded-lg flex flex-col items-center justify-end p-2 relative overflow-hidden"
                    style={{ backgroundColor: `${config?.color}15` }}
                  >
                    {/* Score bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${score || 0}%` }}
                      transition={{ duration: 1, delay: 0.7 + parseInt(pillarId.charCodeAt(0).toString()) * 0.1 }}
                      className="absolute bottom-0 left-0 right-0 rounded-b-lg"
                      style={{ backgroundColor: config?.color, opacity: 0.6 }}
                    />
                    <span className="relative z-10 text-lg font-bold text-white">
                      {score !== null && score !== undefined ? Math.round(score) : '-'}
                    </span>
                  </div>
                  <p className="text-xs font-medium mt-1" style={{ color: config?.color }}>
                    {config?.name || pillarId}
                  </p>
                  {typeof weight === 'number' && (
                    <p className="text-[10px] text-gray-500">{(weight * 100).toFixed(0)}%</p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PHIScoreSummary;
