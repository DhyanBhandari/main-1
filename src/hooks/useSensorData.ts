/**
 * Custom Hook for Sensor Data Fetching
 *
 * Fetches data from the backend API which caches Firestore data
 * for 30 minutes to reduce costs.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAllSensorData,
  fetchComparedData,
  refreshCache,
  SensorReading,
  DailyAggregate,
  SensorType,
} from '@/services/sensorApi';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

interface UseSensorDataResult {
  data: SensorReading[];
  latest: SensorReading | null;
  dailyAggregates: DailyAggregate[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export const useSensorData = (
  type: SensorType,
  limit: number = 50,
  days: number = 7
): UseSensorDataResult => {
  const [data, setData] = useState<SensorReading[]>([]);
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [dailyAggregates, setDailyAggregates] = useState<DailyAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in a single API call (most efficient)
      const response = await fetchAllSensorData(type, limit, days);

      if (response.success) {
        setData(response.data || []);
        setLatest(response.latest || null);
        setDailyAggregates(response.dailyAggregates || []);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to fetch sensor data');
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
    } finally {
      setLoading(false);
    }
  }, [type, limit, days]);

  const forceRefresh = useCallback(async () => {
    try {
      setLoading(true);
      // First, clear the backend cache
      await refreshCache(type);
      // Then fetch fresh data
      await fetchData();
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [type, fetchData]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for periodic refresh (every 30 minutes)
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    latest,
    dailyAggregates,
    loading,
    error,
    lastUpdated,
    refresh: forceRefresh,
  };
};

/**
 * Hook for comparing indoor and outdoor data
 */
export const useComparedSensorData = (limit: number = 50, days: number = 7) => {
  const [indoor, setIndoor] = useState<{
    data: SensorReading[];
    latest: SensorReading | null;
    dailyAggregates: DailyAggregate[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    latest: null,
    dailyAggregates: [],
    loading: true,
    error: null,
  });

  const [outdoor, setOutdoor] = useState<{
    data: SensorReading[];
    latest: SensorReading | null;
    dailyAggregates: DailyAggregate[];
    loading: boolean;
    error: string | null;
  }>({
    data: [],
    latest: null,
    dailyAggregates: [],
    loading: true,
    error: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both indoor and outdoor in a single API call
      const response = await fetchComparedData(limit, days);

      // Update indoor state
      if (response.indoor.success) {
        setIndoor({
          data: response.indoor.data || [],
          latest: response.indoor.latest || null,
          dailyAggregates: response.indoor.dailyAggregates || [],
          loading: false,
          error: null,
        });
      } else {
        setIndoor(prev => ({
          ...prev,
          loading: false,
          error: response.indoor.error || 'Failed to fetch indoor data',
        }));
      }

      // Update outdoor state
      if (response.outdoor.success) {
        setOutdoor({
          data: response.outdoor.data || [],
          latest: response.outdoor.latest || null,
          dailyAggregates: response.outdoor.dailyAggregates || [],
          loading: false,
          error: null,
        });
      } else {
        setOutdoor(prev => ({
          ...prev,
          loading: false,
          error: response.outdoor.error || 'Failed to fetch outdoor data',
        }));
      }
    } catch (err) {
      console.error('Error fetching compared data:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMsg);
      setIndoor(prev => ({ ...prev, loading: false, error: errorMsg }));
      setOutdoor(prev => ({ ...prev, loading: false, error: errorMsg }));
    } finally {
      setLoading(false);
    }
  }, [limit, days]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for periodic refresh (every 30 minutes)
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    indoor,
    outdoor,
    loading: loading || indoor.loading || outdoor.loading,
    error: error || indoor.error || outdoor.error,
    refresh: fetchData,
  };
};

export default useSensorData;
