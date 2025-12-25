/**
 * SensorMetrics.tsx - Live Monitoring System Dashboard
 *
 * Two-column layout:
 * - Left: Text content and description
 * - Right: Sensor data cards (CO2, Temperature, Humidity, Pressure, Light)
 * - Below: Real-time trends with multiple chart types (Line, Bar, Area, Bubble)
 *
 * Chart Types Toggle:
 * Users can switch between 4 chart visualizations in real-time
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wind, Droplets, Gauge, Sun, Thermometer, RefreshCw, LineChartIcon, BarChart3, AreaChartIcon, CircleDot, ExternalLink } from "lucide-react";
import { useSensorData } from "@/hooks/useSensorData";
import { LineChart, BarChart, AreaChart, BubbleChart } from "@/components/charts";
import { SensorType } from "@/db/types";

interface SensorCardData {
  label: string;
  value: string;
  unit: string;
  icon: any;
  percentage: number;
  color: string;
}

type ChartType = 'line' | 'bar' | 'area' | 'bubble';

const chartTypeOptions: { type: ChartType; label: string; icon: any }[] = [
  { type: 'line', label: 'Line', icon: LineChartIcon },
  { type: 'bar', label: 'Bar', icon: BarChart3 },
  { type: 'area', label: 'Area', icon: AreaChartIcon },
  { type: 'bubble', label: 'Bubble', icon: CircleDot },
];

const SensorMetrics = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('line');

  // Fixed to outdoor only - fetch more readings to ensure we have last 1 hour of data
  const { data, latest, loading, error, lastUpdated, refresh } = useSensorData('outdoor', 100);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("sensors");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Calculate percentages based on typical ranges
  const getPercentage = (value: number, min: number, max: number) => {
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  // Build sensor cards from latest reading
  const getSensorCards = (): SensorCardData[] => {
    if (!latest) {
      return [
        { label: "CO₂", value: "--", unit: "ppm", icon: Wind, percentage: 0, color: "text-green-600" },
        { label: "Temperature", value: "--", unit: "°C", icon: Thermometer, percentage: 0, color: "text-orange-500" },
        { label: "Humidity", value: "--", unit: "%", icon: Droplets, percentage: 0, color: "text-blue-500" },
        { label: "Pressure", value: "--", unit: "hPa", icon: Gauge, percentage: 0, color: "text-purple-500" },
        { label: "Light", value: "--", unit: "lux", icon: Sun, percentage: 0, color: "text-yellow-500" },
      ];
    }

    return [
      {
        label: "CO₂",
        value: latest.co2.toFixed(0),
        unit: "ppm",
        icon: Wind,
        percentage: getPercentage(latest.co2, 300, 2000),
        color: "text-green-600"
      },
      {
        label: "Temperature",
        value: latest.temperature.toFixed(1),
        unit: "°C",
        icon: Thermometer,
        percentage: getPercentage(latest.temperature, 0, 50),
        color: "text-orange-500"
      },
      {
        label: "Humidity",
        value: latest.humidity.toFixed(1),
        unit: "%",
        icon: Droplets,
        percentage: latest.humidity,
        color: "text-blue-500"
      },
      {
        label: "Pressure",
        value: latest.pressure.toFixed(0),
        unit: "hPa",
        icon: Gauge,
        percentage: getPercentage(latest.pressure, 950, 1050),
        color: "text-purple-500"
      },
      {
        label: "Light",
        value: latest.light.toFixed(1),
        unit: "lux",
        icon: Sun,
        percentage: getPercentage(latest.light, 0, 100),
        color: "text-yellow-500"
      },
    ];
  };

  // Prepare chart data from readings - All 5 parameters (Last 1 hour, fallback to all data)
  const getChartData = () => {
    // Try to filter to last 1 hour, but fallback to all data if no recent readings
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let recentData = data.filter(r => r.createdAt >= oneHourAgo);

    // If no data in last hour, use all available data
    if (recentData.length === 0) {
      recentData = data;
    }

    const sortedData = [...recentData].sort((a, b) =>
      a.createdAt.getTime() - b.createdAt.getTime()
    );

    const labels = sortedData.map(r => {
      return r.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    return {
      labels,
      co2: sortedData.map(r => r.co2),
      temperature: sortedData.map(r => r.temperature),
      humidity: sortedData.map(r => r.humidity),
      pressure: sortedData.map(r => r.pressure),
      light: sortedData.map(r => r.light),
      sortedData,
    };
  };

  // Prepare bubble chart data - All 5 parameters (Last 1 hour, fallback to all data)
  const getBubbleData = () => {
    // Try to filter to last 1 hour, but fallback to all data if no recent readings
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let recentData = data.filter(r => r.createdAt >= oneHourAgo);

    // If no data in last hour, use all available data
    if (recentData.length === 0) {
      recentData = data;
    }

    const sortedData = [...recentData].sort((a, b) =>
      a.createdAt.getTime() - b.createdAt.getTime()
    );

    return [
      {
        label: 'CO₂ (ppm)',
        data: sortedData.map((r, i) => ({
          x: i,
          y: r.co2 / 10, // Scale down for visibility
          r: Math.max(4, r.co2 / 200),
        })),
        backgroundColor: 'rgba(22, 163, 74, 0.6)',
        borderColor: 'rgb(22, 163, 74)',
      },
      {
        label: 'Temperature (°C)',
        data: sortedData.map((r, i) => ({
          x: i,
          y: r.temperature,
          r: Math.max(4, r.temperature / 4),
        })),
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderColor: 'rgb(249, 115, 22)',
      },
      {
        label: 'Humidity (%)',
        data: sortedData.map((r, i) => ({
          x: i,
          y: r.humidity,
          r: Math.max(4, r.humidity / 10),
        })),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'Pressure (hPa/10)',
        data: sortedData.map((r, i) => ({
          x: i,
          y: r.pressure / 10, // Scale down for visibility
          r: Math.max(4, (r.pressure - 950) / 10),
        })),
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'rgb(168, 85, 247)',
      },
      {
        label: 'Light (lux)',
        data: sortedData.map((r, i) => ({
          x: i,
          y: r.light,
          r: Math.max(4, r.light / 10),
        })),
        backgroundColor: 'rgba(234, 179, 8, 0.6)',
        borderColor: 'rgb(234, 179, 8)',
      },
    ];
  };

  const sensors = getSensorCards();
  const chartData = getChartData();
  const bubbleData = getBubbleData();

  // Render the appropriate chart based on chartType - All 5 parameters
  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          {loading ? 'Loading chart data...' : 'No data available'}
        </div>
      );
    }

    // All 5 parameters for Line and Bar charts
    const allDatasets = [
      {
        label: 'CO₂ (ppm/10)',
        data: chartData.co2.map(v => v / 10), // Scale down for visibility
        borderColor: 'rgb(22, 163, 74)',
        backgroundColor: 'rgba(22, 163, 74, 0.5)',
      },
      {
        label: 'Temperature (°C)',
        data: chartData.temperature,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
      },
      {
        label: 'Humidity (%)',
        data: chartData.humidity,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Pressure (hPa-950)',
        data: chartData.pressure.map(v => v - 950), // Normalize for visibility
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
      },
      {
        label: 'Light (lux)',
        data: chartData.light,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
      },
    ];

    // All 5 parameters for Area chart
    const areaDatasets = [
      {
        label: 'CO₂ (ppm/10)',
        data: chartData.co2.map(v => v / 10),
        borderColor: 'rgb(22, 163, 74)',
        backgroundColor: 'rgba(22, 163, 74, 0.15)',
        fill: true,
      },
      {
        label: 'Temperature (°C)',
        data: chartData.temperature,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        fill: true,
      },
      {
        label: 'Humidity (%)',
        data: chartData.humidity,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
      },
      {
        label: 'Pressure (hPa-950)',
        data: chartData.pressure.map(v => v - 950),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        fill: true,
      },
      {
        label: 'Light (lux)',
        data: chartData.light,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.15)',
        fill: true,
      },
    ];

    switch (chartType) {
      case 'line':
        return (
          <LineChart
            labels={chartData.labels}
            datasets={allDatasets}
            height={400}
            xAxisLabel="Time"
            yAxisLabel="Value (scaled)"
          />
        );
      case 'bar':
        return (
          <BarChart
            labels={chartData.labels}
            datasets={allDatasets}
            height={400}
            xAxisLabel="Time"
            yAxisLabel="Value (scaled)"
          />
        );
      case 'area':
        return (
          <AreaChart
            labels={chartData.labels}
            datasets={areaDatasets}
            height={400}
            xAxisLabel="Time"
            yAxisLabel="Value (scaled)"
          />
        );
      case 'bubble':
        return (
          <BubbleChart
            datasets={bubbleData}
            height={400}
            xLabel="Reading Index"
            yLabel="Value (scaled)"
          />
        );
      default:
        return null;
    }
  };

  return (
    <section id="sensors" className="py-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Two Column Layout: Left Text, Right Data */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">

          {/* Left Side - Text Content */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Live - Monitoring System
            </h2>
            <p className="text-xl text-gray-600 font-light mb-6">
              Real-time IOT metrics from the planetary intelligence network. Dashboards tracking trends, risks, and resilience over time.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/50 border border-green-200 rounded-full mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-700 font-medium">
                Data sourced from one of our EPA Project Sites
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm text-gray-600 font-medium">Refresh</span>
              </button>

              {/* Go to Dashboard Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D2821] hover:bg-[#065f46] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-medium">Go to Dashboard</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Right Side - Sensor Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sensors.map((sensor, index) => (
              <div
                key={sensor.label}
                className={`bg-white/70 backdrop-blur-sm text-gray-900 rounded-2xl p-5 border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <sensor.icon className={`w-6 h-6 ${sensor.color}`} strokeWidth={1.5} />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{sensor.value}</div>
                    <div className="text-xs text-gray-500">{sensor.unit}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-2">{sensor.label}</div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D2821] rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: isVisible ? `${sensor.percentage}%` : '0%',
                        transitionDelay: `${index * 100 + 300}ms`
                      }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {lastUpdated
                    ? `${lastUpdated.toLocaleTimeString()}`
                    : '--'
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Width - Real-time Trends with Chart Type Toggle */}
        <div className={`bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-sm transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`} style={{ transitionDelay: '600ms' }}>

          {/* Header with Chart Type Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Real-time Trends</h3>
              <p className="text-sm text-gray-600">
                All environmental parameters - Recent readings (Outdoor sensors)
              </p>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
              {chartTypeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setChartType(option.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    chartType === option.type
                      ? 'bg-[#0D2821] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={option.label}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Container */}
          <div className="transition-all duration-500">
            {renderChart()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SensorMetrics;
