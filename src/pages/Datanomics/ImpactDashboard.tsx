/**
 * Impact Dashboard - Redesigned with new chart visualizations
 * Replaces old Impact Analysis with animated, responsive charts
 */

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wind, Thermometer, Droplets, RefreshCw, Activity } from "lucide-react";
import { useEnvironmentalScore } from "@/hooks/useEnvironmentalScore";
import {
  RadialGauge,
  PolarAreaChart,
  BarChart
} from "@/components/charts";

// Animated counter component
const AnimatedCounter = ({
  value,
  label,
  unit,
  icon: Icon,
  color = '#16a34a',
  delay = 0
}: {
  value: number | string;
  label: string;
  unit: string;
  icon: React.ElementType;
  color?: string;
  delay?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    if (typeof value !== 'number') return;

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(numericValue * easeOutQuart);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => requestAnimationFrame(animate), delay);
    return () => clearTimeout(timeout);
  }, [numericValue, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold" style={{ color }}>
          {typeof value === 'number' ? displayValue.toFixed(1) : value}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
    </motion.div>
  );
};

const ImpactDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const {
    indoorScore,
    outdoorScore,
    indoorDisplay,
    indoorInterpretation,
    loading,
    hasData,
    refresh,
  } = useEnvironmentalScore(50, 7);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("impact");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Prepare polar area chart data from actual scores
  const polarData = useMemo(() => {
    const metrics = indoorScore?.metrics || {};
    return {
      labels: ['Air Quality', 'Temperature', 'Humidity', 'Light', 'Pressure'],
      data: [
        metrics.co2?.score || 0,
        metrics.temperature?.score || 0,
        metrics.humidity?.score || 0,
        metrics.light?.score || 0,
        metrics.pressure?.score || 0,
      ],
    };
  }, [indoorScore]);

  // Bar chart data for metric comparison
  const barChartData = useMemo(() => {
    const metrics = indoorScore?.metrics || {};
    return {
      labels: ['CO2', 'Temp', 'Humidity', 'Light', 'Pressure'],
      datasets: [{
        label: 'Your Score',
        data: [
          metrics.co2?.score || 0,
          metrics.temperature?.score || 0,
          metrics.humidity?.score || 0,
          metrics.light?.score || 0,
          metrics.pressure?.score || 0,
        ],
        backgroundColor: [
          metrics.co2?.color || '#22c55e',
          metrics.temperature?.color || '#3b82f6',
          metrics.humidity?.color || '#f97316',
          metrics.light?.color || '#a855f7',
          metrics.pressure?.color || '#ef4444',
        ],
      }],
    };
  }, [indoorScore]);

  // Get current metric values for counters
  const metrics = indoorScore?.metrics || {};

  return (
    <section id="impact" className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Environmental Insights
            </h2>
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-2"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {hasData ? indoorInterpretation : 'Connecting to environmental sensors...'}
          </p>
        </motion.div>

        {/* Hero Stats Row - Radial Gauge + Animated Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 lg:mb-16">
          {/* Main Radial Gauge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-2 lg:col-span-1 bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex items-center justify-center"
          >
            <RadialGauge
              score={hasData ? indoorScore?.overallScore || 0 : 0}
              label="Overall Score"
              size={180}
              showGrade={true}
            />
          </motion.div>

          {/* Metric Counters */}
          <AnimatedCounter
            value={metrics.co2?.value || 0}
            label="CO2 Level"
            unit="ppm"
            icon={Wind}
            color={metrics.co2?.color || '#22c55e'}
            delay={300}
          />
          <AnimatedCounter
            value={metrics.temperature?.value || 0}
            label="Temperature"
            unit="°C"
            icon={Thermometer}
            color={metrics.temperature?.color || '#3b82f6'}
            delay={400}
          />
          <AnimatedCounter
            value={metrics.humidity?.value || 0}
            label="Humidity"
            unit="%"
            icon={Droplets}
            color={metrics.humidity?.color || '#f97316'}
            delay={500}
          />
        </div>

        {/* Main Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* Polar Area Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100"
          >
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Metric Distribution
              </h3>
              <p className="text-sm text-gray-500">
                Environmental factor scores on a 0-100 scale
              </p>
            </div>
            <div className="h-[280px] sm:h-[320px] lg:h-[350px]">
              {hasData ? (
                <PolarAreaChart
                  labels={polarData.labels}
                  data={polarData.data}
                  height={350}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  {loading ? 'Loading...' : 'No data available'}
                </div>
              )}
            </div>
          </motion.div>

          {/* Bar Chart - Score Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100"
          >
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Score Comparison
              </h3>
              <p className="text-sm text-gray-500">
                Individual metric scores
              </p>
            </div>
            <div className="h-[280px] sm:h-[320px] lg:h-[350px]">
              {hasData ? (
                <BarChart
                  labels={barChartData.labels}
                  datasets={barChartData.datasets}
                  height={350}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  {loading ? 'Loading...' : 'No data available'}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Score Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex justify-center gap-4 sm:gap-6 flex-wrap"
        >
          {[
            { grade: 'A', label: 'Excellent', color: '#16a34a' },
            { grade: 'B', label: 'Good', color: '#84cc16' },
            { grade: 'C', label: 'Fair', color: '#eab308' },
            { grade: 'D', label: 'Poor', color: '#f97316' },
            { grade: 'F', label: 'Critical', color: '#dc2626' },
          ].map(({ grade, label, color }) => (
            <div key={grade} className="flex items-center gap-2">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs sm:text-sm text-gray-500">
                {grade} - {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactDashboard;
