/**
 * Animated Radial Gauge Component
 * Displays overall score as an animated arc - fixes "25% but full green" issue
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RadialGaugeProps {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  showGrade?: boolean;
}

// Grade mapping based on score (AAA to CCC scale)
const getGradeInfo = (score: number) => {
  if (score >= 86) return { grade: 'AAA', label: 'Excellent', color: '#16a34a', bgColor: 'rgba(22, 163, 74, 0.15)' };
  if (score >= 72) return { grade: 'AA', label: 'Very Good', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' };
  if (score >= 58) return { grade: 'A', label: 'Good', color: '#84cc16', bgColor: 'rgba(132, 204, 22, 0.15)' };
  if (score >= 44) return { grade: 'BBB', label: 'Above Average', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)' };
  if (score >= 30) return { grade: 'BB', label: 'Average', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' };
  if (score >= 16) return { grade: 'B', label: 'Below Average', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' };
  return { grade: 'CCC', label: 'Poor', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.15)' };
};

export const RadialGauge = ({
  score,
  label = 'Environmental Score',
  size = 200,
  strokeWidth = 12,
  showGrade = true,
}: RadialGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const gradeInfo = getGradeInfo(score);

  // Calculate SVG parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animate the score on mount
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(score * easeOutQuart);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Calculate stroke dashoffset for the animated arc
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />

          {/* Animated progress arc with gradient */}
          <defs>
            <linearGradient id={`gaugeGradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradeInfo.color} stopOpacity="1" />
              <stop offset="100%" stopColor={gradeInfo.color} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#gaugeGradient-${label})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.1s ease-out',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <span className="text-3xl sm:text-4xl font-bold" style={{ color: gradeInfo.color }}>
              {Math.round(animatedScore)}
            </span>
            <span className="text-lg text-gray-400">/100</span>

            {showGrade && (
              <div className="mt-1">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: gradeInfo.bgColor, color: gradeInfo.color }}
                >
                  Grade {gradeInfo.grade} - {gradeInfo.label}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-3 text-sm font-medium text-gray-600"
      >
        {label}
      </motion.p>
    </motion.div>
  );
};

export default RadialGauge;
