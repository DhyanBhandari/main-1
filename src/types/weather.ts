/**
 * TypeScript interfaces for Weather API
 * Matches the Open-Meteo Weather API response structure
 */

// Location information
export interface WeatherLocation {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
}

// Current weather conditions
export interface CurrentWeather {
  time: string;
  temperature: {
    value: number;
    unit: string;
    feels_like: number;
  };
  humidity: {
    value: number;
    unit: string;
  };
  precipitation: {
    value: number;
    rain: number;
    showers: number;
    snowfall: number;
    unit: string;
  };
  weather: {
    code: number;
    description: string;
    is_day: boolean;
  };
  cloud_cover: {
    value: number;
    unit: string;
  };
  pressure: {
    sea_level: number;
    surface: number;
    unit: string;
  };
  wind: {
    speed: number;
    direction: number;
    gusts: number;
    speed_unit: string;
    direction_unit: string;
  };
}

// Hourly forecast data
export interface HourlyForecast {
  time: string[];
  count: number;
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  showers: number[];
  snowfall: number[];
  weather_code: number[];
  pressure_msl: number[];
  surface_pressure: number[];
  cloud_cover: number[];
  cloud_cover_low: number[];
  cloud_cover_mid: number[];
  cloud_cover_high: number[];
  visibility: number[];
  evapotranspiration: number[];
  et0_fao_evapotranspiration: number[];
  vapour_pressure_deficit: number[];
  wind_speed_10m: number[];
  wind_speed_80m: number[];
  wind_direction_10m: number[];
  wind_direction_80m: number[];
  wind_gusts_10m: number[];
  soil_temperature_0cm: number[];
  soil_temperature_6cm: number[];
  soil_temperature_18cm: number[];
  soil_temperature_54cm: number[];
  soil_moisture_0_to_1cm: number[];
  soil_moisture_1_to_3cm: number[];
  soil_moisture_3_to_9cm: number[];
  soil_moisture_9_to_27cm: number[];
  soil_moisture_27_to_81cm: number[];
  units: Record<string, string>;
}

// Daily forecast data
export interface DailyForecast {
  time: string[];
  count: number;
  weather_code: number[];
  weather_description: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  daylight_duration: number[];
  sunshine_duration: number[];
  uv_index_max: number[];
  uv_index_clear_sky_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  showers_sum: number[];
  snowfall_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
  shortwave_radiation_sum: number[];
  et0_fao_evapotranspiration: number[];
  units: Record<string, string>;
}

// Full weather response
export interface WeatherResponse {
  source: string;
  available: boolean;
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  units: {
    current: Record<string, string>;
    hourly: Record<string, string>;
    daily: Record<string, string>;
  };
  generation_time_ms: number;
  cached?: boolean;
}

// Soil data response
export interface SoilDataResponse {
  source: string;
  available: boolean;
  soil_moisture: {
    value: number | null;
    unit: string;
    quality: string;
  };
  soil_temperature: {
    surface: number | null;
    depth_6cm: number | null;
    unit: string;
  };
  cached?: boolean;
}

// Comprehensive external data response
export interface ComprehensiveExternalData {
  air_quality: {
    sources: string[];
    primary_aqi: number | null;
    aqi_category: string;
    confidence: string;
    pollutants: Record<string, { value: number; unit: string; description: string }>;
    uv_index?: { value: number; unit: string; category: string };
    ground_truth_available: boolean;
  };
  weather: WeatherResponse;
  soil: SoilDataResponse;
  sources: string[];
}

// Weather code to icon mapping
export const WEATHER_ICONS: Record<number, string> = {
  0: '☀️',   // Clear sky
  1: '🌤️',   // Mainly clear
  2: '⛅',   // Partly cloudy
  3: '☁️',   // Overcast
  45: '🌫️',  // Foggy
  48: '🌫️',  // Depositing rime fog
  51: '🌦️',  // Light drizzle
  53: '🌦️',  // Moderate drizzle
  55: '🌧️',  // Dense drizzle
  56: '🌨️',  // Light freezing drizzle
  57: '🌨️',  // Dense freezing drizzle
  61: '🌧️',  // Slight rain
  63: '🌧️',  // Moderate rain
  65: '🌧️',  // Heavy rain
  66: '🌨️',  // Light freezing rain
  67: '🌨️',  // Heavy freezing rain
  71: '🌨️',  // Slight snowfall
  73: '❄️',  // Moderate snowfall
  75: '❄️',  // Heavy snowfall
  77: '🌨️',  // Snow grains
  80: '🌦️',  // Slight rain showers
  81: '🌧️',  // Moderate rain showers
  82: '⛈️',  // Violent rain showers
  85: '🌨️',  // Slight snow showers
  86: '❄️',  // Heavy snow showers
  95: '⛈️',  // Thunderstorm
  96: '⛈️',  // Thunderstorm with slight hail
  99: '⛈️',  // Thunderstorm with heavy hail
};

// Get weather icon from code
export const getWeatherIcon = (code: number): string => {
  return WEATHER_ICONS[code] || '🌡️';
};

// Get UV index category and color
export const getUVCategory = (uv: number): { category: string; color: string } => {
  if (uv < 3) return { category: 'Low', color: '#22c55e' };
  if (uv < 6) return { category: 'Moderate', color: '#f59e0b' };
  if (uv < 8) return { category: 'High', color: '#f97316' };
  if (uv < 11) return { category: 'Very High', color: '#ef4444' };
  return { category: 'Extreme', color: '#7c3aed' };
};

// Format time for display
export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format date for display
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

// Get wind direction as compass
export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};
