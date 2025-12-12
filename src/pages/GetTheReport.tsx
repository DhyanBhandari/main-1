import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Globe from "@/components/Globe";
import {
  Leaf,
  Wind,
  TreePine,
  Thermometer,
  Globe as GlobeIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Database,
  Download,
  FileText,
  Clock
} from "lucide-react";
import { useScroll } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import Chart.js components
import { BarChart, RadarChart } from "@/components/charts";

// Import API service and types
import { fetchPHIReport, formatAPIError, getComprehensiveExternalData } from "@/services/phiApi";
import {
  PHIResponse,
  PILLAR_CONFIGS,
  getPillarId,
  getQualityColor,
  formatMetricValue
} from "@/types/phi";
import { ComprehensiveExternalData } from "@/types/weather";


// Import Imagery Viewer
import ImageryViewer from "@/components/ImageryViewer";

// Import PHI Score Summary component
import PHIScoreSummary from "@/components/PHIScoreSummary";

// Import ESV Breakdown component
import ESVBreakdown from "@/components/ESVBreakdown";

// Import metric supplementation service
import {
  supplementMetrics,
  preparePillarRadarData,
  getDataTimestamp
} from "@/services/metricSupplementation";

// Icon mapping for pillars
const PILLAR_ICONS: Record<string, React.ElementType> = {
  A: Wind,
  B: Leaf,
  C: TreePine,
  D: Thermometer,
  E: GlobeIcon
};

// Quality icon component
const QualityBadge = ({ quality }: { quality?: string }) => {
  const color = getQualityColor(quality);
  const Icon = quality === 'good' ? CheckCircle :
               quality === 'moderate' ? AlertCircle :
               quality === 'poor' ? XCircle : AlertCircle;

  return (
    <span className="inline-flex items-center gap-1 text-xs" style={{ color }}>
      <Icon className="w-3 h-3" />
      {quality || 'unknown'}
    </span>
  );
};

// Pillar explanations - what each pillar measures
const PILLAR_INFO: Record<string, { summary: string; importance: string }> = {
  A: {
    summary: "Monitors air quality through particle concentration, pollutant levels, and UV radiation",
    importance: "Clean air is fundamental to human health, ecosystem vitality, and climate stability"
  },
  B: {
    summary: "Tracks vegetation health, plant density, and land cover patterns using multispectral imagery",
    importance: "Healthy vegetation produces oxygen, absorbs CO2, prevents erosion, and supports wildlife"
  },
  C: {
    summary: "Measures forest coverage, tree height, and biomass to estimate carbon storage capacity",
    importance: "Forests are Earth's largest carbon sinks, critical for mitigating climate change"
  },
  D: {
    summary: "Assesses land degradation through temperature, moisture, and drought indicators",
    importance: "Land degradation threatens food security, water resources, and ecosystem resilience"
  },
  E: {
    summary: "Evaluates human presence and modification of natural landscapes",
    importance: "Balancing human development with ecosystem preservation is key to sustainability"
  }
};

// Metric explanations - what they are and environmental impact
const METRIC_INFO: Record<string, { description: string; impact: string }> = {
  // Atmospheric
  aod: {
    description: "Aerosol Optical Depth - measures particles suspended in the atmosphere",
    impact: "High values indicate air pollution, affecting respiratory health and climate"
  },
  aqi: {
    description: "Air Quality Index - composite measure of air pollutants",
    impact: "Poor air quality causes respiratory diseases and reduces life expectancy"
  },
  uv_index: {
    description: "Ultraviolet radiation intensity at Earth's surface",
    impact: "High UV damages skin, eyes, and can harm ecosystems and crops"
  },
  // Biodiversity
  ndvi: {
    description: "Normalized Difference Vegetation Index - measures plant health and density",
    impact: "Higher values indicate thriving vegetation, essential for oxygen production and carbon capture"
  },
  evi: {
    description: "Enhanced Vegetation Index - advanced measure of canopy greenness",
    impact: "Tracks photosynthetic activity; declining values signal ecosystem stress"
  },
  lai: {
    description: "Leaf Area Index - total leaf surface area per ground area",
    impact: "Higher LAI means more carbon absorption and better microclimate regulation"
  },
  fpar: {
    description: "Fraction of Absorbed Photosynthetically Active Radiation",
    impact: "Indicates how efficiently plants convert sunlight; crucial for food production"
  },
  land_cover: {
    description: "Dominant land use classification in the area",
    impact: "Land cover changes affect biodiversity, water cycles, and carbon storage"
  },
  // Carbon
  tree_cover: {
    description: "Percentage of area covered by tree canopy",
    impact: "Forests are major carbon sinks; loss accelerates climate change"
  },
  forest_loss: {
    description: "Area of forest lost in recent years",
    impact: "Deforestation releases stored carbon and destroys wildlife habitats"
  },
  canopy_height: {
    description: "Average height of tree canopy in meters",
    impact: "Taller forests store more carbon and support greater biodiversity"
  },
  biomass: {
    description: "Above-ground living organic matter (tons per hectare)",
    impact: "Higher biomass means more carbon locked away from the atmosphere"
  },
  // Degradation
  lst: {
    description: "Land Surface Temperature - ground thermal readings",
    impact: "Rising temperatures stress ecosystems, reduce water availability, increase fire risk"
  },
  soil_moisture: {
    description: "Water content in the upper soil layer",
    impact: "Low moisture leads to drought, crop failure, and increased wildfire danger"
  },
  drought_index: {
    description: "Standardized measure of drought severity",
    impact: "Severe drought devastates agriculture, water supplies, and natural habitats"
  },
  // Ecosystem
  population: {
    description: "Human population density (people per square km)",
    impact: "Higher density increases resource consumption and environmental pressure"
  },
  nightlights: {
    description: "Artificial light intensity at night",
    impact: "Light pollution disrupts wildlife, wastes energy, and indicates urbanization"
  },
  human_modification: {
    description: "Degree of human alteration to natural landscape (0-1 scale)",
    impact: "Higher modification reduces biodiversity and ecosystem services"
  },
  elevation: {
    description: "Height above sea level in meters",
    impact: "Elevation affects climate, vegetation zones, and water availability"
  },
  distance_to_water: {
    description: "Distance to nearest permanent water body",
    impact: "Water access is critical for ecosystems, agriculture, and human settlements"
  }
};

// Get metric info with fallback
const getMetricInfo = (metricName: string) => {
  return METRIC_INFO[metricName] || {
    description: "Environmental measurement",
    impact: "Contributes to overall ecosystem health assessment"
  };
};

// Helper to normalize values for radar chart (0-100 scale)
const normalizeValue = (value: number | null, metricName: string): number => {
  if (value === null || value === undefined) return 0;

  // Normalize based on metric type
  switch (metricName) {
    case 'ndvi':
    case 'evi':
      // Range: -1 to 1, normalize to 0-100
      return Math.max(0, Math.min(100, (value + 1) * 50));
    case 'lai':
      // Range: 0-7, normalize to 0-100
      return Math.max(0, Math.min(100, (value / 7) * 100));
    case 'fpar':
      // Range: 0-1, normalize to 0-100
      return Math.max(0, Math.min(100, value * 100));
    case 'aod':
      // Range: 0-1 (inverted, lower is better)
      return Math.max(0, Math.min(100, (1 - value) * 100));
    case 'tree_cover':
      // Already 0-100
      return Math.max(0, Math.min(100, value));
    case 'human_modification':
      // Range: 0-1 (inverted for health)
      return Math.max(0, Math.min(100, (1 - value) * 100));
    case 'soil_moisture':
      // Range: 0-1, normalize to 0-100
      return Math.max(0, Math.min(100, value * 100));
    default:
      // Generic normalization
      return Math.max(0, Math.min(100, value));
  }
};

const GetTheReport = () => {
  const location = useLocation();
  const { latitude, longitude } = location.state || { latitude: 0, longitude: 0 };
  const { scrollYProgress } = useScroll();
  const reportRef = useRef<HTMLDivElement>(null);

  // API State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phiData, setPhiData] = useState<PHIResponse | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // External Data State (for metric supplementation)
  const [externalData, setExternalData] = useState<ComprehensiveExternalData | null>(null);
  const [dataTimestamp, setDataTimestamp] = useState<string>('');

  // PDF Download function
  const downloadPDF = async () => {
    if (!reportRef.current || !phiData) return;

    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (height: number) => {
        if (yPosition + height > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Add wrapped text and return new Y position
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, color: number[]) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string, index: number) => {
          if (checkPageBreak(fontSize * 0.4)) {
            // Page break occurred, reset position
          }
          pdf.text(line, x, yPosition);
          yPosition += fontSize * 0.4;
        });
        return yPosition;
      };

      // ===== HEADER SECTION =====
      pdf.setFontSize(22);
      pdf.setTextColor(13, 40, 33);
      pdf.text('Planetary Health Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Remote Sensing Data Analysis', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Location box
      pdf.setFillColor(240, 240, 240);
      pdf.roundedRect(margin + 30, yPosition - 2, contentWidth - 60, 12, 2, 2, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Location: ${latitude?.toFixed(4)}°, ${longitude?.toFixed(4)}°`, pageWidth / 2, yPosition + 5, { align: 'center' });
      yPosition += 15;

      // Date and completeness
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      if (phiData.summary) {
        pdf.text(`Data Completeness: ${(phiData.summary.data_completeness * 100).toFixed(0)}%`, pageWidth - margin, yPosition, { align: 'right' });
      }
      yPosition += 8;

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;

      // ===== PILLARS SECTION =====
      Object.entries(phiData.pillars).forEach(([key, pillar]) => {
        const pillarId = getPillarId(key);
        const pillarInfo = PILLAR_INFO[pillarId];

        checkPageBreak(50);

        // Pillar header with colored bar
        pdf.setFillColor(13, 40, 33);
        pdf.rect(margin, yPosition - 4, 3, 12, 'F');

        pdf.setFontSize(14);
        pdf.setTextColor(13, 40, 33);
        pdf.setFont('helvetica', 'bold');
        pdf.text(pillar.pillar_name, margin + 6, yPosition + 3);
        yPosition += 10;

        // Pillar description
        if (pillarInfo) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(80, 80, 80);
          const summaryLines = pdf.splitTextToSize(pillarInfo.summary, contentWidth);
          pdf.text(summaryLines, margin, yPosition);
          yPosition += summaryLines.length * 4 + 2;

          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.setFont('helvetica', 'italic');
          const importanceLines = pdf.splitTextToSize(`Why it matters: ${pillarInfo.importance}`, contentWidth);
          pdf.text(importanceLines, margin, yPosition);
          yPosition += importanceLines.length * 3.5 + 6;
          pdf.setFont('helvetica', 'normal');
        }

        // Metrics section
        Object.entries(pillar.metrics).forEach(([metricName, metric]) => {
          checkPageBreak(18);

          const metricInfo = getMetricInfo(metricName);
          const displayName = metricName.replace(/_/g, ' ');
          const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

          // Metric name (bold)
          pdf.setFontSize(10);
          pdf.setTextColor(40, 40, 40);
          pdf.setFont('helvetica', 'bold');
          pdf.text(capitalizedName, margin, yPosition);

          // Value (right aligned, colored)
          const value = metric.value !== null && metric.value !== undefined
            ? `${typeof metric.value === 'number' ? metric.value.toFixed(4) : metric.value} ${metric.unit || ''}`
            : 'N/A';
          pdf.setTextColor(13, 100, 60);
          pdf.text(value, pageWidth - margin, yPosition, { align: 'right' });
          yPosition += 5;

          // Description
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(80, 80, 80);
          const descLines = pdf.splitTextToSize(metricInfo.description, contentWidth);
          pdf.text(descLines, margin + 3, yPosition);
          yPosition += descLines.length * 3.5;

          // Impact
          pdf.setFontSize(7);
          pdf.setTextColor(110, 110, 110);
          pdf.setFont('helvetica', 'italic');
          const impactLines = pdf.splitTextToSize(`Environmental Impact: ${metricInfo.impact}`, contentWidth - 6);
          pdf.text(impactLines, margin + 3, yPosition);
          yPosition += impactLines.length * 3 + 4;
          pdf.setFont('helvetica', 'normal');
        });

        yPosition += 5;

        // Separator between pillars
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      });

      // ===== QUALITY FLAGS SECTION =====
      if (phiData.summary?.quality_flags && phiData.summary.quality_flags.length > 0) {
        checkPageBreak(25);

        pdf.setFillColor(255, 243, 224);
        pdf.rect(margin, yPosition - 3, contentWidth, 8 + phiData.summary.quality_flags.length * 5, 'F');

        pdf.setFontSize(11);
        pdf.setTextColor(180, 100, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Data Quality Notes', margin + 3, yPosition + 2);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(140, 90, 30);
        phiData.summary.quality_flags.forEach((flag) => {
          checkPageBreak(5);
          pdf.text(`• ${flag.replace(/_/g, ' ')}`, margin + 5, yPosition);
          yPosition += 4;
        });
        yPosition += 5;
      }

      // ===== FOOTER =====
      // Add footer to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          'Generated by Erthaloka Planetary Health Index System',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      // Save the PDF
      pdf.save(`PHI_Report_${latitude?.toFixed(2)}_${longitude?.toFixed(2)}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Fetch PHI data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!latitude || !longitude) {
        setError("Location coordinates are required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchPHIReport({
          latitude,
          longitude,
          mode: 'comprehensive',
          temporal: 'latest'
        });
        setPhiData(data);
      } catch (err) {
        setError(formatAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [latitude, longitude]);

  // Fetch External data on mount (for metric supplementation into pillars)
  useEffect(() => {
    const fetchExternalData = async () => {
      if (!latitude || !longitude) {
        return;
      }

      try {
        // Fetch comprehensive external data for pillar metrics
        const comprehensiveResult = await getComprehensiveExternalData(latitude, longitude);

        setExternalData(comprehensiveResult);
        setDataTimestamp(getDataTimestamp());

        console.log('[GetTheReport] External data fetched:', {
          airQuality: comprehensiveResult?.air_quality?.primary_aqi,
          soil: comprehensiveResult?.soil?.available,
          weather: comprehensiveResult?.weather?.available
        });
      } catch (err) {
        console.error('External data fetch error:', err);
      }
    };

    fetchExternalData();
  }, [latitude, longitude]);

  // Supplement PHI data with external data when both are available
  useEffect(() => {
    if (phiData && externalData) {
      const supplemented = supplementMetrics(phiData, externalData);
      if (supplemented !== phiData) {
        setPhiData(supplemented);
        console.log('[GetTheReport] PHI data supplemented with external API data');
      }
    }
  }, [externalData]); // Only run when externalData changes

  // Prepare bar chart data from raw metrics
  const prepareBarChartData = (pillarKey: string) => {
    if (!phiData?.pillars?.[pillarKey]) return null;

    const pillar = phiData.pillars[pillarKey];
    const metrics = pillar.metrics;

    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];

    Object.entries(metrics).forEach(([name, data]) => {
      if (data.value !== null && data.value !== undefined) {
        labels.push(name.replace(/_/g, ' ').toUpperCase());
        values.push(normalizeValue(data.value, name));
        colors.push(pillar.pillar_color || '#666');
      }
    });

    return { labels, values, color: pillar.pillar_color };
  };

  // Prepare radar chart data for all pillars
  const prepareRadarData = () => {
    if (!phiData?.pillars) return null;

    const labels: string[] = [];
    const values: number[] = [];

    // Get one key metric from each pillar
    const keyMetrics: Record<string, string> = {
      'A': 'aod',
      'B': 'ndvi',
      'C': 'tree_cover',
      'D': 'soil_moisture',
      'E': 'human_modification'
    };

    Object.entries(phiData.pillars).forEach(([key, pillar]) => {
      const pillarId = getPillarId(key);
      const metricName = keyMetrics[pillarId];
      const metric = pillar.metrics[metricName];

      if (metric?.value !== null && metric?.value !== undefined) {
        labels.push(PILLAR_CONFIGS[pillarId]?.name || pillarId);
        values.push(normalizeValue(metric.value, metricName));
      }
    });

    return { labels, values };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Header />
        <section className="pt-32 pb-16 bg-gradient-to-b from-[#0d2821] to-[#065f46] min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Analyzing Remote Sensing Data</h2>
            <p className="text-green-100">
              Analyzing location: {latitude?.toFixed(4)}°, {longitude?.toFixed(4)}°
            </p>
            <p className="text-green-200 text-sm mt-4">
              This may take 25-35 seconds...
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Header />
        <section className="pt-32 pb-16 bg-gradient-to-b from-[#0d2821] to-[#065f46] min-h-screen flex items-center justify-center">
          <div className="text-center text-white max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-400" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Report</h2>
            <p className="text-green-100 mb-6">{error}</p>
            <Link to="/">
              <button className="px-6 py-3 bg-white text-[#0d2821] rounded-full font-semibold hover:bg-green-50 transition-all">
                Go Back Home
              </button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const radarData = prepareRadarData();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <div ref={reportRef}>

      {/* Hero Section - Location Info Only */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#0d2821] to-[#065f46]">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Planetary Health Report
            </h1>
            <p className="text-lg sm:text-xl text-green-100 mb-4">
              Remote Sensing Data Analysis
            </p>

            {/* Location Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20"
            >
              <MapPin className="w-5 h-5 text-green-300" />
              <span className="text-lg font-medium">
                {latitude?.toFixed(4)}°, {longitude?.toFixed(4)}°
              </span>
            </motion.div>

            {/* Data info */}
            {phiData?.summary && (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <Database className="w-4 h-4 text-green-300" />
                  <span className="text-sm">
                    Data Completeness: {(phiData.summary.data_completeness * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <span className="text-sm">
                    {Object.keys(phiData.pillars).length} Pillars Analyzed
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* PHI Score Summary Section */}
      {phiData?.summary && (
        <section className="py-8 bg-gradient-to-b from-[#065f46] to-[#065f46]">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <PHIScoreSummary summary={phiData.summary} />
            </motion.div>
          </div>
        </section>
      )}

      {/* ESV Breakdown Section */}
      {phiData?.summary && (
        <section className="py-8 bg-gradient-to-b from-[#065f46] to-[#065f46]">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ESVBreakdown
                phiScore={phiData.summary.overall_score || 0}
                ecosystemType={phiData.summary.ecosystem_type}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Environmental Overview - Radar Chart */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#065f46] to-white">
        <div className="container px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-white mb-4"
          >
            Environmental Overview
          </motion.h2>
          <p className="text-center text-green-100 mb-12 max-w-2xl mx-auto">
            Normalized key metrics from each environmental pillar (0-100 scale)
          </p>

          {radarData && radarData.labels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl"
            >
              <RadarChart
                labels={radarData.labels}
                datasets={[
                  {
                    label: 'Environmental Health',
                    data: radarData.values,
                    backgroundColor: 'rgba(22, 163, 74, 0.2)',
                    borderColor: 'rgb(22, 163, 74)',
                  }
                ]}
                height={400}
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* Earth Observation Imagery Section */}
      <section className="py-16 sm:py-20">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#0d2821] mb-4">
              Earth Observation Imagery
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Visual analysis from multispectral, thermal, and LiDAR data sources
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <ImageryViewer
              latitude={latitude}
              longitude={longitude}
            />
          </motion.div>
        </div>
      </section>

      {/* Pillar Details - Raw Metrics */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-[#0d2821] mb-4"
          >
            Remote Sensing Data
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-gray-600 mb-6 max-w-3xl mx-auto"
          >
            Environmental measurements captured by remote sensing instruments.
            Each metric provides insight into specific aspects of planetary health.
          </motion.p>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
          >
            <h4 className="font-semibold text-green-800 mb-3">Understanding the Data</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <p className="mb-2"><span className="font-medium">Raw Values:</span> Actual measurements from remote sensing instruments in their native units</p>
                <p><span className="font-medium">Normalized Charts:</span> Values scaled to 0-100 for easy comparison across different metrics</p>
              </div>
              <div>
                <p className="mb-2"><span className="font-medium">Quality Indicators:</span> Data reliability based on cloud cover, sensor accuracy, and temporal coverage</p>
                <p><span className="font-medium">Environmental Impact:</span> How each measurement affects ecosystem health and human wellbeing</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-12">
            {phiData?.pillars && Object.entries(phiData.pillars).map(([key, pillar], index) => {
              const pillarId = getPillarId(key);
              const config = PILLAR_CONFIGS[pillarId];
              const Icon = PILLAR_ICONS[pillarId] || GlobeIcon;
              const chartData = prepareBarChartData(key);
              const pillarInfo = PILLAR_INFO[pillarId];
              const pillarScore = phiData?.summary?.pillar_scores?.[pillarId];

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-zinc-50 rounded-3xl p-6 md:p-8 shadow-lg"
                >
                  {/* Pillar Header */}
                  <div className="flex flex-col md:flex-row md:items-start gap-4 mb-8">
                    <div
                      className="p-4 rounded-2xl shrink-0"
                      style={{ backgroundColor: `${pillar.pillar_color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: pillar.pillar_color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-[#0d2821]">
                          {pillar.pillar_name}
                        </h3>
                        {pillarScore !== undefined && pillarScore !== null && (
                          <div
                            className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{
                              backgroundColor: `${pillar.pillar_color}20`,
                              color: pillar.pillar_color,
                            }}
                          >
                            {Math.round(pillarScore)}/100
                          </div>
                        )}
                      </div>
                      {pillarInfo && (
                        <>
                          <p className="text-sm text-gray-600 mb-2">
                            {pillarInfo.summary}
                          </p>
                          <p className="text-xs text-gray-500 italic">
                            <span className="font-medium">Why it matters: </span>
                            {pillarInfo.importance}
                          </p>
                        </>
                      )}
                      {/* Timestamp display */}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {pillar.data_date ? `Captured: ${pillar.data_date}` : ''}
                          {pillar.data_date && dataTimestamp ? ' | ' : ''}
                          {dataTimestamp ? `Real-time: ${dataTimestamp}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Raw Values Grid */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">All Metrics ({Object.keys(pillar.metrics).length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(pillar.metrics).map(([metricName, metric]) => {
                          const metricInfo = getMetricInfo(metricName);
                          return (
                            <div
                              key={metricName}
                              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="text-sm font-semibold text-gray-800 capitalize">
                                  {metricName.replace(/_/g, ' ')}
                                </h5>
                                <QualityBadge quality={metric.quality} />
                              </div>
                              <div
                                className="text-2xl font-bold mb-2"
                                style={{ color: pillar.pillar_color }}
                              >
                                {formatMetricValue(metric.value, metric.unit)}
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {metricInfo.description}
                              </p>
                              <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-500 italic">
                                  <span className="font-medium text-gray-700">Impact: </span>
                                  {metricInfo.impact}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Radar Chart Visualization - All metrics for this pillar */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Pillar Radar Chart
                      </h4>
                      {(() => {
                        const radarData = preparePillarRadarData(pillar.metrics);
                        return radarData.labels.length > 0 ? (
                          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <RadarChart
                              labels={radarData.labels}
                              datasets={[
                                {
                                  label: pillar.pillar_name,
                                  data: radarData.values,
                                  backgroundColor: `${pillar.pillar_color}30`,
                                  borderColor: pillar.pillar_color,
                                }
                              ]}
                              height={280}
                            />
                            <p className="text-xs text-gray-400 text-center mt-2">
                              Values normalized 0-100 (higher = better environmental health)
                            </p>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-400">
                            No data available for radar visualization
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Metrics Comparison */}
      <section className="py-16 sm:py-20">
        <div className="container px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-[#0d2821] mb-4"
          >
            Cross-Pillar Comparison
          </motion.h2>
          <p className="text-center text-gray-600 mb-12">
            All metrics normalized to 0-100 scale for comparison
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            {phiData?.pillars && (() => {
              // Collect all metrics across pillars
              const allLabels: string[] = [];
              const allValues: number[] = [];
              const allColors: string[] = [];

              Object.entries(phiData.pillars).forEach(([_, pillar]) => {
                Object.entries(pillar.metrics).forEach(([name, data]) => {
                  if (data.value !== null && data.value !== undefined) {
                    allLabels.push(name.replace(/_/g, ' '));
                    allValues.push(normalizeValue(data.value, name));
                    allColors.push(pillar.pillar_color || '#666');
                  }
                });
              });

              return allLabels.length > 0 ? (
                <BarChart
                  labels={allLabels}
                  datasets={[
                    {
                      label: 'All Metrics',
                      data: allValues,
                      backgroundColor: allColors,
                    }
                  ]}
                  height={400}
                />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  No data available for comparison
                </div>
              );
            })()}
          </motion.div>
        </div>
      </section>

      {/* Quality Flags Section */}
      {phiData?.summary?.quality_flags && phiData.summary.quality_flags.length > 0 && (
        <section className="py-12 bg-amber-50">
          <div className="container px-4 mx-auto">
            <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Data Quality Notes
            </h3>
            <div className="flex flex-wrap gap-2">
              {phiData.summary.quality_flags.map((flag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                >
                  {flag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Download PDF Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-zinc-50 to-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0d2821] mb-4">
              Download Your Report
            </h2>
            <p className="text-gray-600 mb-8">
              Get a complete PDF copy of this Planetary Health Report with all remote sensing data,
              metric explanations, and environmental impact assessments.
            </p>
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#0d2821] text-white rounded-full font-bold text-lg hover:bg-[#1a4a3d] transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download PDF Report
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              PDF includes all {phiData?.pillars ? Object.keys(phiData.pillars).length : 0} pillars and their metrics
            </p>
          </motion.div>
        </div>
      </section>
      </div>

      {/* Contact CTA */}
      <section className="py-20 bg-[#0d2821] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-dot-white/20" />
        </div>

        <div className="container px-4 mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Need Detailed Analysis?
              </h2>
              <p className="text-lg sm:text-xl text-green-100 mb-8 leading-relaxed">
                Get comprehensive insights, personalized recommendations, and in-depth environmental reports tailored to your location.
              </p>
              <Link to="/about">
                <button className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0d2821] rounded-full font-bold text-lg hover:bg-green-50 transition-all duration-300 hover:scale-105 shadow-lg">
                  Contact Us for Detailed Data
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>

            {/* Right: Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] lg:h-[500px] flex items-center justify-center"
            >
              <Globe className="w-full h-full" scrollYProgress={scrollYProgress} />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GetTheReport;
