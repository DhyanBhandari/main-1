/**
 * DashboardPillarSection - Individual pillar section with metrics
 */

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Thermometer, Droplets, Wind, Cloud, Sun, Gauge, Leaf, TreeDeciduous,
  Activity, Waves, Users, Mountain, Zap, TreePine, Eye, Globe, Layers,
  Factory, Shrub, Droplet
} from 'lucide-react';
import type { PillarConfig, PillarData } from '@/types/dashboard';

interface DashboardPillarSectionProps {
  pillarKey: string;
  pillarConfig: PillarConfig;
  pillarData: PillarData;
  score: number;
}

// Metric configurations with icons and ranges
const METRIC_CONFIG: Record<string, { label: string; unit: string; icon: any; min?: number; max?: number }> = {
  // Pillar A - Atmospheric
  aod: { label: 'Aerosol Optical Depth', unit: '', icon: Cloud, min: 0, max: 1 },
  visibility: { label: 'Visibility', unit: 'km', icon: Eye, min: 0, max: 50 },
  temperature: { label: 'Air Temperature', unit: '°C', icon: Thermometer, min: -20, max: 50 },
  humidity: { label: 'Relative Humidity', unit: '%', icon: Droplets, min: 0, max: 100 },
  cloud_cover: { label: 'Cloud Cover', unit: '%', icon: Cloud, min: 0, max: 100 },
  pressure: { label: 'Surface Pressure', unit: 'hPa', icon: Gauge, min: 950, max: 1050 },
  wind_speed: { label: 'Wind Speed', unit: 'km/h', icon: Wind, min: 0, max: 100 },
  uv_index: { label: 'UV Index', unit: 'index', icon: Sun, min: 0, max: 11 },
  aqi: { label: 'Air Quality Index', unit: 'US AQI', icon: Activity, min: 0, max: 500 },
  pm2_5: { label: 'PM2.5', unit: 'μg/m³', icon: Cloud, min: 0, max: 500 },

  // Pillar B - Biodiversity
  ndvi: { label: 'NDVI', unit: '', icon: Leaf, min: -1, max: 1 },
  evi: { label: 'EVI', unit: '', icon: Leaf, min: -1, max: 2.5 },
  lai: { label: 'Leaf Area Index', unit: 'm²/m²', icon: Leaf, min: 0, max: 10 },
  fpar: { label: 'FPAR', unit: 'fraction', icon: Sun, min: 0, max: 1 },
  land_cover: { label: 'Land Cover', unit: 'class', icon: Layers, min: 0, max: 100 },

  // Pillar C - Climate
  tree_cover: { label: 'Tree Cover', unit: '%', icon: TreePine, min: 0, max: 1 },
  forest_loss: { label: 'Forest Loss', unit: 'binary', icon: TreeDeciduous, min: 0, max: 1 },
  canopy_height: { label: 'Canopy Height', unit: 'm', icon: TreePine, min: 0, max: 50 },
  biomass: { label: 'Biomass', unit: 'Mg/ha', icon: Shrub, min: 0, max: 500 },
  carbon_stock: { label: 'Carbon Stock', unit: 'Mg C/ha', icon: Factory, min: 0, max: 250 },

  // Pillar D - Degradation
  lst: { label: 'Land Surface Temp', unit: '°C', icon: Thermometer, min: -20, max: 60 },
  lst_night: { label: 'LST (Night)', unit: '°C', icon: Thermometer, min: -20, max: 40 },
  diurnal_range: { label: 'Diurnal Range', unit: '°C', icon: Thermometer, min: 0, max: 30 },
  soil_moisture: { label: 'Soil Moisture', unit: 'm³/m³', icon: Droplet, min: 0, max: 1 },
  water_occurrence: { label: 'Water Occurrence', unit: '%', icon: Waves, min: 0, max: 100 },
  drought_index: { label: 'Drought Index', unit: 'index', icon: Sun, min: -3, max: 3 },

  // Pillar E - Ecosystem
  population: { label: 'Population Density', unit: 'people/km²', icon: Users, min: 0, max: 50000 },
  nightlights: { label: 'Night Lights', unit: 'nW/cm²/sr', icon: Zap, min: 0, max: 100 },
  human_modification: { label: 'Human Modification', unit: 'index', icon: Factory, min: 0, max: 1 },
  elevation: { label: 'Elevation', unit: 'm', icon: Mountain, min: -100, max: 5000 },
  elevation_min: { label: 'Elevation (Min)', unit: 'm', icon: Mountain, min: -100, max: 5000 },
  elevation_max: { label: 'Elevation (Max)', unit: 'm', icon: Mountain, min: -100, max: 5000 },
};

// Metric keys per pillar
const PILLAR_METRICS: Record<string, string[]> = {
  A: ['aod', 'visibility', 'temperature', 'humidity', 'aqi', 'pm2_5'],
  B: ['ndvi', 'evi', 'lai', 'fpar', 'land_cover'],
  C: ['tree_cover', 'forest_loss', 'canopy_height', 'biomass', 'carbon_stock'],
  D: ['lst', 'lst_night', 'soil_moisture', 'water_occurrence', 'drought_index'],
  E: ['population', 'nightlights', 'human_modification', 'elevation'],
};

const DashboardPillarSection = ({
  pillarKey,
  pillarConfig,
  pillarData,
  score,
}: DashboardPillarSectionProps) => {
  const Icon = pillarConfig.icon;

  const formatValue = (value: any, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1000) return value.toLocaleString();
      return value.toFixed(decimals);
    }
    return String(value);
  };

  const getNormalizedValue = (value: number, metricKey: string) => {
    const config = METRIC_CONFIG[metricKey];
    if (!config || value === null || value === undefined) return 0;
    const min = config.min || 0;
    const max = config.max || 100;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  const getRadarData = () => {
    const metricKeys = PILLAR_METRICS[pillarKey] || [];
    return metricKeys.map((key) => ({
      metric: METRIC_CONFIG[key]?.label.split(' ')[0] || key,
      value: getNormalizedValue(pillarData.metrics[key]?.value || 0, key),
      fullMark: 100,
    }));
  };

  const metricKeys = PILLAR_METRICS[pillarKey] || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Pillar Header */}
      <div className={`bg-gradient-to-r ${pillarConfig.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{pillarConfig.fullName}</h2>
              <p className="text-sm opacity-80">Pillar {pillarKey}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{score.toFixed(1)}</div>
            <div className="text-sm opacity-80">/100</div>
          </div>
        </div>
      </div>

      {/* Pillar Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Metric Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={getRadarData()} outerRadius={60}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar
                  dataKey="value"
                  stroke={pillarConfig.color}
                  fill={pillarConfig.color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {metricKeys.slice(0, 6).map((metricKey) => {
              const metricConfig = METRIC_CONFIG[metricKey];
              const metricData = pillarData.metrics[metricKey];
              const MetricIcon = metricConfig?.icon || Activity;
              const value = metricData?.value;

              return (
                <div key={metricKey} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MetricIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 truncate">
                      {metricConfig?.label || metricKey}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatValue(value)}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      {metricConfig?.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPillarSection;
