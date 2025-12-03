/**
 * WeatherPanel Component
 * Displays comprehensive weather data including current conditions,
 * hourly forecasts, daily forecasts, and soil data
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Waves
} from 'lucide-react';
import {
  WeatherResponse,
  SoilDataResponse,
  getWeatherIcon,
  getUVCategory,
  formatTime,
  formatDate,
  getWindDirection
} from '@/types/weather';

interface WeatherPanelProps {
  weather: WeatherResponse | null;
  soil?: SoilDataResponse | null;
  loading?: boolean;
  error?: string | null;
}

// Current Weather Card
const CurrentWeatherCard: React.FC<{ current: WeatherResponse['current']; location: WeatherResponse['location'] }> = ({
  current,
  location
}) => {
  const weatherIcon = getWeatherIcon(current.weather.code);
  const uvData = null; // UV comes from daily

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-blue-100 text-sm">{location.timezone}</p>
          <p className="text-blue-100 text-xs">Elevation: {location.elevation}m</p>
        </div>
        <span className="text-4xl">{weatherIcon}</span>
      </div>

      <div className="mb-4">
        <div className="flex items-end gap-2">
          <span className="text-6xl font-bold">{Math.round(current.temperature.value)}</span>
          <span className="text-2xl mb-2">°C</span>
        </div>
        <p className="text-blue-100">Feels like {Math.round(current.temperature.feels_like)}°C</p>
        <p className="text-lg font-medium mt-1">{current.weather.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          <span className="text-sm">{current.humidity.value}% Humidity</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4" />
          <span className="text-sm">{Math.round(current.wind.speed)} km/h {getWindDirection(current.wind.direction)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          <span className="text-sm">{current.cloud_cover.value}% Clouds</span>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          <span className="text-sm">{Math.round(current.pressure.sea_level)} hPa</span>
        </div>
      </div>
    </div>
  );
};

// Hourly Forecast Card
const HourlyForecastCard: React.FC<{ hourly: WeatherResponse['hourly'] }> = ({ hourly }) => {
  const [showAll, setShowAll] = useState(false);
  const displayHours = showAll ? 48 : 24;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Hourly Forecast
        </h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-blue-500 text-sm flex items-center gap-1 hover:underline"
        >
          {showAll ? 'Show Less' : 'Show More'}
          {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
          {hourly.time.slice(0, displayHours).map((time, index) => (
            <div
              key={time}
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl min-w-[70px] hover:bg-blue-50 transition-colors"
            >
              <span className="text-xs text-gray-500">{formatTime(time)}</span>
              <span className="text-xl my-1">{getWeatherIcon(hourly.weather_code[index])}</span>
              <span className="text-sm font-semibold">{Math.round(hourly.temperature_2m[index])}°</span>
              {hourly.precipitation_probability && (
                <span className="text-xs text-blue-500">{hourly.precipitation_probability[index]}%</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Daily Forecast Card
const DailyForecastCard: React.FC<{ daily: WeatherResponse['daily'] }> = ({ daily }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-500" />
        7-Day Forecast
      </h3>

      <div className="space-y-3">
        {daily.time.map((date, index) => {
          const uvData = getUVCategory(daily.uv_index_max?.[index] || 0);
          return (
            <div
              key={date}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center gap-3 w-32">
                <span className="text-2xl">{getWeatherIcon(daily.weather_code[index])}</span>
                <div>
                  <p className="font-medium text-gray-800">{formatDate(date)}</p>
                  <p className="text-xs text-gray-500">{daily.weather_description?.[index]}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Temperature */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-red-500">{Math.round(daily.temperature_2m_max[index])}°</p>
                  <p className="text-sm text-blue-500">{Math.round(daily.temperature_2m_min[index])}°</p>
                </div>

                {/* Precipitation */}
                <div className="text-center w-16">
                  <p className="text-xs text-gray-500">Rain</p>
                  <p className="text-sm font-medium">{daily.precipitation_sum?.[index]?.toFixed(1) || 0} mm</p>
                </div>

                {/* UV Index */}
                <div className="text-center w-16">
                  <p className="text-xs text-gray-500">UV</p>
                  <p className="text-sm font-medium" style={{ color: uvData.color }}>
                    {daily.uv_index_max?.[index]?.toFixed(1) || 'N/A'}
                  </p>
                </div>

                {/* Sunrise/Sunset */}
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                  <Sunrise className="w-3 h-3" />
                  {daily.sunrise?.[index] ? formatTime(daily.sunrise[index]) : 'N/A'}
                  <Sunset className="w-3 h-3 ml-2" />
                  {daily.sunset?.[index] ? formatTime(daily.sunset[index]) : 'N/A'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Soil Data Card
const SoilDataCard: React.FC<{ hourly: WeatherResponse['hourly'] }> = ({ hourly }) => {
  // Get current (first) values
  const soilMoisture0_1 = hourly.soil_moisture_0_to_1cm?.[0];
  const soilMoisture1_3 = hourly.soil_moisture_1_to_3cm?.[0];
  const soilMoisture3_9 = hourly.soil_moisture_3_to_9cm?.[0];
  const soilMoisture9_27 = hourly.soil_moisture_9_to_27cm?.[0];
  const soilTemp0 = hourly.soil_temperature_0cm?.[0];
  const soilTemp6 = hourly.soil_temperature_6cm?.[0];

  const avgMoisture = [soilMoisture0_1, soilMoisture1_3, soilMoisture3_9, soilMoisture9_27]
    .filter(v => v !== undefined && v !== null)
    .reduce((sum, v, _, arr) => sum + v / arr.length, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Waves className="w-5 h-5 text-amber-600" />
        Soil Conditions
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Soil Moisture */}
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-700 mb-2">Soil Moisture</p>
          <p className="text-3xl font-bold text-amber-600">
            {avgMoisture ? (avgMoisture * 100).toFixed(1) : 'N/A'}%
          </p>
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>0-1cm:</span>
              <span>{soilMoisture0_1 ? (soilMoisture0_1 * 100).toFixed(1) : 'N/A'}%</span>
            </div>
            <div className="flex justify-between">
              <span>1-3cm:</span>
              <span>{soilMoisture1_3 ? (soilMoisture1_3 * 100).toFixed(1) : 'N/A'}%</span>
            </div>
            <div className="flex justify-between">
              <span>3-9cm:</span>
              <span>{soilMoisture3_9 ? (soilMoisture3_9 * 100).toFixed(1) : 'N/A'}%</span>
            </div>
            <div className="flex justify-between">
              <span>9-27cm:</span>
              <span>{soilMoisture9_27 ? (soilMoisture9_27 * 100).toFixed(1) : 'N/A'}%</span>
            </div>
          </div>
        </div>

        {/* Soil Temperature */}
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-sm text-orange-700 mb-2">Soil Temperature</p>
          <p className="text-3xl font-bold text-orange-600">
            {soilTemp0 !== undefined ? Math.round(soilTemp0) : 'N/A'}°C
          </p>
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Surface (0cm):</span>
              <span>{soilTemp0 !== undefined ? soilTemp0.toFixed(1) : 'N/A'}°C</span>
            </div>
            <div className="flex justify-between">
              <span>Depth (6cm):</span>
              <span>{soilTemp6 !== undefined ? soilTemp6.toFixed(1) : 'N/A'}°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Atmospheric Details Card
const AtmosphericDetailsCard: React.FC<{ hourly: WeatherResponse['hourly']; daily: WeatherResponse['daily'] }> = ({
  hourly,
  daily
}) => {
  const visibility = hourly.visibility?.[0];
  const evapotranspiration = hourly.evapotranspiration?.[0];
  const vpd = hourly.vapour_pressure_deficit?.[0];
  const cloudLow = hourly.cloud_cover_low?.[0];
  const cloudMid = hourly.cloud_cover_mid?.[0];
  const cloudHigh = hourly.cloud_cover_high?.[0];
  const uvMax = daily.uv_index_max?.[0];
  const uvData = getUVCategory(uvMax || 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-indigo-500" />
        Atmospheric Details
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Visibility */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Eye className="w-6 h-6 mx-auto text-gray-500 mb-2" />
          <p className="text-xs text-gray-500">Visibility</p>
          <p className="text-lg font-semibold">
            {visibility ? (visibility / 1000).toFixed(1) : 'N/A'} km
          </p>
        </div>

        {/* UV Index */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Sun className="w-6 h-6 mx-auto mb-2" style={{ color: uvData.color }} />
          <p className="text-xs text-gray-500">UV Index</p>
          <p className="text-lg font-semibold" style={{ color: uvData.color }}>
            {uvMax?.toFixed(1) || 'N/A'} ({uvData.category})
          </p>
        </div>

        {/* Evapotranspiration */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-2" />
          <p className="text-xs text-gray-500">Evapotranspiration</p>
          <p className="text-lg font-semibold">{evapotranspiration?.toFixed(2) || 'N/A'} mm</p>
        </div>

        {/* VPD */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Droplets className="w-6 h-6 mx-auto text-blue-500 mb-2" />
          <p className="text-xs text-gray-500">Vapor Pressure Deficit</p>
          <p className="text-lg font-semibold">{vpd?.toFixed(2) || 'N/A'} kPa</p>
        </div>

        {/* Cloud Layers */}
        <div className="bg-gray-50 rounded-xl p-4 col-span-2">
          <Cloud className="w-6 h-6 mx-auto text-gray-500 mb-2" />
          <p className="text-xs text-gray-500 text-center mb-2">Cloud Layers</p>
          <div className="flex justify-around text-sm">
            <div className="text-center">
              <p className="font-semibold">{cloudLow ?? 'N/A'}%</p>
              <p className="text-xs text-gray-400">Low</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{cloudMid ?? 'N/A'}%</p>
              <p className="text-xs text-gray-400">Mid</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{cloudHigh ?? 'N/A'}%</p>
              <p className="text-xs text-gray-400">High</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main WeatherPanel Component
const WeatherPanel: React.FC<WeatherPanelProps> = ({ weather, soil, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!weather || !weather.available) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <Cloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Weather data not available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Current Weather + Soil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentWeatherCard current={weather.current} location={weather.location} />
        <SoilDataCard hourly={weather.hourly} />
      </div>

      {/* Hourly Forecast */}
      <HourlyForecastCard hourly={weather.hourly} />

      {/* Daily Forecast */}
      <DailyForecastCard daily={weather.daily} />

      {/* Atmospheric Details */}
      <AtmosphericDetailsCard hourly={weather.hourly} daily={weather.daily} />

      {/* Data Source Info */}
      <div className="text-center text-xs text-gray-400 py-2">
        Data provided by Open-Meteo Weather API | Updated: {weather.current?.time ? formatTime(weather.current.time) : 'N/A'}
        {weather.cached && <span className="ml-2 text-green-500">(cached)</span>}
      </div>
    </motion.div>
  );
};

export default WeatherPanel;
