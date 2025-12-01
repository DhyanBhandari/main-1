/**
 * Custom Hook for Sensor Data Fetching
 *
 * Direct Firestore connection - no backend required.
 * Fetches data directly from Firebase Firestore.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getLatestReadings,
  getLatestReading,
  getDailyAggregates,
  subscribeToLatest,
} from '@/db/sensorService';
import { SensorReading, DailyAggregate, SensorType } from '@/db/types';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes for direct Firestore (was 30 for cached backend)

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

      // Fetch all data directly from Firestore in parallel
      const [readings, latestReading, aggregates] = await Promise.all([
        getLatestReadings(type, limit),
        getLatestReading(type),
        getDailyAggregates(type, days),
      ]);

      setData(readings);
      setLatest(latestReading);
      setDailyAggregates(aggregates);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
    } finally {
      setLoading(false);
    }
  }, [type, limit, days]);

  const forceRefresh = useCallback(async () => {
    // Direct Firestore - just refetch
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for periodic refresh
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

      // Fetch both indoor and outdoor data directly from Firestore in parallel
      const [
        indoorReadings,
        indoorLatest,
        indoorAggregates,
        outdoorReadings,
        outdoorLatest,
        outdoorAggregates,
      ] = await Promise.all([
        getLatestReadings('indoor', limit),
        getLatestReading('indoor'),
        getDailyAggregates('indoor', days),
        getLatestReadings('outdoor', limit),
        getLatestReading('outdoor'),
        getDailyAggregates('outdoor', days),
      ]);

      // Update indoor state
      setIndoor({
        data: indoorReadings,
        latest: indoorLatest,
        dailyAggregates: indoorAggregates,
        loading: false,
        error: null,
      });

      // Update outdoor state
      setOutdoor({
        data: outdoorReadings,
        latest: outdoorLatest,
        dailyAggregates: outdoorAggregates,
        loading: false,
        error: null,
      });
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

    // Set up interval for periodic refresh
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

/**
 * Hook for real-time sensor data updates
 */
export const useRealtimeSensorData = (
  type: SensorType,
  limit: number = 10
) => {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    try {
      // Subscribe to real-time updates
      const unsubscribe = subscribeToLatest(type, (readings) => {
        setData(readings);
        setLoading(false);
        setError(null);
      }, limit);

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to sensor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      setLoading(false);
    }
  }, [type, limit]);

  return {
    data,
    latest: data.length > 0 ? data[0] : null,
    loading,
    error,
  };
};

export default useSensorData;
