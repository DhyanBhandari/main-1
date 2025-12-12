/**
 * Ecosystem Service Value Breakdown Component
 * Displays detailed ESV with charts, projections, and service breakdown
 * White theme version with 5-year projections
 */

import { motion } from 'framer-motion';
import {
  DollarSign,
  Leaf,
  Droplets,
  Wind,
  Trees,
  Users,
  Flower2,
  Mountain,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  Sprout,
} from 'lucide-react';
import { DoughnutChart, LineChart, BarChart, AreaChart } from './charts';
import {
  calculateESVBreakdown,
  formatCurrency,
  formatMultiplierPercent,
  getMultiplierDescription,
} from '../utils/esvCalculation';
import {
  calculateAllProjections,
  formatForLineChart,
  formatForCarbonAreaChart,
  formatForComparisonBarChart,
  formatProjectedValue,
  formatGrowthPercent,
  PROJECTION_SCENARIOS,
} from '../utils/esvProjection';
import { EcosystemType } from '../types/phi';

interface ESVBreakdownProps {
  phiScore: number;
  ecosystemType?: EcosystemType | string;
  className?: string;
}

// Icon mapping for services
const serviceIcons: Record<string, React.ReactNode> = {
  Leaf: <Leaf className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  Wind: <Wind className="w-4 h-4" />,
  Trees: <Trees className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Flower2: <Flower2 className="w-4 h-4" />,
  Mountain: <Mountain className="w-4 h-4" />,
};

export const ESVBreakdown = ({
  phiScore,
  ecosystemType = 'default',
  className = '',
}: ESVBreakdownProps) => {
  const esv = calculateESVBreakdown(phiScore, ecosystemType);
  const isPositiveMultiplier = esv.phiMultiplier >= 0;

  // Calculate projections
  const projections = calculateAllProjections(esv.adjustedValue, phiScore);
  const lineChartData = formatForLineChart(projections);
  const carbonAreaData = formatForCarbonAreaChart(projections);
  const comparisonBarData = formatForComparisonBarChart(projections);

  return (
    <div className={`bg-white border border-gray-200 shadow-lg rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-900">Land Ecosystem Value</h2>
      </div>

      {/* Current Value Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Donut Chart & Total */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex flex-col items-center">
            {/* Donut Chart */}
            <div className="w-full max-w-[250px]">
              <DoughnutChart
                labels={esv.services.map(s => s.name)}
                data={esv.services.map(s => s.value)}
                colors={esv.services.map(s => s.color)}
                height={220}
                centerText={formatCurrency(esv.adjustedValue)}
              />
            </div>

            {/* Total Value */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Annual Ecosystem Service Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(esv.adjustedValue)}
                <span className="text-sm font-normal text-gray-500">/ha/year</span>
              </p>
            </div>

            {/* PHI Multiplier Effect */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 w-full"
            >
              <div
                className="flex items-center justify-between px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: isPositiveMultiplier
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <div className="flex items-center gap-2">
                  {isPositiveMultiplier ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">PHI Adjustment</span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: isPositiveMultiplier ? '#16a34a' : '#dc2626' }}
                >
                  {formatMultiplierPercent(esv.phiMultiplier)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {getMultiplierDescription(esv.phiMultiplier)}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right: Service Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Service Breakdown</h3>

          {esv.services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-gray-50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ color: service.color }}>
                    {serviceIcons[service.icon] || <Leaf className="w-4 h-4" />}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{service.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    ${service.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">({service.percentage}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${service.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: service.color }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 5-Year Projections Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border-t border-gray-200 pt-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900">5-Year Value Projections</h3>
        </div>

        {/* Line Chart */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <LineChartIcon className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-700">ESV Growth Over Time</h4>
          </div>
          <LineChart
            labels={lineChartData.labels}
            datasets={lineChartData.datasets}
            height={280}
          />
        </div>

        {/* Projection Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(['conservative', 'moderate', 'optimistic'] as const).map((scenario) => {
            const data = projections[scenario];
            const scenarioConfig = PROJECTION_SCENARIOS[scenario];
            return (
              <motion.div
                key={scenario}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-xl p-4 border-l-4"
                style={{ borderColor: scenarioConfig.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenarioConfig.color }}
                  />
                  <h4 className="text-sm font-semibold text-gray-900">
                    {scenarioConfig.label}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mb-3">{scenarioConfig.description}</p>

                <div className="space-y-2">
                  {data.projections.slice(1).map((proj) => (
                    <div key={proj.year} className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Year {proj.year}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatProjectedValue(proj.esv)}
                        </span>
                        <span
                          className="text-xs ml-1"
                          style={{ color: scenarioConfig.color }}
                        >
                          {formatGrowthPercent(esv.adjustedValue, proj.esv)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">5-Year Total Carbon</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {data.totalCarbon.toFixed(1)} tCO2/ha
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Carbon Sequestration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="border-t border-gray-200 pt-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sprout className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900">Carbon Sequestration Potential</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Cumulative Carbon Over 5 Years
            </h4>
            <AreaChart
              labels={carbonAreaData.labels}
              datasets={carbonAreaData.datasets}
              height={250}
              yAxisLabel="tCO2/ha"
              stacked={false}
            />
          </div>

          {/* Carbon Summary */}
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-emerald-800 mb-3">
                5-Year Carbon Storage by Scenario
              </h4>
              {(['optimistic', 'moderate', 'conservative'] as const).map((scenario) => {
                const data = projections[scenario];
                const scenarioConfig = PROJECTION_SCENARIOS[scenario];
                return (
                  <div
                    key={scenario}
                    className="flex items-center justify-between py-2 border-b border-emerald-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: scenarioConfig.color }}
                      />
                      <span className="text-sm text-gray-700">{scenarioConfig.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {data.totalCarbon.toFixed(1)} tCO2/ha
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                What does this mean?
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Carbon sequestration is the process by which trees and vegetation
                absorb CO2 from the atmosphere. The projections show how much carbon
                this land could store over 5 years based on different management
                scenarios. More active restoration leads to higher carbon capture.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Value Comparison Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="border-t border-gray-200 pt-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900">Value Comparison</h3>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            Current vs 5-Year Projected ESV
          </h4>
          <BarChart
            labels={comparisonBarData.labels}
            datasets={comparisonBarData.datasets}
            height={280}
          />
        </div>

        {/* Growth Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {(['conservative', 'moderate', 'optimistic'] as const).map((scenario) => {
            const data = projections[scenario];
            const scenarioConfig = PROJECTION_SCENARIOS[scenario];
            return (
              <motion.div
                key={scenario}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center p-4 bg-gray-50 rounded-xl"
              >
                <p className="text-xs text-gray-500 mb-1">{scenarioConfig.label} Growth</p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: scenarioConfig.color }}
                >
                  +{data.esvGrowthPercent}%
                </p>
                <p className="text-xs text-gray-500 mt-1">over 5 years</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex items-start gap-2 p-4 bg-blue-50 rounded-xl mt-8 border border-blue-100"
      >
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p>
            <span className="text-blue-600 font-medium">Ecosystem Type:</span>{' '}
            {esv.ecosystemType}
          </p>
          <p className="mt-1">
            <span className="text-blue-600 font-medium">Regional Factor:</span>{' '}
            {(esv.regionalFactor * 100).toFixed(0)}% (India adjusted)
          </p>
          <p className="mt-1">
            <span className="text-blue-600 font-medium">Baseline Value:</span>{' '}
            ${esv.baselineValue.toLocaleString()}/ha/year
          </p>
          <p className="mt-2 text-gray-500 italic">
            Projections are estimates based on typical ecosystem recovery rates.
            Actual results depend on land management practices and environmental conditions.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ESVBreakdown;
