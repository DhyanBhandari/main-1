import { useEffect, useState } from "react";
import { Wind, Droplets, Gauge, Sun, Thermometer, RefreshCw } from "lucide-react";
import { useSensorData } from "@/hooks/useSensorData";
import { LineChart } from "@/components/charts";
import { SensorType } from "@/services/sensorApi";

interface SensorCardData {
  label: string;
  value: string;
  unit: string;
  icon: any;
  percentage: number;
  color: string;
}

const SensorMetrics = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sensorType, setSensorType] = useState<SensorType>('outdoor');

  const { data, latest, loading, error, lastUpdated, refresh } = useSensorData(sensorType, 24);

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

  // Prepare chart data from readings
  const getChartData = () => {
    const sortedData = [...data].sort((a, b) =>
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    const labels = sortedData.map(r => {
      const date = new Date(r.time);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: sortedData.map(r => r.temperature),
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
        },
        {
          label: 'Humidity (%)',
          data: sortedData.map(r => r.humidity),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
      ],
    };
  };

  const sensors = getSensorCards();
  const chartData = getChartData();

  return (
    <section id="sensors" className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Live Environmental Data
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-4">
            Real-time sensor metrics from the planetary intelligence network
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700 font-medium">
              Data sourced from one of our EPA protected ecosystems
            </span>
          </div>
        </div>

        {/* Toggle and Refresh */}
        <div className={`flex justify-center items-center gap-6 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex rounded-full bg-muted p-1">
            <button
              onClick={() => setSensorType('indoor')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                sensorType === 'indoor'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Indoor
            </button>
            <button
              onClick={() => setSensorType('outdoor')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                sensorType === 'outdoor'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Outdoor
            </button>
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {sensors.map((sensor, index) => (
            <div
              key={sensor.label}
              className={`bg-white text-foreground rounded-3xl p-8 hover-lift shadow-premium border border-primary/10 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-6">
                <sensor.icon className={`w-8 h-8 ${sensor.color}`} strokeWidth={1.5} />
                <div className="text-right">
                  <div className="text-3xl font-bold">{sensor.value}</div>
                  <div className="text-sm text-muted-foreground font-light">{sensor.unit}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2 font-light">{sensor.label}</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: isVisible ? `${sensor.percentage}%` : '0%',
                      transitionDelay: `${index * 100 + 300}ms`
                    }}
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground font-light">
                {lastUpdated
                  ? `Updated: ${lastUpdated.toLocaleTimeString()}`
                  : 'Updated: --'
                }
              </div>
            </div>
          ))}
        </div>

        {/* Line Chart */}
        <div className={`bg-white rounded-3xl p-8 shadow-premium border border-primary/10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`} style={{ transitionDelay: '600ms' }}>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">Real-time Trends</h3>
            <p className="text-sm text-muted-foreground font-light">
              Temperature and humidity readings over time ({sensorType})
            </p>
          </div>

          {data.length > 0 ? (
            <LineChart
              labels={chartData.labels}
              datasets={chartData.datasets}
              height={350}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              {loading ? 'Loading chart data...' : 'No data available'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SensorMetrics;
