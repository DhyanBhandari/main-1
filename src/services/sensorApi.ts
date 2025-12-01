/**
 * Sensor Data API Service
 *
 * Frontend service for fetching sensor data from the backend API.
 * The backend caches data for 30 minutes to reduce Firestore costs.
 */

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type SensorType = 'indoor' | 'outdoor';

export interface SensorReading {
  id: string;
  co2: number;
  temperature: number;
  humidity: number;
  pressure: number;
  light: number;
  device: string;
  time: string;
  createdAt?: string;
}

export interface DailyAggregate {
  date: string;
  avgCo2: number;
  avgTemperature: number;
  avgHumidity: number;
  avgPressure: number;
  avgLight: number;
  readingCount: number;
}

export interface SensorDataResponse {
  success: boolean;
  data?: SensorReading[];
  latest?: SensorReading;
  dailyAggregates?: DailyAggregate[];
  cached?: boolean;
  error?: string;
}

export interface CompareResponse {
  indoor: SensorDataResponse;
  outdoor: SensorDataResponse;
}

export interface CacheStatus {
  status: string;
  ttl_minutes: number;
  cache_info: {
    cached_keys: string[];
    ttl_seconds: number;
    cache_size: number;
  };
}

/**
 * Fetch latest sensor readings
 */
export async function fetchLatestReadings(
  type: SensorType,
  limit: number = 50
): Promise<SensorDataResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sensors/${type}/readings?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch readings',
    };
  }
}

/**
 * Fetch the most recent sensor reading
 */
export async function fetchLatestReading(
  type: SensorType
): Promise<SensorDataResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sensors/${type}/latest`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch latest reading',
    };
  }
}

/**
 * Fetch daily aggregated data for charts
 */
export async function fetchDailyAggregates(
  type: SensorType,
  days: number = 7
): Promise<SensorDataResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sensors/${type}/aggregates?days=${days}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching aggregates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch aggregates',
    };
  }
}

/**
 * Fetch all sensor data in a single request (most efficient)
 */
export async function fetchAllSensorData(
  type: SensorType,
  limit: number = 50,
  days: number = 7
): Promise<SensorDataResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sensors/${type}/all?limit=${limit}&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all sensor data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sensor data',
    };
  }
}

/**
 * Fetch both indoor and outdoor data for comparison
 */
export async function fetchComparedData(
  limit: number = 50,
  days: number = 7
): Promise<CompareResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sensors/compare?limit=${limit}&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching compared data:', error);
    const errorResponse: SensorDataResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data',
    };
    return {
      indoor: errorResponse,
      outdoor: errorResponse,
    };
  }
}

/**
 * Force refresh of cached data
 */
export async function refreshCache(
  type?: SensorType
): Promise<{ status: string; sensor_type: string }> {
  try {
    const url = type
      ? `${API_BASE_URL}/api/sensors/refresh?sensor_type=${type}`
      : `${API_BASE_URL}/api/sensors/refresh`;

    const response = await fetch(url, { method: 'POST' });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error refreshing cache:', error);
    return {
      status: 'error',
      sensor_type: type || 'all',
    };
  }
}

/**
 * Get cache status
 */
export async function getCacheStatus(): Promise<CacheStatus | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sensors/cache/status`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cache status:', error);
    return null;
  }
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  fetchLatestReadings,
  fetchLatestReading,
  fetchDailyAggregates,
  fetchAllSensorData,
  fetchComparedData,
  refreshCache,
  getCacheStatus,
  checkApiHealth,
};
