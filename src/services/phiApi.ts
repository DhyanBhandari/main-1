/**
 * PHI API Service
 * Handles communication with the FastAPI backend for Planetary Health Index queries
 */

import { PHIQueryRequest, PHIResponse } from '@/types/phi';
import { transformPHIResponse } from './apiMiddleware';

// API Base URL - update this when deployed
const API_BASE_URL = import.meta.env.VITE_PHI_API_URL || 'http://localhost:8000';

/**
 * Query history item from the API
 */
export interface QueryHistoryItem {
  id: string;
  latitude: number;
  longitude: number;
  location_name: string | null;
  overall_score: number | null;
  pillar_scores: Record<string, number> | null;
  query_mode: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  pdf_downloaded: boolean;
  created_at: string;
}

/**
 * Query history response
 */
export interface QueryHistoryResponse {
  queries: QueryHistoryItem[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

/**
 * PHI query response with tracking
 */
export interface PHIQueryResponse extends PHIResponse {
  query_id?: string;
  location_name?: string;
}

/**
 * Fetch PHI report for a given location
 * @param request - Query parameters (latitude, longitude, mode, etc.)
 * @param userId - Firebase user ID (optional, defaults to 'anonymous')
 * @param userEmail - User email (optional)
 * @returns PHI response with pillars, metrics, and summary
 */
export const fetchPHIReport = async (
  request: PHIQueryRequest,
  userId?: string,
  userEmail?: string
): Promise<PHIQueryResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lat: request.latitude,
      lon: request.longitude,
      mode: request.mode || 'comprehensive',
      include_scores: true,
      user_id: userId || 'anonymous',
      user_email: userEmail || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Handle Pydantic validation errors (array of objects)
    let errorMessage = `API error: ${response.status}`;
    if (errorData.detail) {
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail
          .map((err: { msg?: string; loc?: string[] }) => err.msg || JSON.stringify(err))
          .join(', ');
      } else if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      }
    }
    throw new Error(errorMessage);
  }

  // Get raw response and transform through middleware
  const rawData = await response.json();

  // Use middleware to unwrap and validate response
  const phiResponse = transformPHIResponse(rawData);

  // Add query tracking info
  return {
    ...phiResponse,
    query_id: rawData.query_id,
    location_name: rawData.location_name,
  };
};

/**
 * Generate PDF report for a location
 * @param request - Query parameters
 * @param userId - Firebase user ID
 * @param userEmail - User email
 * @returns Blob of PDF file
 */
export const generatePDFReport = async (
  request: PHIQueryRequest,
  userId?: string,
  userEmail?: string
): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lat: request.latitude,
      lon: request.longitude,
      mode: 'comprehensive',
      include_scores: true,
      user_id: userId || 'anonymous',
      user_email: userEmail || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `PDF generation failed: ${response.status}`);
  }

  return response.blob();
};

/**
 * Get user's query history
 * @param userId - Firebase user ID
 * @param page - Page number (1-indexed)
 * @param perPage - Items per page (max 50)
 * @returns Paginated query history
 */
export const getQueryHistory = async (
  userId: string,
  page: number = 1,
  perPage: number = 10
): Promise<QueryHistoryResponse> => {
  const params = new URLSearchParams({
    user_id: userId,
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/history?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch query history: ${response.status}`);
  }

  return response.json();
};

/**
 * Get details of a specific query
 * @param queryId - Query UUID
 * @returns Query details
 */
export const getQueryDetails = async (queryId: string): Promise<QueryHistoryItem> => {
  const response = await fetch(`${API_BASE_URL}/api/query/${queryId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch query details: ${response.status}`);
  }

  return response.json();
};

/**
 * Mark PDF as downloaded
 * @param queryId - Query UUID
 */
export const markPDFDownloaded = async (queryId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/query/${queryId}/downloaded`, {
    method: 'POST',
  });

  if (!response.ok) {
    console.error('Failed to mark PDF as downloaded');
  }
};

/**
 * Get user statistics
 * @param userId - Firebase user ID
 * @returns User stats (total queries, PDFs generated, etc.)
 */
export const getUserStats = async (userId: string): Promise<{
  total_queries: number;
  pdfs_generated: number;
  recent_queries: Array<{
    id: string;
    location_name: string | null;
    overall_score: number | null;
    created_at: string;
  }>;
}> => {
  const response = await fetch(`${API_BASE_URL}/api/user/${userId}/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch user stats: ${response.status}`);
  }

  return response.json();
};

/**
 * Get real-time air quality from external APIs
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Air quality data from Open-Meteo and OpenAQ
 */
export const getRealTimeAirQuality = async (
  lat: number,
  lon: number
): Promise<{
  sources: string[];
  primary_aqi: number | null;
  confidence: string;
  pollutants: Record<string, { value: number; unit: string }>;
  ground_truth_available: boolean;
  uv_index?: { value: number; category: string };
}> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/external/air-quality?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch air quality: ${response.status}`);
  }

  return response.json();
};

/**
 * Get weather forecast data
 * @param lat - Latitude
 * @param lon - Longitude
 * @param forecastDays - Number of forecast days (1-16)
 * @returns Weather data with current, hourly, and daily forecasts
 */
export const getWeatherForecast = async (
  lat: number,
  lon: number,
  forecastDays: number = 7
): Promise<import('@/types/weather').WeatherResponse> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    forecast_days: forecastDays.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/external/weather?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.status}`);
  }

  return response.json();
};

/**
 * Get soil moisture and temperature data
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Soil data from Open-Meteo
 */
export const getSoilData = async (
  lat: number,
  lon: number
): Promise<import('@/types/weather').SoilDataResponse> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/external/soil?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch soil data: ${response.status}`);
  }

  return response.json();
};

/**
 * Get all external data (air quality + weather + soil) in one request
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Comprehensive external data
 */
export const getComprehensiveExternalData = async (
  lat: number,
  lon: number
): Promise<import('@/types/weather').ComprehensiveExternalData> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/external/comprehensive?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch external data: ${response.status}`);
  }

  return response.json();
};

/**
 * Check API health status
 * @returns Health check response
 */
export const checkAPIHealth = async (): Promise<{
  status: string;
  message: string;
  timestamp: string;
  gee_initialized: boolean;
}> => {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Get available metrics for a given mode
 * @param mode - 'simple' or 'comprehensive'
 * @returns Metrics available for each pillar
 */
export const getAvailableMetrics = async (
  mode: 'simple' | 'comprehensive' = 'comprehensive'
): Promise<Record<string, string[]>> => {
  const response = await fetch(`${API_BASE_URL}/api/datasets?mode=${mode}`);

  if (!response.ok) {
    throw new Error(`Failed to get metrics: ${response.status}`);
  }

  return response.json();
};

/**
 * Custom hook helper - formats error messages for user display
 */
export const formatAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    // Parse common error messages
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please ensure the backend is running.';
    }
    if (error.message.includes('Latitude must be')) {
      return 'Invalid latitude. Please enter a value between -90 and 90.';
    }
    if (error.message.includes('Longitude must be')) {
      return 'Invalid longitude. Please enter a value between -180 and 180.';
    }
    if (error.message.includes('Earth Engine')) {
      return 'Remote sensing service unavailable. Please try again later.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Estimate query time based on mode
 */
export const estimateQueryTime = (mode: 'simple' | 'comprehensive'): string => {
  return mode === 'simple' ? '15-20 seconds' : '25-35 seconds';
};

/**
 * Imagery type metadata
 */
export interface ImageryType {
  id: string;
  name: string;
  source: string;
  description: string;
  technology: string;
}

/**
 * Single imagery result
 */
export interface ImageryResult {
  url?: string;
  available: boolean;
  capture_date?: string;
  source?: string;
  description?: string;
  error?: string;
  legend?: {
    min?: { value: number; label: string; color: string };
    max?: { value: number; label: string; color: string };
    classes?: Array<{ value: number; label: string; color: string }>;
  };
}

/**
 * Complete imagery response
 */
export interface ImageryResponse {
  location: { lat: number; lon: number };
  buffer_km: number;
  generated_at: string;
  imagery: {
    true_color?: ImageryResult;
    ndvi?: ImageryResult;
    lst?: ImageryResult;
    land_cover?: ImageryResult;
    forest_cover?: ImageryResult;
  };
}

/**
 * Get remote sensing imagery for a location
 * @param lat - Latitude
 * @param lon - Longitude
 * @param bufferKm - Buffer radius in km (default 5)
 * @param imageSize - Image size in pixels (default 512)
 * @returns Imagery URLs and metadata
 */
export const getImagery = async (
  lat: number,
  lon: number,
  bufferKm: number = 5,
  imageSize: number = 512
): Promise<ImageryResponse> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    buffer_km: bufferKm.toString(),
    image_size: imageSize.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/imagery?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch imagery: ${response.status}`);
  }

  return response.json();
};

/**
 * Get available imagery types
 * @returns List of imagery types with metadata
 */
export const getImageryTypes = async (): Promise<{ types: ImageryType[] }> => {
  const response = await fetch(`${API_BASE_URL}/api/imagery/types`);

  if (!response.ok) {
    throw new Error(`Failed to fetch imagery types: ${response.status}`);
  }

  return response.json();
};
