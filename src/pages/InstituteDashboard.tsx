/**
 * InstituteDashboard.tsx - Institute-specific Dashboard for Polygon Areas
 *
 * Displays PPA data for an institute's polygon (4-point) land area.
 * Uses the polygon query API endpoint for data fetching.
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-new.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer, Droplets, Wind, Cloud, Sun, Gauge,
  Leaf, TreeDeciduous, Activity, Waves, Users,
  RefreshCw, MapPin, Clock, AlertCircle,
  Mountain, Zap, TreePine, Eye, Globe, Layers,
  BarChart3, Factory, Menu, X, LogOut, Building2
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { getInstituteSession, logoutInstitute } from "@/services/instituteAuth";
import type { InstituteSession } from "@/types/institute";

// API URLs
const API_URL = import.meta.env.VITE_PHI_API_URL || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Pillar configuration
const PILLAR_CONFIG = {
  A: { id: "A", name: "Atmospheric", fullName: "Atmospheric Health", color: "#3498db", icon: Wind, gradient: "from-blue-500 to-blue-600" },
  B: { id: "B", name: "Biodiversity", fullName: "Biodiversity", color: "#27ae60", icon: Leaf, gradient: "from-green-500 to-green-600" },
  C: { id: "C", name: "Climate", fullName: "Climate", color: "#8e44ad", icon: TreePine, gradient: "from-purple-500 to-purple-600" },
  D: { id: "D", name: "DLWD", fullName: "Decrease in Land & Water Degradation", color: "#e74c3c", icon: Thermometer, gradient: "from-red-500 to-red-600" },
  E: { id: "E", name: "Ecosystem", fullName: "Ecosystem Services", color: "#f39c12", icon: Globe, gradient: "from-orange-500 to-orange-600" },
};

// Metric configurations
const METRIC_CONFIG: Record<string, { label: string; unit: string; description: string; icon: any; min?: number; max?: number }> = {
  // Pillar A - Atmospheric
  aod: { label: "Aerosol Optical Depth", unit: "", description: "Atmospheric particle density", icon: Cloud, min: 0, max: 1 },
  visibility: { label: "Visibility", unit: "km", description: "Atmospheric clarity", icon: Eye, min: 0, max: 50 },
  temperature: { label: "Air Temperature", unit: "°C", description: "Current ambient temperature", icon: Thermometer, min: -20, max: 50 },
  humidity: { label: "Relative Humidity", unit: "%", description: "Air moisture content", icon: Droplets, min: 0, max: 100 },
  cloud_cover: { label: "Cloud Cover", unit: "%", description: "Overall cloud coverage", icon: Cloud, min: 0, max: 100 },
  pressure: { label: "Surface Pressure", unit: "hPa", description: "Atmospheric pressure", icon: Gauge, min: 950, max: 1050 },
  wind_speed: { label: "Wind Speed", unit: "km/h", description: "Wind velocity", icon: Wind, min: 0, max: 100 },
  uv_index: { label: "UV Index", unit: "index", description: "Ultraviolet radiation level", icon: Sun, min: 0, max: 11 },
  aqi: { label: "Air Quality Index", unit: "US AQI", description: "Overall air quality", icon: Activity, min: 0, max: 500 },
  pm2_5: { label: "PM2.5", unit: "μg/m³", description: "Fine particulate matter", icon: Cloud, min: 0, max: 500 },

  // Pillar B - Biodiversity
  ndvi: { label: "NDVI", unit: "", description: "Vegetation greenness", icon: Leaf, min: -1, max: 1 },
  evi: { label: "EVI", unit: "", description: "Enhanced vegetation index", icon: Leaf, min: -1, max: 2.5 },
  lai: { label: "Leaf Area Index", unit: "m²/m²", description: "Leaf density per area", icon: Leaf, min: 0, max: 10 },
  fpar: { label: "FPAR", unit: "fraction", description: "Absorbed sunlight", icon: Sun, min: 0, max: 1 },
  land_cover: { label: "Land Cover", unit: "class", description: "Land use classification", icon: Layers, min: 0, max: 100 },

  // Pillar C - Climate
  tree_cover: { label: "Tree Cover", unit: "%", description: "Forest canopy percentage", icon: TreePine, min: 0, max: 1 },
  forest_loss: { label: "Forest Loss", unit: "binary", description: "Deforestation detection", icon: TreeDeciduous, min: 0, max: 1 },
  canopy_height: { label: "Canopy Height", unit: "m", description: "Average tree height", icon: TreePine, min: 0, max: 50 },
  biomass: { label: "Biomass", unit: "Mg/ha", description: "Above-ground biomass", icon: Leaf, min: 0, max: 500 },
  carbon_stock: { label: "Carbon Stock", unit: "Mg C/ha", description: "Stored carbon", icon: Factory, min: 0, max: 250 },

  // Pillar D - Degradation
  lst: { label: "Land Surface Temp", unit: "°C", description: "Ground temperature", icon: Thermometer, min: -20, max: 60 },
  soil_moisture: { label: "Soil Moisture", unit: "m³/m³", description: "Soil water content", icon: Droplets, min: 0, max: 1 },
  water_occurrence: { label: "Water Occurrence", unit: "%", description: "Historical water presence", icon: Waves, min: 0, max: 100 },
  drought_index: { label: "Drought Index", unit: "index", description: "Drought severity", icon: Sun, min: -3, max: 3 },

  // Pillar E - Ecosystem
  population: { label: "Population Density", unit: "people/km²", description: "Human population", icon: Users, min: 0, max: 50000 },
  nightlights: { label: "Night Lights", unit: "nW/cm²/sr", description: "Urban light intensity", icon: Zap, min: 0, max: 100 },
  human_modification: { label: "Human Modification", unit: "index", description: "Landscape alteration", icon: Factory, min: 0, max: 1 },
  elevation: { label: "Elevation", unit: "m", description: "Height above sea level", icon: Mountain, min: -100, max: 5000 },
};

const SECTION_IDS = ["overview", "A", "B", "C", "D", "E"];

const InstituteDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<InstituteSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePillar, setActivePillar] = useState<string>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Data states
  const [satellite, setSatellite] = useState<any>(null);
  const [rawPillars, setRawPillars] = useState<any>(null);
  const [polygonArea, setPolygonArea] = useState<number | null>(null);

  // Refs for scroll tracking
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load session on mount
  useEffect(() => {
    const currentSession = getInstituteSession();
    if (!currentSession) {
      navigate("/institute/login");
      return;
    }
    setSession(currentSession);
  }, [navigate]);

  // Setup Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section");
            if (sectionId) setActivePillar(sectionId);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  // Observe sections
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

  // Fetch polygon data
  const fetchPolygonData = async () => {
    if (!session?.polygon?.coordinates) return;

    try {
      setLoading(true);
      setError(null);

      // Convert coordinates to API format
      const points = session.polygon.coordinates.map((coord, idx) => ({
        lat: coord[0],
        lng: coord[1],
        label: ["NW", "NE", "SE", "SW"][idx] || `P${idx + 1}`
      }));

      const response = await fetch(`${API_URL}/api/query/polygon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points,
          mode: "comprehensive",
          include_scores: true,
          user_id: session.instituteId,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const d = data.data;
        setSatellite({
          overall_score: d.summary?.overall_score || 0,
          overall_interpretation: d.summary?.overall_interpretation || "Unknown",
          pillar_scores: d.summary?.pillar_scores || {},
          ecosystem_type: d.summary?.ecosystem_type || "unknown",
        });
        setRawPillars(d.pillars || {});
        setPolygonArea(d.summary?.area_hectares || null);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || "Failed to fetch polygon data");
      }
    } catch (err) {
      console.error("Failed to fetch polygon data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session) fetchPolygonData();
  }, [session]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPolygonData();
  };

  const handleLogout = () => {
    logoutInstitute();
    navigate("/institute/login");
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  // Utility functions
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

  const formatValue = (value: any, decimals = 2) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") {
      if (Math.abs(value) >= 1000) return value.toLocaleString();
      return value.toFixed(decimals);
    }
    return String(value);
  };

  const getRadarData = () => {
    if (!satellite?.pillar_scores) return [];
    return Object.entries(satellite.pillar_scores).map(([key, value]) => ({
      subject: PILLAR_CONFIG[key as keyof typeof PILLAR_CONFIG]?.name || key,
      score: value as number,
      fullMark: 100,
    }));
  };

  const getPillarMetrics = (pillarKey: string) => {
    const pillarKeyVariants: Record<string, string[]> = {
      A: ["A_atmospheric", "A", "atmospheric"],
      B: ["B_biodiversity", "B", "biodiversity"],
      C: ["C_carbon", "C", "carbon", "climate"],
      D: ["D_degradation", "D", "degradation"],
      E: ["E_ecosystem", "E", "ecosystem"],
    };

    let rawMetrics: Record<string, any> = {};
    const variants = pillarKeyVariants[pillarKey] || [pillarKey];
    for (const variant of variants) {
      if (rawPillars?.[variant]?.metrics) {
        rawMetrics = rawPillars[variant].metrics;
        break;
      }
    }

    const flattenedMetrics: Record<string, any> = {};
    Object.entries(rawMetrics).forEach(([key, data]: [string, any]) => {
      flattenedMetrics[key] = data;
      if (key === 'lst' && data) {
        if (data.lst_night !== undefined) flattenedMetrics['lst_night'] = { value: data.lst_night, unit: '°C', quality: data.quality };
        if (data.diurnal_range !== undefined) flattenedMetrics['diurnal_range'] = { value: data.diurnal_range, unit: '°C', quality: data.quality };
      }
      if (key === 'elevation' && data) {
        if (data.min !== undefined) flattenedMetrics['elevation_min'] = { value: data.min, unit: 'm', quality: data.quality };
        if (data.max !== undefined) flattenedMetrics['elevation_max'] = { value: data.max, unit: 'm', quality: data.quality };
      }
    });

    return flattenedMetrics;
  };

  const getPillarMetricKeys = (pillarKey: string) => {
    const metricsByPillar: Record<string, string[]> = {
      A: ["aod", "visibility"],
      B: ["ndvi", "evi", "lai", "fpar", "land_cover"],
      C: ["tree_cover", "forest_loss", "canopy_height", "biomass", "carbon_stock"],
      D: ["lst", "soil_moisture", "water_occurrence", "drought_index"],
      E: ["population", "nightlights", "human_modification", "elevation"],
    };
    return metricsByPillar[pillarKey] || [];
  };

  const getNormalizedValue = (value: number, metricKey: string) => {
    const config = METRIC_CONFIG[metricKey];
    if (!config || value === null || value === undefined) return 0;
    const min = config.min || 0;
    const max = config.max || 100;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  const getPillarRadarData = (pillarKey: string) => {
    const metrics = getPillarMetrics(pillarKey);
    const metricKeys = getPillarMetricKeys(pillarKey);
    return metricKeys.map((key) => ({
      metric: METRIC_CONFIG[key]?.label.split(" ")[0] || key,
      value: getNormalizedValue(metrics[key]?.value || 0, key),
      fullMark: 100,
    }));
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D2821]" />
      </div>
    );
  }

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
        {/* Fixed Top Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 z-30 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <img src={logo} alt="ErthaLoka" className="h-7 md:h-8 w-auto" />
            <div className="hidden sm:flex items-center gap-2 ml-4 text-sm">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">{session.instituteName}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="lg:hidden text-right">
              <div className="text-xs text-gray-500">PPA Score</div>
              <div className="text-lg font-bold text-[#0D2821]">{satellite?.overall_score?.toFixed(0) || "—"}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed top-16 left-0 bottom-0 w-72 bg-white z-50 overflow-y-auto shadow-xl"
              >
                <div className="p-4">
                  <div className="bg-gradient-to-br from-[#0D2821] to-[#1a4a3d] rounded-2xl p-4 text-white mb-4">
                    <div className="text-xs opacity-70 mb-1">Planetary Performance Assessment</div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{satellite?.overall_score?.toFixed(1) || "—"}</span>
                      <span className="text-sm mb-1 opacity-70">/100</span>
                    </div>
                    <div className="text-xs opacity-70 mt-1 capitalize">{satellite?.overall_interpretation || "Loading..."}</div>
                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${satellite?.overall_score || 0}%` }}
                        className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
                      />
                    </div>
                  </div>

                  <nav className="space-y-1">
                    <button
                      onClick={() => scrollToSection("overview")}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${activePillar === "overview" ? "bg-[#0D2821] text-white" : "hover:bg-gray-100"}`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-medium">Overview</span>
                    </button>
                    {Object.entries(PILLAR_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      const score = satellite?.pillar_scores?.[key] || 0;
                      return (
                        <button
                          key={key}
                          onClick={() => scrollToSection(key)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${activePillar === key ? "bg-[#0D2821] text-white" : "hover:bg-gray-100"}`}
                        >
                          <Icon className="w-5 h-5" style={{ color: activePillar === key ? "white" : config.color }} />
                          <span className="font-medium flex-1">{config.name}</span>
                          <span className={`text-sm font-bold ${activePillar === key ? "text-white" : getScoreColor(score)}`}>
                            {score.toFixed(0)}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Left Sidebar - Desktop */}
        <aside className="hidden lg:flex fixed top-16 left-0 bottom-0 w-72 border-r border-gray-200 bg-white/80 backdrop-blur-sm flex-col p-4 overflow-y-auto z-20">
          <div className="bg-gradient-to-br from-[#0D2821] to-[#1a4a3d] rounded-2xl p-5 text-white mb-6">
            <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
              <Building2 className="w-4 h-4" />
              {session.instituteName}
            </div>
            <div className="text-xs opacity-70 mb-1">Planetary Performance Assessment</div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{satellite?.overall_score?.toFixed(1) || "—"}</span>
              <span className="text-sm mb-1 opacity-70">/100</span>
            </div>
            <div className="text-sm opacity-70 mt-2 capitalize">{satellite?.overall_interpretation || "Loading..."}</div>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${satellite?.overall_score || 0}%` }}
                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
              />
            </div>
            {polygonArea && (
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{polygonArea.toFixed(2)} hectares</span>
              </div>
            )}
          </div>

          <nav className="space-y-1 flex-1">
            <button
              onClick={() => scrollToSection("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activePillar === "overview" ? "bg-[#0D2821] text-white shadow-lg" : "hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>

            <div className="pt-2 pb-1">
              <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pillars</span>
            </div>

            {Object.entries(PILLAR_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const score = satellite?.pillar_scores?.[key] || 0;
              return (
                <button
                  key={key}
                  onClick={() => scrollToSection(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activePillar === key ? "bg-[#0D2821] text-white shadow-lg" : "hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" style={{ color: activePillar === key ? "white" : config.color }} />
                  <span className="font-medium flex-1 text-left">{config.name}</span>
                  <span className={`text-sm font-bold ${activePillar === key ? "text-white" : getScoreColor(score)}`}>
                    {score.toFixed(0)}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium">{refreshing ? "Refreshing..." : "Refresh Data"}</span>
            </button>
            {lastUpdated && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-72 pt-16 min-h-screen">
          <div className="p-4 md:p-8 max-w-6xl">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D2821] mx-auto mb-4" />
                  <p className="text-gray-600">Loading polygon data...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800">Error Loading Data</h3>
                    <p className="text-red-600 mt-1">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {!loading && !error && (
              <>
                {/* Overview Section */}
                <section
                  ref={(el) => (sectionRefs.current["overview"] = el)}
                  className="mb-8"
                >
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {session.instituteName} Dashboard
                  </h1>

                  {/* PHI Overview Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Radar Chart */}
                      <div className="flex-1 min-h-[250px]">
                        <h3 className="text-lg font-semibold mb-4">Pillar Scores</h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <RadarChart data={getRadarData()} outerRadius={70}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Radar
                              name="Score"
                              dataKey="score"
                              stroke="#0D2821"
                              fill="#0D2821"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                            <Tooltip formatter={(value: number) => `${value.toFixed(1)}/100`} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pillar Cards */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-4">Pillar Breakdown</h3>
                        <div className="flex flex-col gap-3 min-[400px]:grid min-[400px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:flex lg:flex-col">
                          {Object.entries(PILLAR_CONFIG).map(([key, config]) => {
                            const Icon = config.icon;
                            const score = satellite?.pillar_scores?.[key] || 0;
                            return (
                              <button
                                key={key}
                                onClick={() => scrollToSection(key)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
                              >
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium text-gray-700">{config.name}</div>
                                  <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                                    {score.toFixed(1)}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Pillar Sections */}
                {Object.entries(PILLAR_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  const score = satellite?.pillar_scores?.[key] || 0;
                  const metrics = getPillarMetrics(key);
                  const metricKeys = getPillarMetricKeys(key);
                  const radarData = getPillarRadarData(key);

                  return (
                    <section
                      key={key}
                      ref={(el) => (sectionRefs.current[key] = el)}
                      className="mb-8 scroll-mt-20"
                    >
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Pillar Header */}
                        <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Icon className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-xl font-bold">{config.fullName}</h2>
                                <p className="text-sm opacity-80">Pillar {key}</p>
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
                                <RadarChart data={radarData} outerRadius={60}>
                                  <PolarGrid stroke="#e5e7eb" />
                                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#6b7280" }} />
                                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                  <Radar
                                    dataKey="value"
                                    stroke={config.color}
                                    fill={config.color}
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
                                const metricData = metrics[metricKey];
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
                    </section>
                  );
                })}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstituteDashboard;
