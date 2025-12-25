/**
 * Dashboard.tsx - Comprehensive EPA Collective
 *
 * Complete dashboard with:
 * - Left sidebar navigation with scroll-based highlighting
 * - All 25 metrics (5 per pillar) with rich visual representations
 * - Remote sensing imagery viewer
 * - Live data graphs for real-time weather/AQI
 * - Intersection Observer for active section detection
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-new.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer, Droplets, Wind, Cloud, Sun, Gauge,
  Leaf, TreeDeciduous, Activity, Waves, Users,
  ArrowLeft, RefreshCw, MapPin, Clock,
  AlertCircle, CheckCircle2, Mountain, Zap, TreePine,
  Eye, Globe, Layers, Image, ChevronRight, BarChart3,
  TrendingUp, TrendingDown, Minus, Factory, Home,
  CircleDot, Target, Shrub, Droplet, ArrowUp, ArrowDown,
  Database
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend, ComposedChart, Scatter
} from "recharts";

// Layout
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

// Default coordinates (Puducherry)
const DEFAULT_LAT = 11.904654050297719;
const DEFAULT_LON = 79.80346929324504;
const API_BASE = "http://127.0.0.1:8000/api/dashboard";
const IMAGERY_BASE = "http://127.0.0.1:8000/api/imagery";

// Pillar configuration with proper naming
const PILLAR_CONFIG = {
  A: { id: "A", name: "Atmospheric", fullName: "Atmospheric Health", color: "#3498db", icon: Wind, gradient: "from-blue-500 to-blue-600" },
  B: { id: "B", name: "Biodiversity", fullName: "Biodiversity", color: "#27ae60", icon: Leaf, gradient: "from-green-500 to-green-600" },
  C: { id: "C", name: "Climate", fullName: "Climate", color: "#8e44ad", icon: TreePine, gradient: "from-purple-500 to-purple-600" },
  D: { id: "D", name: "DLWD", fullName: "Decrease in Land & Water Degradation", color: "#e74c3c", icon: Thermometer, gradient: "from-red-500 to-red-600" },
  E: { id: "E", name: "Ecosystem", fullName: "Ecosystem Services", color: "#f39c12", icon: Globe, gradient: "from-orange-500 to-orange-600" },
};

// Metric configurations with descriptions and units - ALL METRICS FROM PHI REPORT
const METRIC_CONFIG: Record<string, { label: string; unit: string; description: string; icon: any; min?: number; max?: number }> = {
  // Pillar A - Atmospheric (18 metrics: remote sensing + realtime weather + AQI)
  aod: { label: "Aerosol Optical Depth", unit: "", description: "Atmospheric particle density", icon: Cloud, min: 0, max: 1 },
  visibility: { label: "Visibility", unit: "km", description: "Atmospheric clarity (derived from AOD)", icon: Eye, min: 0, max: 50 },
  temperature: { label: "Air Temperature", unit: "°C", description: "Current ambient temperature", icon: Thermometer, min: -20, max: 50 },
  feels_like: { label: "Feels Like", unit: "°C", description: "Apparent temperature", icon: Thermometer, min: -20, max: 50 },
  humidity: { label: "Relative Humidity", unit: "%", description: "Air moisture content", icon: Droplets, min: 0, max: 100 },
  cloud_cover: { label: "Cloud Cover", unit: "%", description: "Overall cloud coverage", icon: Cloud, min: 0, max: 100 },
  pressure: { label: "Surface Pressure", unit: "hPa", description: "Atmospheric pressure", icon: Gauge, min: 950, max: 1050 },
  wind_speed: { label: "Wind Speed", unit: "km/h", description: "Wind velocity", icon: Wind, min: 0, max: 100 },
  wind_direction: { label: "Wind Direction", unit: "°", description: "Wind bearing", icon: Wind, min: 0, max: 360 },
  uv_index: { label: "UV Index", unit: "index", description: "Ultraviolet radiation level", icon: Sun, min: 0, max: 11 },
  aqi: { label: "Air Quality Index", unit: "US AQI", description: "Overall air quality (0-500)", icon: Activity, min: 0, max: 500 },
  pm2_5: { label: "PM2.5", unit: "μg/m³", description: "Fine particulate matter", icon: Cloud, min: 0, max: 500 },
  pm10: { label: "PM10", unit: "μg/m³", description: "Coarse particulate matter", icon: Cloud, min: 0, max: 500 },
  ozone: { label: "Ozone (O₃)", unit: "μg/m³", description: "Ground-level ozone", icon: Wind, min: 0, max: 200 },
  carbon_monoxide: { label: "Carbon Monoxide", unit: "μg/m³", description: "CO concentration", icon: Factory, min: 0, max: 1000 },
  nitrogen_dioxide: { label: "Nitrogen Dioxide", unit: "μg/m³", description: "NO₂ concentration", icon: Factory, min: 0, max: 100 },
  cloud_fraction: { label: "Cloud Fraction", unit: "fraction", description: "Cloud coverage fraction", icon: Cloud, min: 0, max: 1 },

  // Pillar B - Biodiversity (5 metrics) - EVI can exceed 1 for dense vegetation
  ndvi: { label: "NDVI", unit: "", description: "Vegetation greenness (-1 to 1)", icon: Leaf, min: -1, max: 1 },
  evi: { label: "EVI", unit: "", description: "Enhanced vegetation index", icon: Leaf, min: -1, max: 2.5 },
  lai: { label: "Leaf Area Index", unit: "m²/m²", description: "Leaf density per area", icon: Leaf, min: 0, max: 10 },
  fpar: { label: "FPAR", unit: "fraction", description: "Absorbed sunlight for photosynthesis", icon: Sun, min: 0, max: 1 },
  land_cover: { label: "Land Cover", unit: "class", description: "Land use classification", icon: Layers, min: 0, max: 100 },

  // Pillar C - Climate/Carbon (5 metrics) - Note: tree_cover from API is 0-1 fraction, not 0-100 percentage
  tree_cover: { label: "Tree Cover", unit: "%", description: "Forest canopy percentage", icon: TreePine, min: 0, max: 1 },
  forest_loss: { label: "Forest Loss", unit: "binary", description: "Deforestation detection", icon: TreeDeciduous, min: 0, max: 1 },
  canopy_height: { label: "Canopy Height", unit: "m", description: "Average tree height", icon: TreePine, min: 0, max: 50 },
  biomass: { label: "Biomass", unit: "Mg/ha", description: "Above-ground biomass density", icon: Shrub, min: 0, max: 500 },
  carbon_stock: { label: "Carbon Stock", unit: "Mg C/ha", description: "Stored carbon equivalent", icon: Factory, min: 0, max: 250 },

  // Pillar D - Degradation (8 metrics)
  lst: { label: "Land Surface Temp (Day)", unit: "°C", description: "Daytime ground temperature", icon: Thermometer, min: -20, max: 60 },
  lst_night: { label: "Land Surface Temp (Night)", unit: "°C", description: "Nighttime ground temperature", icon: Thermometer, min: -20, max: 40 },
  diurnal_range: { label: "Diurnal Temp Range", unit: "°C", description: "Day-night temperature difference", icon: Thermometer, min: 0, max: 30 },
  soil_moisture: { label: "Soil Moisture", unit: "m³/m³", description: "Volumetric soil water content", icon: Droplet, min: 0, max: 1 },
  water_occurrence: { label: "Water Occurrence", unit: "%", description: "Historical water presence (1984-2021)", icon: Waves, min: 0, max: 100 },
  water_seasonality: { label: "Water Seasonality", unit: "months", description: "Months with water presence", icon: Waves, min: 0, max: 12 },
  drought_index: { label: "Drought Index", unit: "index", description: "Drought severity", icon: Sun, min: -3, max: 3 },
  evaporative_stress: { label: "Evaporative Stress", unit: "index", description: "ET/PET ratio (plant water stress)", icon: Droplets, min: 0, max: 1 },

  // Pillar E - Ecosystem (5+ metrics)
  population: { label: "Population Density", unit: "people/km²", description: "Human population", icon: Users, min: 0, max: 50000 },
  nightlights: { label: "Night Lights", unit: "nW/cm²/sr", description: "Urban light intensity", icon: Zap, min: 0, max: 100 },
  human_modification: { label: "Human Modification", unit: "index", description: "Landscape alteration (0-1)", icon: Factory, min: 0, max: 1 },
  elevation: { label: "Elevation", unit: "m", description: "Height above sea level", icon: Mountain, min: -100, max: 5000 },
  elevation_min: { label: "Elevation (Min)", unit: "m", description: "Minimum elevation in area", icon: Mountain, min: -100, max: 5000 },
  elevation_max: { label: "Elevation (Max)", unit: "m", description: "Maximum elevation in area", icon: Mountain, min: -100, max: 5000 },
  elevation_relief: { label: "Relief", unit: "m", description: "Elevation range (max-min)", icon: Mountain, min: 0, max: 5000 },
  distance_to_water: { label: "Distance to Water", unit: "m", description: "Nearest water body", icon: Waves, min: 0, max: 50000 },
};

// Imagery types
const IMAGERY_TYPES = [
  { id: "true_color", label: "True Color", icon: Image, color: "#3b82f6" },
  { id: "ndvi", label: "NDVI", icon: TreePine, color: "#22c55e" },
  { id: "lst", label: "Temperature", icon: Thermometer, color: "#ef4444" },
  { id: "land_cover", label: "Land Cover", icon: Layers, color: "#a855f7" },
  { id: "forest_cover", label: "Forest Cover", icon: TreePine, color: "#065f46" },
];

// Section IDs for scroll tracking
const SECTION_IDS = ["overview", "live", "imagery", "A", "B", "C", "D", "E"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePillar, setActivePillar] = useState<string>("overview");
  const [dataSource, setDataSource] = useState<'stored' | 'live'>('stored');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Data states - start empty, populated from API
  const [weather, setWeather] = useState<any>(null);
  const [aqi, setAqi] = useState<any>(null);
  const [satellite, setSatellite] = useState<any>(null);
  const [rawPillars, setRawPillars] = useState<any>(null);
  const [imagery, setImagery] = useState<Record<string, string>>({});
  const [activeImagery, setActiveImagery] = useState("true_color");

  // Historical data for graphs
  const [weatherHistory, setWeatherHistory] = useState<any[]>([]);
  const [aqiHistory, setAqiHistory] = useState<any[]>([]);

  // Track if satellite data needs refresh
  const [needsSatelliteFetch, setNeedsSatelliteFetch] = useState(false);

  // Get data age as human readable string
  const getDataAge = () => {
    if (!lastUpdated) return '';
    const ageMs = Date.now() - lastUpdated.getTime();
    const minutes = Math.floor(ageMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  // Refs for scrolling and intersection observer
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Setup Intersection Observer for scroll-based section highlighting
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section");
            if (sectionId) {
              setActivePillar(sectionId);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe sections when refs are set
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    Object.entries(sectionRefs.current).forEach(([id, ref]) => {
      if (ref) {
        ref.setAttribute("data-section", id);
        observer.observe(ref);
      }
    });

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [loading]);

  // Fetch live weather/AQI data (always fresh from Open-Meteo)
  const fetchLiveData = async () => {
    try {
      const realtimeRes = await fetch(`${API_BASE}/realtime?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}`);
      const realtimeData = await realtimeRes.json();

      if (realtimeData.success && realtimeData.data) {
        const w = realtimeData.data.weather;
        if (w?.available) {
          const weatherEntry = {
            temperature: w.current?.temperature?.value || 0,
            feels_like: w.current?.temperature?.feels_like || 0,
            humidity: w.current?.humidity?.value || 0,
            pressure: w.current?.pressure?.sea_level || 0,
            wind_speed: w.current?.wind?.speed || 0,
            wind_direction: w.current?.wind?.direction || 0,
            wind_gusts: w.current?.wind?.gusts || 0,
            cloud_cover: w.current?.cloud_cover?.value || 0,
            weather_description: w.current?.weather?.description || "Unknown",
            weather_code: w.current?.weather?.code || 0,
            is_day: w.current?.weather?.is_day,
            precipitation: w.current?.precipitation?.value || 0,
            uv_index_max: w.daily?.uv_index_max?.[1] || w.daily?.uv_index_max?.[0] || 0,
            temp_max: w.daily?.temperature_2m_max?.[1] || w.daily?.temperature_2m_max?.[0] || 0,
            temp_min: w.daily?.temperature_2m_min?.[1] || w.daily?.temperature_2m_min?.[0] || 0,
            sunrise: w.daily?.sunrise?.[1] || w.daily?.sunrise?.[0] || "",
            sunset: w.daily?.sunset?.[1] || w.daily?.sunset?.[0] || "",
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          };
          setWeather(weatherEntry);
          setWeatherHistory(prev => [...prev.slice(-23), weatherEntry]);
        }

        const a = realtimeData.data.air_quality;
        if (a?.available) {
          const aqiEntry = {
            us_aqi: a.aqi?.us_aqi || 0,
            european_aqi: a.aqi?.european_aqi || 0,
            category: a.aqi?.category || "unknown",
            pm25: a.pollutants?.pm2_5?.value || 0,
            pm10: a.pollutants?.pm10?.value || 0,
            ozone: a.pollutants?.ozone?.value || 0,
            co: a.pollutants?.carbon_monoxide?.value || 0,
            no2: a.pollutants?.nitrogen_dioxide?.value || 0,
            so2: a.pollutants?.sulphur_dioxide?.value || 0,
            uv_index: a.uv_index?.value || 0,
            uv_category: a.uv_index?.category || "unknown",
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          };
          setAqi(aqiEntry);
          setAqiHistory(prev => [...prev.slice(-23), aqiEntry]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live data:", err);
    }
  };

  // Fetch stored satellite data from database (instant)
  const fetchStoredData = async () => {
    try {
      const storedRes = await fetch(`${API_BASE}/stored?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}`);
      const storedData = await storedRes.json();

      if (storedData.success && storedData.data?.available) {
        const s = storedData.data;
        setSatellite({
          overall_score: s.summary?.overall_score || 0,
          overall_interpretation: s.summary?.overall_interpretation || "Unknown",
          pillar_scores: s.summary?.pillar_scores || {},
          ecosystem_type: s.summary?.ecosystem_type || "unknown",
          data_quality_score: s.summary?.data_quality_score || 0,
          data_completeness: s.summary?.data_completeness || 0,
        });
        setRawPillars(s.pillars || {});
        setDataSource('stored');
        if (s.timestamp) {
          setLastUpdated(new Date(s.timestamp));
        }
        return true; // Data found
      }
      return false; // No stored data
    } catch (err) {
      console.error("Failed to fetch stored data:", err);
      return false;
    }
  };

  // Fetch fresh satellite data from GEE (slow - only when needed)
  const fetchSatelliteData = async () => {
    try {
      setRefreshing(true);
      const satelliteRes = await fetch(`${API_BASE}/satellite?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&mode=comprehensive`);
      const satelliteData = await satelliteRes.json();

      if (satelliteData.success && satelliteData.data?.available) {
        const s = satelliteData.data;
        setSatellite({
          overall_score: s.summary?.overall_score || 0,
          overall_interpretation: s.summary?.overall_interpretation || "Unknown",
          pillar_scores: s.summary?.pillar_scores || {},
          ecosystem_type: s.summary?.ecosystem_type || "unknown",
          data_quality_score: s.summary?.data_quality_score || 0,
          data_completeness: s.summary?.data_completeness || 0,
        });
        setRawPillars(s.pillars || {});
        setDataSource('live');
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch satellite data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch imagery (separate, can be slow)
  const fetchImagery = async () => {
    try {
      const imageryRes = await fetch(`${IMAGERY_BASE}?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&buffer_km=5&image_size=512`);
      const imageryData = await imageryRes.json();
      if (imageryData.imagery) {
        const imgUrls: Record<string, string> = {};
        Object.entries(imageryData.imagery).forEach(([key, val]: [string, any]) => {
          if (val?.url && val?.available) imgUrls[key] = val.url;
        });
        setImagery(imgUrls);
      }
    } catch (err) {
      console.error("Failed to fetch imagery:", err);
    }
  };

  // Main data fetch function
  const fetchData = async (forceRefreshSatellite = false) => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Try to get stored satellite data (instant)
      const hasStoredData = await fetchStoredData();

      // Step 2: Fetch live weather/AQI data (always)
      await fetchLiveData();

      // Step 3: Fetch imagery in background
      fetchImagery();

      // Step 4: If no stored data or force refresh, fetch from GEE
      if (!hasStoredData || forceRefreshSatellite) {
        setNeedsSatelliteFetch(true);
        // Don't await - let it run in background after page loads
        fetchSatelliteData();
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to fetch data. Is the backend running on port 8000?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval to refresh live data every 5 minutes
    const liveInterval = setInterval(() => {
      fetchLiveData();
    }, 5 * 60 * 1000);

    return () => clearInterval(liveInterval);
  }, []);

  // Handle refresh button - always fetch fresh satellite data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveData();
    fetchSatelliteData();
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    if (sectionId === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Get radar chart data
  const getRadarData = () => {
    if (!satellite?.pillar_scores) return [];
    return Object.entries(satellite.pillar_scores).map(([key, value]) => ({
      subject: PILLAR_CONFIG[key as keyof typeof PILLAR_CONFIG]?.name || key,
      score: value as number,
      fullMark: 100,
    }));
  };

  // Get pillar bar chart data
  const getPillarBarData = () => {
    if (!satellite?.pillar_scores) return [];
    return Object.entries(PILLAR_CONFIG).map(([key, config]) => ({
      name: config.name,
      score: satellite?.pillar_scores?.[key] || 0,
      fill: config.color,
    }));
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    if (score >= 30) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-green-400 to-green-600";
    if (score >= 50) return "from-yellow-400 to-yellow-600";
    if (score >= 30) return "from-orange-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  // Format metric value
  const formatValue = (value: any, decimals = 2) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") {
      if (Math.abs(value) >= 1000) return value.toLocaleString();
      return value.toFixed(decimals);
    }
    return String(value);
  };

  // Get quality badge
  const getQualityBadge = (quality: string) => {
    const colors: Record<string, string> = {
      good: "bg-green-100 text-green-700",
      moderate: "bg-yellow-100 text-yellow-700",
      poor: "bg-orange-100 text-orange-700",
      unavailable: "bg-gray-100 text-gray-500",
      supplemented: "bg-blue-100 text-blue-700",
    };
    return colors[quality] || colors.unavailable;
  };

  // Get pillar metrics from raw data - flattens nested values and merges realtime data
  const getPillarMetrics = (pillarKey: string) => {
    // Try multiple possible key formats since GEE might return different structures
    const pillarKeyVariants: Record<string, string[]> = {
      A: ["A_atmospheric", "A", "atmospheric", "Atmospheric"],
      B: ["B_biodiversity", "B", "biodiversity", "Biodiversity"],
      C: ["C_carbon", "C", "carbon", "Carbon", "climate", "Climate"],
      D: ["D_degradation", "D", "degradation", "Degradation"],
      E: ["E_ecosystem", "E", "ecosystem", "Ecosystem"],
    };

    // Find the first matching key in rawPillars
    let rawMetrics: Record<string, any> = {};
    let foundKey = '';
    const variants = pillarKeyVariants[pillarKey] || [pillarKey];
    for (const variant of variants) {
      if (rawPillars?.[variant]?.metrics) {
        rawMetrics = rawPillars[variant].metrics;
        foundKey = variant;
        break;
      }
    }

    // Flatten nested metrics (e.g., lst contains lst_night, diurnal_range)
    const flattenedMetrics: Record<string, any> = {};

    Object.entries(rawMetrics).forEach(([key, data]: [string, any]) => {
      // Add the main metric
      flattenedMetrics[key] = data;

      // Extract nested values as separate metrics
      if (key === 'lst' && data) {
        if (data.lst_night !== undefined) {
          flattenedMetrics['lst_night'] = { value: data.lst_night, unit: '°C', quality: data.quality };
        }
        if (data.diurnal_range !== undefined) {
          flattenedMetrics['diurnal_range'] = { value: data.diurnal_range, unit: '°C', quality: data.quality };
        }
      }
      if (key === 'elevation' && data) {
        if (data.min !== undefined) {
          flattenedMetrics['elevation_min'] = { value: data.min, unit: 'm', quality: data.quality };
        }
        if (data.max !== undefined) {
          flattenedMetrics['elevation_max'] = { value: data.max, unit: 'm', quality: data.quality };
        }
        if (data.relief !== undefined) {
          flattenedMetrics['elevation_relief'] = { value: data.relief, unit: 'm', quality: data.quality };
        }
      }
      if (key === 'water_occurrence' && data) {
        if (data.seasonality !== undefined) {
          flattenedMetrics['water_seasonality'] = { value: data.seasonality, unit: 'months', quality: data.quality };
        }
      }
    });

    // Merge realtime weather/AQI data into Pillar A (Atmospheric)
    if (pillarKey === 'A') {
      // Add weather metrics
      if (weather) {
        flattenedMetrics['temperature'] = { value: weather.temperature, unit: '°C', quality: 'good' };
        flattenedMetrics['feels_like'] = { value: weather.feels_like, unit: '°C', quality: 'good' };
        flattenedMetrics['humidity'] = { value: weather.humidity, unit: '%', quality: 'good' };
        flattenedMetrics['cloud_cover'] = { value: weather.cloud_cover, unit: '%', quality: 'good' };
        flattenedMetrics['pressure'] = { value: weather.pressure, unit: 'hPa', quality: 'good' };
        flattenedMetrics['wind_speed'] = { value: weather.wind_speed, unit: 'km/h', quality: 'good' };
        flattenedMetrics['wind_direction'] = { value: weather.wind_direction, unit: '°', quality: 'good' };
        flattenedMetrics['uv_index'] = { value: weather.uv_index_max, unit: 'index', quality: 'good' };
      }
      // Add AQI metrics
      if (aqi) {
        flattenedMetrics['aqi'] = { value: aqi.us_aqi, unit: 'US AQI', quality: 'good' };
        flattenedMetrics['pm2_5'] = { value: aqi.pm25, unit: 'μg/m³', quality: 'good' };
        flattenedMetrics['pm10'] = { value: aqi.pm10, unit: 'μg/m³', quality: 'good' };
        flattenedMetrics['ozone'] = { value: aqi.ozone, unit: 'μg/m³', quality: 'good' };
        flattenedMetrics['carbon_monoxide'] = { value: aqi.co, unit: 'μg/m³', quality: 'good' };
        flattenedMetrics['nitrogen_dioxide'] = { value: aqi.no2, unit: 'μg/m³', quality: 'good' };
      }
    }

    // Add evapotranspiration from weather daily data to Pillar D
    if (pillarKey === 'D' && weather) {
      // ET is in daily data, we stored uv_index_max but not ET - would need to update fetchData
    }

    return flattenedMetrics;
  };

  // Get metrics list for pillar - dynamically based on available data
  const getPillarMetricKeys = (pillarKey: string) => {
    // For Pillar A, dynamically build the list based on what data we have
    if (pillarKey === 'A') {
      const keys: string[] = [];
      // Always try to show satellite metrics
      keys.push("aod", "visibility");
      // Add weather metrics if weather data is available
      if (weather) {
        keys.push("temperature", "feels_like", "humidity", "cloud_cover", "pressure", "wind_speed", "wind_direction", "uv_index");
      }
      // Add AQI metrics if AQI data is available
      if (aqi) {
        keys.push("aqi", "pm2_5", "pm10", "ozone", "carbon_monoxide", "nitrogen_dioxide");
      }
      return keys;
    }

    const metricsByPillar: Record<string, string[]> = {
      // Pillar B: Vegetation indices
      B: ["ndvi", "evi", "lai", "fpar", "land_cover"],
      // Pillar C: Carbon/forest metrics
      C: ["tree_cover", "forest_loss", "canopy_height", "biomass", "carbon_stock"],
      // Pillar D: Land degradation metrics
      D: ["lst", "lst_night", "diurnal_range", "soil_moisture", "water_occurrence", "water_seasonality", "drought_index", "evaporative_stress"],
      // Pillar E: Ecosystem/human impact metrics
      E: ["population", "nightlights", "human_modification", "elevation", "elevation_min", "elevation_max", "elevation_relief", "distance_to_water"],
    };
    return metricsByPillar[pillarKey] || [];
  };

  // Calculate normalized value for gauge (0-100)
  const getNormalizedValue = (value: number, metricKey: string) => {
    const config = METRIC_CONFIG[metricKey];
    if (!config || value === null || value === undefined) return 0;
    const min = config.min || 0;
    const max = config.max || 100;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  // Generate radar data for a single pillar
  const getPillarRadarData = (pillarKey: string) => {
    const metrics = getPillarMetrics(pillarKey);
    const metricKeys = getPillarMetricKeys(pillarKey);
    return metricKeys.map((key) => ({
      metric: METRIC_CONFIG[key]?.label.split(" ")[0] || key,
      value: getNormalizedValue(metrics[key]?.value || 0, key),
      fullMark: 100,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DottedGlowBackground
          className="absolute inset-0 w-full h-full"
          gap={15}
          radius={2}
          color="#a1a1aa"
          glowColor="#021a10ff"
          opacity={0.15}
          speedMin={0.3}
          speedMax={1.6}
          speedScale={1}
        />
      </div>

      <div className="relative z-10">

        {/* Fixed Top Header with Logo */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 z-30 flex items-center px-6">
          <button onClick={() => navigate("/")} className="mr-4">
            <img src={logo} alt="ErthaLoka" className="h-8 w-auto" />
          </button>
        </header>

        {/* Main Layout */}
        <div className="flex pt-20">

          {/* LEFT SIDEBAR - Fixed Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-72 fixed left-0 top-20 bottom-0 bg-white/95 backdrop-blur-md border-r border-gray-200 overflow-y-auto z-20"
          >
            <div className="p-4">
              {/* PHI Score Card */}
              <div className="bg-gradient-to-br from-[#0D2821] to-[#1a4a3d] rounded-2xl p-5 text-white mb-4">
                <div className="text-xs opacity-70 mb-1">Planetary Health Index</div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">{satellite?.overall_score?.toFixed(1) || "—"}</span>
                  <span className="text-lg mb-1 opacity-70">/100</span>
                </div>
                <div className="text-xs opacity-70 mt-1 capitalize">{satellite?.overall_interpretation || "Loading..."}</div>
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${satellite?.overall_score || 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {/* Overview */}
                <button
                  onClick={() => scrollToSection("overview")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-300 ${
                    activePillar === "overview"
                      ? "bg-[#0D2821] text-white shadow-lg scale-[1.02]"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Overview</span>
                  {activePillar === "overview" && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </button>

                {/* Live Data */}
                <button
                  onClick={() => scrollToSection("live")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-300 ${
                    activePillar === "live"
                      ? "bg-[#0D2821] text-white shadow-lg scale-[1.02]"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Live Data</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </button>

                {/* Remote Sensing Imagery */}
                <button
                  onClick={() => scrollToSection("imagery")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-300 ${
                    activePillar === "imagery"
                      ? "bg-[#0D2821] text-white shadow-lg scale-[1.02]"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Remote Sensing</span>
                </button>

                <div className="h-px bg-gray-200 my-3" />
                <div className="text-xs text-gray-500 px-3 py-1 uppercase tracking-wider font-semibold">Pillars</div>

                {/* Pillar Navigation */}
                {Object.entries(PILLAR_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  const score = satellite?.pillar_scores?.[key] || 0;
                  const isActive = activePillar === key;
                  return (
                    <motion.button
                      key={key}
                      onClick={() => scrollToSection(key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-300 ${
                        isActive
                          ? "bg-[#0D2821] text-white shadow-lg"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isActive ? "bg-white/20" : ""
                        }`}
                        style={{ backgroundColor: isActive ? undefined : config.color + "20" }}
                      >
                        <Icon className="w-5 h-5" style={{ color: isActive ? "white" : config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{config.name}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: isActive ? "white" : config.color }}
                            />
                          </div>
                          <span className="text-xs opacity-70">{score.toFixed(0)}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "rotate-90" : ""}`} />
                    </motion.button>
                  );
                })}
              </nav>

                            {/* Combined Charts Section */}
              <div className="mt-4 space-y-4">
                <div className="text-xs text-gray-500 px-3 py-1 uppercase tracking-wider font-semibold">Performance Charts</div>
                
                {/* 1. Radar Chart - All Pillars */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Radar Overview</div>
                  {getRadarData().length >= 3 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#0D2821"
                          fill="#0D2821"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Loading data...</div>
                  )}
                </div>

                {/* 2. Bar Chart - All Pillars */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Bar Comparison</div>
                  {getPillarBarData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={getPillarBarData()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={70} />
                        <Tooltip formatter={(value) => [value.toFixed(0) + "/100", "Score"]} />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                          {getPillarBarData().map((entry, index) => (
                            <Cell key={"cell-" + index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-36 flex items-center justify-center text-gray-400 text-xs">Loading data...</div>
                  )}
                </div>

                {/* 3. Pie/Doughnut Chart - Score Distribution */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Score Distribution</div>
                  {getPillarBarData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie
                          data={getPillarBarData()}
                          dataKey="score"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={2}
                        >
                          {getPillarBarData().map((entry, index) => (
                            <Cell key={"cell-" + index} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value.toFixed(0), "Score"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-36 flex items-center justify-center text-gray-400 text-xs">Loading data...</div>
                  )}
                </div>
              </div>

              {/* Data Quality */}
              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Data Quality</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Quality Score</span>
                      <span className="font-medium">{satellite?.data_quality_score?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: (satellite?.data_quality_score || 0) + "%"  }}
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Completeness</span>
                      <span className="font-medium">{((satellite?.data_completeness || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: ((satellite?.data_completeness || 0) * 100) + "%" }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 lg:ml-72 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/")}
                    className="p-2 rounded-full bg-white hover:bg-gray-100 shadow-sm transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Monitoring Dashboard
                    </h1>
                    {satellite?.ecosystem_type && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
                          {satellite.ecosystem_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {lastUpdated && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span title={lastUpdated.toLocaleString()}>{getDataAge()}</span>
                      {dataSource === 'stored' && !refreshing && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          Stored
                        </span>
                      )}
                      {dataSource === 'live' && !refreshing && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Live
                        </span>
                      )}
                      {refreshing && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Fetching from GEE...
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D2821] text-white hover:bg-[#0D2821]/90 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>
              </motion.div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-[#0D2821] animate-spin" />
                    <p className="text-gray-600">Loading dashboard data...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">

                  {/* OVERVIEW SECTION */}
                  <section ref={el => sectionRefs.current["overview"] = el} data-section="overview">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="space-y-4"
                    >
                      {/* Pillar Score Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.entries(PILLAR_CONFIG).map(([key, config], index) => {
                          const Icon = config.icon;
                          const score = satellite?.pillar_scores?.[key] || 0;
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.03, y: -5 }}
                              onClick={() => scrollToSection(key)}
                              className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-xl transition-all group"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.gradient} group-hover:scale-110 transition-transform`}
                                >
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 font-medium">{config.name}</div>
                                  <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                    {score.toFixed(0)}
                                  </div>
                                </div>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.1 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: config.color }}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Overview Charts */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Radar Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pillar Performance Radar</h3>
                          {getRadarData().length >= 3 ? (
                            <ResponsiveContainer width="100%" height={220}>
                              <RadarChart data={getRadarData()}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                <Radar
                                  name="Score"
                                  dataKey="score"
                                  stroke="#0D2821"
                                  fill="#0D2821"
                                  fillOpacity={0.3}
                                  strokeWidth={2}
                                />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">Loading data...</div>
                          )}
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pillar Comparison</h3>
                          {getPillarBarData().length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                              <BarChart data={getPillarBarData()} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                                <Tooltip />
                                <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                                  {getPillarBarData().map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">Loading data...</div>
                          )}
                        </div>

                        {/* Pie/Doughnut Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Score Distribution</h3>
                          {getPillarBarData().length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                              <PieChart>
                                <Pie
                                  data={getPillarBarData()}
                                  dataKey="score"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={3}
                                  label={({ name }) => name.substring(0, 3)}
                                >
                                  {getPillarBarData().map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [value.toFixed(0) + "/100", "Score"]} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-56 flex items-center justify-center text-gray-400">Loading data...</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* LIVE DATA SECTION */}
                  <section ref={el => sectionRefs.current["live"] = el} data-section="live">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <h2 className="text-xl font-bold text-gray-900">Live Data</h2>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Real-time • Updates every 5 min</span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Weather Card with Graph */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                        >
                          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                                  <Thermometer className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-800">Weather</span>
                                  <div className="text-xs text-gray-500">Real-time data</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-gray-900">{weather?.temperature.toFixed(1)}°</div>
                                <div className="text-xs text-gray-500">{weather?.weather_description}</div>
                              </div>
                            </div>
                          </div>

                          {weather && (
                            <div className="p-4">
                              <div className="grid grid-cols-4 gap-3 mb-4">
                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                  <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                                  <div className="text-lg font-bold text-gray-900">{weather.humidity}%</div>
                                  <div className="text-xs text-gray-500">Humidity</div>
                                </div>
                                <div className="text-center p-2 bg-teal-50 rounded-lg">
                                  <Wind className="w-4 h-4 mx-auto text-teal-500 mb-1" />
                                  <div className="text-lg font-bold text-gray-900">{weather.wind_speed.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">Wind km/h</div>
                                </div>
                                <div className="text-center p-2 bg-purple-50 rounded-lg">
                                  <Gauge className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                                  <div className="text-lg font-bold text-gray-900">{weather.pressure.toFixed(0)}</div>
                                  <div className="text-xs text-gray-500">hPa</div>
                                </div>
                                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                  <Sun className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                                  <div className="text-lg font-bold text-gray-900">{weather.uv_index_max.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">UV Index</div>
                                </div>
                              </div>

                              {weatherHistory.length > 1 && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-500 mb-2">Temperature Trend</div>
                                  <ResponsiveContainer width="100%" height={100}>
                                    <AreaChart data={weatherHistory}>
                                      <defs>
                                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <XAxis dataKey="time" hide />
                                      <YAxis hide domain={['auto', 'auto']} />
                                      <Tooltip
                                        contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                      />
                                      <Area type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} fill="url(#tempGradient)" />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>

                        {/* AQI Card with Graph */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                        >
                          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                                  <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-800">Air Quality</span>
                                  <div className="text-xs text-gray-500">Real-time monitoring</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-3xl font-bold ${aqi?.us_aqi <= 50 ? 'text-green-500' : aqi?.us_aqi <= 100 ? 'text-yellow-500' : 'text-red-500'}`}>
                                  {aqi?.us_aqi || 0}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">{aqi?.category?.replace(/_/g, " ")}</div>
                              </div>
                            </div>
                          </div>

                          {aqi && (
                            <div className="p-4">
                              <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                  <div className="text-sm font-bold text-gray-900">{aqi.pm25.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">PM2.5 μg/m³</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                  <div className="text-sm font-bold text-gray-900">{aqi.pm10.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">PM10 μg/m³</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                  <div className="text-sm font-bold text-gray-900">{aqi.ozone.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">O₃ μg/m³</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                  <div className="text-sm font-bold text-gray-900">{aqi.co.toFixed(0)}</div>
                                  <div className="text-xs text-gray-500">CO μg/m³</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                  <div className="text-sm font-bold text-gray-900">{aqi.no2.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">NO₂ μg/m³</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                  <div className="text-sm font-bold text-gray-900">{aqi.uv_index.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">UV Index</div>
                                </div>
                              </div>

                              {aqiHistory.length > 1 && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-500 mb-2">AQI Trend</div>
                                  <ResponsiveContainer width="100%" height={100}>
                                    <ComposedChart data={aqiHistory}>
                                      <defs>
                                        <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <XAxis dataKey="time" hide />
                                      <YAxis hide domain={[0, 'auto']} />
                                      <Tooltip
                                        contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                      />
                                      <Area type="monotone" dataKey="us_aqi" stroke="#8b5cf6" strokeWidth={2} fill="url(#aqiGradient)" />
                                      <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                    </ComposedChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </section>

                  {/* REMOTE SENSING IMAGERY SECTION */}
                  <section ref={el => sectionRefs.current["imagery"] = el} data-section="imagery">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-bold text-gray-900">Remote Sensing Imagery</h2>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Imagery Type Tabs */}
                        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
                          {IMAGERY_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isActive = activeImagery === type.id;
                            return (
                              <button
                                key={type.id}
                                onClick={() => setActiveImagery(type.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                                  isActive
                                    ? "border-current bg-white text-gray-900"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                }`}
                                style={{ borderColor: isActive ? type.color : "transparent", color: isActive ? type.color : undefined }}
                              >
                                <Icon className="w-4 h-4" />
                                {type.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Imagery Display */}
                        <div className="p-4">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeImagery}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                            >
                              {imagery[activeImagery] ? (
                                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                                  <img
                                    src={imagery[activeImagery]}
                                    alt={activeImagery}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                    {IMAGERY_TYPES.find(t => t.id === activeImagery)?.label}
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                  <div className="text-center text-gray-500">
                                    <Globe className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">Imagery Loading...</p>
                                    <p className="text-xs mt-1">Fetching remote sensing data</p>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* PILLAR SECTIONS - All 25 Metrics with Enhanced Visuals */}
                  {Object.entries(PILLAR_CONFIG).map(([pillarKey, config]) => {
                    const metrics = getPillarMetrics(pillarKey);
                    const score = satellite?.pillar_scores?.[pillarKey] || 0;
                    const Icon = config.icon;
                    const pillarMetrics = getPillarMetricKeys(pillarKey);

                    // Debug: count available metrics for D and E
                    const availableMetrics = pillarMetrics.filter(key => metrics[key]?.value !== undefined && metrics[key]?.value !== null);

                    return (
                      <section key={pillarKey} ref={el => sectionRefs.current[pillarKey] = el} data-section={pillarKey}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 0.5 }}
                          className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                        >
                          {/* Pillar Header */}
                          <div
                            className={`p-5 bg-gradient-to-r ${config.gradient} text-white`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                                  <Icon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                  <div className="text-2xl font-bold">{config.fullName}</div>
                                  <div className="text-sm opacity-80">{pillarMetrics.length} metrics analyzed</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-4xl font-bold">{score.toFixed(0)}</div>
                                <div className="text-sm opacity-80">/100 score</div>
                              </div>
                            </div>
                          </div>

                          {/* Charts Row */}
                          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Radar Chart for this pillar */}
                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <div className="text-xs font-semibold text-gray-600 mb-2">Metric Distribution</div>
                                {(() => {
                                  // Short unique labels for radar chart to avoid duplicates
                                  const shortLabels: Record<string, string> = {
                                    lst: "LST Day",
                                    lst_night: "LST Night",
                                    diurnal_range: "Diurnal",
                                    soil_moisture: "Soil",
                                    water_occurrence: "Water %",
                                    water_seasonality: "Seasonal",
                                    drought_index: "Drought",
                                    evaporative_stress: "ET Stress",
                                    elevation: "Elev",
                                    elevation_min: "Elev Min",
                                    elevation_max: "Elev Max",
                                    elevation_relief: "Relief",
                                    population: "Pop",
                                    nightlights: "Lights",
                                    human_modification: "Human",
                                    distance_to_water: "Dist H2O",
                                  };

                                  // Generate radar data and check if we have actual values
                                  const radarData = pillarMetrics.slice(0, 8).map(key => {
                                    const rawValue = metrics[key]?.value;
                                    const hasValue = rawValue !== undefined && rawValue !== null;
                                    const normalizedVal = hasValue ? getNormalizedValue(rawValue, key) : 0;
                                    return {
                                      metric: shortLabels[key] || METRIC_CONFIG[key]?.label.split(" ")[0] || key,
                                      value: normalizedVal,
                                      rawValue: rawValue,
                                      fullMark: 100,
                                    };
                                  });

                                  // Check if we have at least some real data (not all zeros)
                                  const hasRealData = radarData.some(d => d.value > 0);

                                  if (pillarMetrics.length >= 3 && hasRealData) {
                                    // Ensure all values are valid numbers (not NaN or undefined)
                                    const cleanRadarData = radarData.map(d => ({
                                      ...d,
                                      value: typeof d.value === 'number' && !isNaN(d.value) ? d.value : 0
                                    }));

                                    // Debug: log radar data for each pillar
                                    console.log(`Radar_${pillarKey}:`, JSON.stringify(cleanRadarData.map(d => ({ m: d.metric, v: d.value.toFixed(1) }))));

                                    return (
                                      <div className="h-44 w-full">
                                        <ResponsiveContainer width="100%" height={176}>
                                          <RadarChart data={cleanRadarData} cx="50%" cy="50%" outerRadius="70%">
                                            <PolarGrid stroke="#e5e7eb" />
                                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                              name={config.fullName}
                                              dataKey="value"
                                              stroke={config.color}
                                              strokeWidth={2}
                                              fill={config.color}
                                              fillOpacity={0.6}
                                              dot={{ r: 3, fill: config.color }}
                                              isAnimationActive={false}
                                            />
                                            <Tooltip />
                                          </RadarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    );
                                  } else if (pillarMetrics.length >= 3) {
                                    return (
                                      <div className="h-44 flex flex-col items-center justify-center text-gray-400 text-xs">
                                        <div>Awaiting data...</div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="h-44 flex items-center justify-center text-gray-400 text-xs">Loading...</div>
                                    );
                                  }
                                })()}
                              </div>

                              {/* Bar Chart for metrics */}
                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <div className="text-xs font-semibold text-gray-600 mb-2">Metric Values (Normalized)</div>
                                {(() => {
                                  // Generate bar data with same logic as radar for consistency
                                  const barData = pillarMetrics.map(key => {
                                    const rawValue = metrics[key]?.value;
                                    const hasValue = rawValue !== undefined && rawValue !== null;
                                    return {
                                      name: METRIC_CONFIG[key]?.label.split(" ")[0] || key,
                                      value: hasValue ? getNormalizedValue(rawValue, key) : 0,
                                      raw: rawValue,
                                      quality: metrics[key]?.quality || "unavailable"
                                    };
                                  });

                                  const hasBarData = barData.some(d => d.value > 0 || d.raw !== undefined);

                                  if (pillarMetrics.length > 0 && hasBarData) {
                                    return (
                                      <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={barData}>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                                          <Tooltip
                                            formatter={(value: any, name: any, props: any) => [
                                              `${props.payload.raw?.toFixed(2) || 'N/A'} (${(value as number).toFixed(0)}% normalized)`,
                                              props.payload.name
                                            ]}
                                          />
                                          <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    );
                                  } else {
                                    return (
                                      <div className="h-44 flex flex-col items-center justify-center text-gray-400 text-xs">
                                        <div>Data loading...</div>
                                        <div className="text-[10px] mt-1">Waiting for response</div>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Metrics Grid - Responsive for varying metric counts */}
                          <div className={`p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${pillarMetrics.length > 10 ? 'lg:grid-cols-4 xl:grid-cols-5' : 'lg:grid-cols-5'} gap-3`}>
                            {pillarMetrics.map((metricKey, index) => {
                              const metricConfig = METRIC_CONFIG[metricKey];
                              const metricData = metrics[metricKey] || {};
                              const MetricIcon = metricConfig?.icon || Activity;
                              const normalizedValue = getNormalizedValue(metricData.value || 0, metricKey);
                              const hasValue = metricData.value !== null && metricData.value !== undefined;

                              return (
                                <motion.div
                                  key={metricKey}
                                  initial={{ opacity: 0, y: 10 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  className={`bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-100 hover:shadow-md transition-all ${!hasValue ? 'opacity-60' : ''}`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div
                                      className="w-7 h-7 rounded-md flex items-center justify-center"
                                      style={{ backgroundColor: config.color + "15" }}
                                    >
                                      <MetricIcon className="w-3.5 h-3.5" style={{ color: config.color }} />
                                    </div>
                                    {metricData.quality && (
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getQualityBadge(metricData.quality)}`}>
                                        {metricData.quality}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-gray-500 mb-0.5 font-medium truncate" title={metricConfig?.label || metricKey}>
                                    {metricConfig?.label || metricKey}
                                  </div>
                                  <div className="text-xl font-bold text-gray-900 mb-0.5">
                                    {hasValue ? formatValue(metricData.value) : "N/A"}
                                  </div>
                                  <div className="text-[10px] text-gray-400 mb-2">{metricConfig?.unit || metricData.unit || ""}</div>

                                  {/* Visual gauge */}
                                  {hasValue && (
                                    <>
                                      <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          whileInView={{ width: `${normalizedValue}%` }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.6, delay: Math.min(index * 0.03, 0.3) }}
                                          className="absolute h-full rounded-full"
                                          style={{
                                            background: `linear-gradient(90deg, ${config.color}80, ${config.color})`
                                          }}
                                        />
                                      </div>
                                      <div className="flex justify-between mt-0.5 text-[9px] text-gray-400">
                                        <span>{metricConfig?.min ?? 0}</span>
                                        <span>{metricConfig?.max ?? 100}</span>
                                      </div>
                                    </>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>


      </div>
    </div>
  );
};

export default Dashboard;
