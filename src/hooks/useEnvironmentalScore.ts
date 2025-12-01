/**
 * useEnvironmentalScore Hook
 *
 * React hook for calculating and tracking Environmental Impact Scores
 * based on sensor data from the backend API.
 */

import { useMemo } from 'react';
import { useComparedSensorData } from './useSensorData';
import {
  calculateEnvironmentalScore,
  formatScoreDisplay,
  getScoreInterpretation,
  EnvironmentalScore,
} from '@/utils/impactScore';

interface UseEnvironmentalScoreResult {
  // Indoor environment score
  indoorScore: EnvironmentalScore;

  // Outdoor environment score (for comparison)
  outdoorScore: EnvironmentalScore;

  // Formatted display strings
  indoorDisplay: string;
  outdoorDisplay: string;

  // Interpretation messages
  indoorInterpretation: string;
  outdoorInterpretation: string;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Data availability
  hasData: boolean;

  // Refresh function
  refresh: () => void;
}

/**
 * Hook to get Environmental Impact Scores for indoor/outdoor sensors
 */
export function useEnvironmentalScore(
  limit: number = 50,
  days: number = 7
): UseEnvironmentalScoreResult {
  const { indoor, outdoor, loading, error, refresh } = useComparedSensorData(limit, days);

  // Calculate indoor score
  const indoorScore = useMemo(() => {
    if (!indoor.latest) {
      return calculateEnvironmentalScore(null);
    }

    return calculateEnvironmentalScore(
      {
        co2: indoor.latest.co2,
        temperature: indoor.latest.temperature,
        humidity: indoor.latest.humidity,
        light: indoor.latest.light,
        pressure: indoor.latest.pressure,
      },
      indoor.latest.time ? new Date(indoor.latest.time) : null
    );
  }, [indoor.latest]);

  // Calculate outdoor score
  const outdoorScore = useMemo(() => {
    if (!outdoor.latest) {
      return calculateEnvironmentalScore(null);
    }

    return calculateEnvironmentalScore(
      {
        co2: outdoor.latest.co2,
        temperature: outdoor.latest.temperature,
        humidity: outdoor.latest.humidity,
        light: outdoor.latest.light,
        pressure: outdoor.latest.pressure,
      },
      outdoor.latest.time ? new Date(outdoor.latest.time) : null
    );
  }, [outdoor.latest]);

  // Format display strings
  const indoorDisplay = useMemo(() => formatScoreDisplay(indoorScore), [indoorScore]);
  const outdoorDisplay = useMemo(() => formatScoreDisplay(outdoorScore), [outdoorScore]);

  // Get interpretation messages
  const indoorInterpretation = useMemo(() => getScoreInterpretation(indoorScore), [indoorScore]);
  const outdoorInterpretation = useMemo(() => getScoreInterpretation(outdoorScore), [outdoorScore]);

  // Check if we have any data
  const hasData = indoorScore.availableMetricsCount > 0 || outdoorScore.availableMetricsCount > 0;

  return {
    indoorScore,
    outdoorScore,
    indoorDisplay,
    outdoorDisplay,
    indoorInterpretation,
    outdoorInterpretation,
    loading,
    error,
    hasData,
    refresh,
  };
}

/**
 * Hook to get just the overall score (simplified)
 */
export function useOverallScore(): {
  score: number;
  grade: string;
  label: string;
  color: string;
  loading: boolean;
  hasData: boolean;
} {
  const { indoorScore, loading } = useEnvironmentalScore();

  return {
    score: indoorScore.overallScore,
    grade: indoorScore.overallGrade,
    label: indoorScore.overallLabel,
    color: indoorScore.overallColor,
    loading,
    hasData: indoorScore.availableMetricsCount > 0,
  };
}

export default useEnvironmentalScore;
