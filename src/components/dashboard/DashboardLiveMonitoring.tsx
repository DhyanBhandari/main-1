/**
 * DashboardLiveMonitoring - Real-time weather and AQI display
 */

import { Thermometer, Droplets, Wind, Gauge, Cloud, Sun, Activity } from 'lucide-react';
import type { WeatherData, AQIData } from '@/types/dashboard';

interface DashboardLiveMonitoringProps {
  weather?: WeatherData;
  aqi?: AQIData;
}

const DashboardLiveMonitoring = ({ weather, aqi }: DashboardLiveMonitoringProps) => {
  if (!weather && !aqi) return null;

  const getAQIColor = (aqiValue: number) => {
    if (aqiValue <= 50) return 'text-green-600 bg-green-100';
    if (aqiValue <= 100) return 'text-yellow-600 bg-yellow-100';
    if (aqiValue <= 150) return 'text-orange-600 bg-orange-100';
    if (aqiValue <= 200) return 'text-red-600 bg-red-100';
    if (aqiValue <= 300) return 'text-purple-600 bg-purple-100';
    return 'text-maroon-600 bg-maroon-100';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Live Monitoring</h2>

      {/* Weather Data */}
      {weather && weather.available && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Current Weather
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {weather.current.temperature.value.toFixed(1)}°C
              </div>
              {weather.current.temperature.feels_like && (
                <div className="text-xs text-gray-500 mt-1">
                  Feels like {weather.current.temperature.feels_like.toFixed(1)}°C
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Humidity</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {weather.current.humidity.value.toFixed(0)}%
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Wind Speed</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {weather.current.wind.speed.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {weather.current.wind.unit}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Pressure</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {weather.current.pressure.sea_level.toFixed(0)}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {weather.current.pressure.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Weather Description */}
          {weather.current.weather.description && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
              <span className="text-sm font-medium text-blue-900 capitalize">
                {weather.current.weather.description}
              </span>
            </div>
          )}
        </div>
      )}

      {/* AQI Data */}
      {aqi && aqi.available && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Air Quality
          </h3>

          {/* AQI Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Air Quality Index (US AQI)</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${getAQIColor(
                  aqi.aqi.us_aqi
                )}`}
              >
                {aqi.aqi.category}
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{aqi.aqi.us_aqi.toFixed(0)}</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getAQIColor(aqi.aqi.us_aqi).replace('text-', 'bg-')}`}
                style={{ width: `${Math.min((aqi.aqi.us_aqi / 500) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Pollutants */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">PM2.5</div>
              <div className="text-lg font-bold text-gray-900">
                {aqi.pollutants.pm2_5.value.toFixed(1)}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {aqi.pollutants.pm2_5.unit}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">PM10</div>
              <div className="text-lg font-bold text-gray-900">
                {aqi.pollutants.pm10.value.toFixed(1)}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {aqi.pollutants.pm10.unit}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Ozone</div>
              <div className="text-lg font-bold text-gray-900">
                {aqi.pollutants.ozone.value.toFixed(1)}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {aqi.pollutants.ozone.unit}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">CO</div>
              <div className="text-lg font-bold text-gray-900">
                {aqi.pollutants.carbon_monoxide.value.toFixed(1)}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {aqi.pollutants.carbon_monoxide.unit}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">NO₂</div>
              <div className="text-lg font-bold text-gray-900">
                {aqi.pollutants.nitrogen_dioxide.value.toFixed(1)}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {aqi.pollutants.nitrogen_dioxide.unit}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Sun className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-600">UV Index</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {aqi.uv_index.value.toFixed(0)}
                <span className="text-xs font-normal text-gray-500 ml-1 capitalize">
                  ({aqi.uv_index.category})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLiveMonitoring;
