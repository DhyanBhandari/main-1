/**
 * BaselineAssessment - Run baseline PPA assessments from admin dashboard
 *
 * Steps:
 * 1. Details - Label + optional org info
 * 2. Set Polygon - Reuse PolygonLandSelector
 * 3. Results - Display PPA scores, ESV, carbon credits
 * 4. Download - PDF report + history
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  MapPin,
  BarChart3,
  Download,
  Loader2,
  CheckCircle,
  ChevronRight,
  RotateCcw,
  Eye,
  Clock,
  AlertCircle,
  TreePine,
  Globe as GlobeIcon,
} from 'lucide-react';
import jsPDF from 'jspdf';

import PolygonLandSelector from '@/components/PolygonLandSelector';
import type { PolygonPoint } from '@/components/PolygonLandSelector';
import PHIScoreSummary from '@/components/PHIScoreSummary';
import ESVBreakdown from '@/components/ESVBreakdown';
import { RadarChart, BarChart } from '@/components/charts';

import { fetchPolygonPHIReport } from '@/services/phiApi';
import type { PolygonPHIResponse } from '@/services/phiApi';
import { supplementMetrics, preparePillarRadarData } from '@/services/metricSupplementation';
import { getComprehensiveExternalData } from '@/services/phiApi';
import { PILLAR_CONFIGS, getPillarId, formatMetricValue, getQualityColor } from '@/types/phi';
import type { PHIResponse } from '@/types/phi';
import { getAllImpacts, getOverallStatus } from '@/utils/impactAssessment';
import { calculateESVBreakdown } from '@/utils/esvCalculation';
import { calculateAllProjections } from '@/utils/esvProjection';
import logoImg from '@/assets/logo-new.png';
import verraVcsImg from '@/assets/verra-vcs.png';
import goldStandardImg from '@/assets/gold-standard.webp';
import unfcccImg from '@/assets/unfccc.webp';
import unseeaImg from '@/assets/unseea.webp';
import cdpImg from '@/assets/cdp.png';
import esgImg from '@/assets/esg.jpg';
import tcfdImg from '@/assets/tcfd.webp';
import tnfdImg from '@/assets/tnfd.jpg';
import issbImg from '@/assets/issb.png';
import griImg from '@/assets/gri.svg';

import {
  saveBaselineAssessment,
  getBaselineHistory,
} from '@/services/adminApi';
import type { BaselineAssessmentRecord } from '@/services/adminApi';

type PDFSection = 'score' | 'assessment' | 'report';

// Helper to load image as base64 for jsPDF
const loadImageAsBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not available');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Pillar descriptions for the report
const PILLAR_DESCRIPTIONS: Record<string, { what: string; why: string }> = {
  A: {
    what: 'Atmospheric Health measures air quality, aerosol optical depth (AOD), UV index, and gaseous pollutants such as NO2, SO2, CO, and O3. It reflects how clean and safe the air is for human health and ecosystems.',
    why: 'Poor air quality directly impacts respiratory health, agricultural productivity, and contributes to climate change. Monitoring atmospheric health is crucial for UN-SEEA compliance and ESG reporting.',
  },
  B: {
    what: 'Biodiversity & Habitat evaluates vegetation density (NDVI), species habitat suitability, forest cover, and ecosystem fragmentation. It indicates how well the natural habitat supports diverse life forms.',
    why: 'Biodiversity is the foundation of ecosystem resilience. TNFD and ISSB frameworks require organizations to measure and disclose their impact on biodiversity and natural habitats.',
  },
  C: {
    what: 'Climate Stability assesses temperature trends, precipitation patterns, climate anomalies, and long-term environmental stability through indicators like evapotranspiration and climate moisture index.',
    why: 'Climate stability directly affects agriculture, water resources, and infrastructure. Understanding climate patterns is essential for TCFD-aligned risk assessment and adaptation planning.',
  },
  D: {
    what: 'Land, Water & Soil analyzes land surface temperature, soil moisture, water occurrence, drought indices, and surface water dynamics to evaluate the health of land and water resources.',
    why: 'Land and water degradation threatens food security and livelihoods. UN-SEEA ecosystem accounting requires measurement of soil, water, and land condition as natural capital assets.',
  },
  E: {
    what: 'Ecosystem Services quantifies the economic and ecological value that natural ecosystems provide, including carbon sequestration, water purification, pollination, and flood regulation.',
    why: 'Ecosystem services are valued at trillions of dollars globally. ISSB and ESG disclosures increasingly require organizations to quantify their dependency on and impact to ecosystem services.',
  },
};

interface BaselineAssessmentProps {
  adminEmail: string;
}

type Step = 'details' | 'polygon' | 'results' | 'download';

const steps: { id: Step; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'polygon', label: 'Set Polygon' },
  { id: 'results', label: 'Results' },
  { id: 'download', label: 'Download' },
];

interface FormData {
  label: string;
  organizationName: string;
  organizationType: string;
  email: string;
  phone: string;
}

const organizationTypes = [
  'Corporates',
  'Banks',
  'Financial Institutions',
  'FinTech',
  'NGO',
  'Non-Profit Organization',
  'Government Organization',
  'Educational Institution',
  'Research Institute',
  'Consulting Firm',
  'Investment Fund',
  'Insurance Company',
  'Real Estate',
  'Agriculture & Forestry',
  'Energy & Utilities',
  'Other',
];

const BaselineAssessment = ({ adminEmail }: BaselineAssessmentProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [formData, setFormData] = useState<FormData>({
    label: '',
    organizationName: '',
    organizationType: '',
    email: '',
    phone: '',
  });

  // Assessment data
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [phiData, setPhiData] = useState<PHIResponse | null>(null);
  const [polygonData, setPolygonData] = useState<PolygonPHIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<BaselineAssessmentRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Radar data for overview chart
  const [radarData, setRadarData] = useState<{ labels: string[]; values: number[] } | null>(null);

  // PDF section toggles
  const [pdfSections, setPdfSections] = useState<Record<PDFSection, boolean>>({
    score: true,
    assessment: true,
    report: true,
  });

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getBaselineHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load baseline history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinueToPolygon = () => {
    if (!formData.label.trim()) {
      setError('Please enter a label for this assessment');
      return;
    }
    setError(null);
    setCurrentStep('polygon');
  };

  const handlePolygonComplete = async (points: PolygonPoint[]) => {
    setPolygonPoints(points);
    setCurrentStep('results');
    setLoading(true);
    setError(null);

    try {
      // Run the PPA query
      const data = await fetchPolygonPHIReport({
        points,
        mode: 'comprehensive',
      });

      setPhiData(data);
      setPolygonData(data);

      // Try to supplement metrics with external data
      if (data.summary && points.length > 0) {
        const centroidLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
        const centroidLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;

        try {
          const externalData = await getComprehensiveExternalData(centroidLat, centroidLng);
          if (externalData) {
            const supplemented = supplementMetrics(data, externalData);
            setPhiData(supplemented);
          }
        } catch {
          // External data is optional, continue without it
        }

        // Prepare radar data
        if (data.pillars) {
          const allLabels: string[] = [];
          const allValues: number[] = [];

          Object.entries(data.pillars).forEach(([key, pillar]) => {
            const radarResult = preparePillarRadarData(pillar.metrics);
            if (radarResult) {
              allLabels.push(...radarResult.labels);
              allValues.push(...radarResult.values);
            }
          });

          if (allLabels.length > 0) {
            setRadarData({ labels: allLabels, values: allValues });
          }
        }
      }

      // Auto-save to history
      try {
        setSaving(true);
        const savedId = await saveBaselineAssessment({
          admin_email: adminEmail,
          label: formData.label,
          organization_name: formData.organizationName || undefined,
          organization_type: formData.organizationType || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          polygon_points: points,
          phi_response: data,
          overall_score: data.summary?.overall_score,
          pillar_scores: data.summary?.pillar_scores,
        });
        setReportId(savedId);
        setSaved(true);
        loadHistory(); // Refresh history
      } catch (saveErr) {
        console.error('Failed to save assessment:', saveErr);
      } finally {
        setSaving(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistoryItem = (item: BaselineAssessmentRecord) => {
    // Load stored data into results view
    if (item.phi_response) {
      setPhiData(item.phi_response);
      setPolygonData(item.phi_response);
      setPolygonPoints(item.polygon_points || []);
      setFormData({
        label: item.label || '',
        organizationName: item.organization_name || '',
        organizationType: item.organization_type || '',
        email: item.contact_email || '',
        phone: item.contact_phone || '',
      });

      // Prepare radar data from stored response
      if (item.phi_response.pillars) {
        const allLabels: string[] = [];
        const allValues: number[] = [];
        Object.entries(item.phi_response.pillars).forEach(([key, pillar]: [string, any]) => {
          const radarResult = preparePillarRadarData(pillar.metrics);
          if (radarResult) {
            allLabels.push(...radarResult.labels);
            allValues.push(...radarResult.values);
          }
        });
        if (allLabels.length > 0) {
          setRadarData({ labels: allLabels, values: allValues });
        }
      }

      setSaved(true);
      setCurrentStep('results');
    }
  };

  const handleReset = () => {
    setCurrentStep('details');
    setFormData({ label: '', organizationName: '', organizationType: '', email: '', phone: '' });
    setPolygonPoints([]);
    setPhiData(null);
    setPolygonData(null);
    setRadarData(null);
    setError(null);
    setSaved(false);
    setSaving(false);
  };

  const downloadPDF = async (data?: PHIResponse | null, label?: string, sectionsOverride?: Record<PDFSection, boolean>) => {
    const reportData = data || phiData;
    const reportLabel = label || formData.label;
    const pData = polygonData;
    if (!reportData) return;

    const sections = sectionsOverride || pdfSections;
    // Must select at least one section
    if (!sections.score && !sections.assessment && !sections.report) return;

    setIsGeneratingPDF(true);

    try {
      // Load logos
      let logoBase64: string | null = null;
      let verraBase64: string | null = null;
      let goldStdBase64: string | null = null;
      let unfcccBase64: string | null = null;
      let unseeaBase64: string | null = null;
      let cdpBase64: string | null = null;
      let esgBase64: string | null = null;
      let tcfdBase64: string | null = null;
      let tnfdBase64: string | null = null;
      let issbBase64: string | null = null;
      let griBase64: string | null = null;
      try {
        const results = await Promise.all([
          loadImageAsBase64(logoImg).catch(() => null),
          loadImageAsBase64(verraVcsImg).catch(() => null),
          loadImageAsBase64(goldStandardImg).catch(() => null),
          loadImageAsBase64(unfcccImg).catch(() => null),
          loadImageAsBase64(unseeaImg).catch(() => null),
          loadImageAsBase64(cdpImg).catch(() => null),
          loadImageAsBase64(esgImg).catch(() => null),
          loadImageAsBase64(tcfdImg).catch(() => null),
          loadImageAsBase64(tnfdImg).catch(() => null),
          loadImageAsBase64(issbImg).catch(() => null),
          loadImageAsBase64(griImg).catch(() => null),
        ]);
        [logoBase64, verraBase64, goldStdBase64, unfcccBase64, unseeaBase64,
         cdpBase64, esgBase64, tcfdBase64, tnfdBase64, issbBase64, griBase64] = results;
      } catch { /* continue without logos */ }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const W = pdf.internal.pageSize.getWidth(); // 210
      const H = pdf.internal.pageSize.getHeight(); // 297
      const M = 18; // margin
      const CW = W - M * 2; // content width
      let y = M;

      // Colors
      const BRAND = [13, 40, 33] as const;
      const BRAND_LIGHT = [16, 185, 129] as const;
      const GRAY = [107, 114, 128] as const;
      const DARK = [31, 41, 55] as const;
      const WHITE = [255, 255, 255] as const;

      // Helper: hex to RGB
      const hexToRgb = (hex: string): [number, number, number] => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };

      // Helper: draw watermark on inner pages (called BEFORE page content)
      const drawWatermark = () => {
        if (logoBase64) {
          pdf.setGState(new (pdf as any).GState({ opacity: 0.04 }));
          pdf.addImage(logoBase64, 'PNG', W / 2 - 45, H / 2 - 12, 90, 25);
          pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
        }
      };

      // Helper: check page break (draws watermark on new pages)
      const checkPage = (need: number) => {
        if (y + need > H - 25) {
          pdf.addPage();
          y = M;
          drawWatermark();
          return true;
        }
        return false;
      };

      // Helper: draw horizontal bar
      const drawBar = (x: number, yPos: number, width: number, height: number, value: number, maxVal: number, color: [number, number, number]) => {
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(x, yPos, width, height, 1.5, 1.5, 'F');
        const fillW = Math.max(0, Math.min(width, (value / maxVal) * width));
        if (fillW > 0) {
          pdf.setFillColor(...color);
          pdf.roundedRect(x, yPos, fillW, height, 1.5, 1.5, 'F');
        }
      };

      // Helper: draw score circle
      const drawScoreCircle = (cx: number, cy: number, radius: number, score: number, color: [number, number, number]) => {
        pdf.setFillColor(245, 245, 245);
        pdf.circle(cx, cy, radius, 'F');
        pdf.setFillColor(...color);
        pdf.circle(cx, cy, radius - 2, 'F');
        pdf.setFillColor(255, 255, 255);
        pdf.circle(cx, cy, radius - 5, 'F');
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...color);
        pdf.text(Math.round(score).toString(), cx, cy + 2, { align: 'center' });
        pdf.setFontSize(7);
        pdf.setTextColor(...GRAY);
        pdf.text('/ 100', cx, cy + 7, { align: 'center' });
      };

      // Helper: section title
      const sectionTitle = (title: string, subtitle?: string) => {
        checkPage(25);
        pdf.setFillColor(...BRAND);
        pdf.roundedRect(M, y, CW, subtitle ? 18 : 12, 2, 2, 'F');
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...WHITE);
        pdf.text(title, M + 6, y + 8);
        if (subtitle) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(200, 220, 210);
          pdf.text(subtitle, M + 6, y + 15);
        }
        y += subtitle ? 24 : 18;
      };

      // Helper: draw a bordered info box with title
      const drawInfoBox = (title: string, lines: string[], bgColor: [number, number, number], borderColor: [number, number, number], titleColor: [number, number, number]) => {
        const lineTexts: string[] = [];
        lines.forEach(line => {
          const wrapped = pdf.splitTextToSize(line, CW - 16);
          lineTexts.push(...wrapped);
        });
        const boxH = 10 + lineTexts.length * 3.5;
        checkPage(boxH + 4);
        pdf.setFillColor(...bgColor);
        pdf.roundedRect(M, y, CW, boxH, 2, 2, 'F');
        pdf.setDrawColor(...borderColor);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(M, y, CW, boxH, 2, 2, 'S');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...titleColor);
        pdf.text(title, M + 6, y + 6);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        lineTexts.forEach((line, idx) => {
          pdf.text(line, M + 6, y + 12 + idx * 3.5);
        });
        y += boxH + 4;
      };

      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // ========================================
      // COVER PAGE — white bg, dark green text
      // ========================================
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, W, H, 'F');

      // Decorative elements (subtle green circles)
      pdf.setFillColor(16, 185, 129);
      pdf.setGState(new (pdf as any).GState({ opacity: 0.08 }));
      pdf.circle(W * 0.85, H * 0.12, 50, 'F');
      pdf.circle(W * 0.15, H * 0.88, 35, 'F');
      pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

      // Standards compliance bar at top
      pdf.setFillColor(16, 185, 129);
      pdf.rect(0, 0, W, 8, 'F');
      pdf.setFontSize(6.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(13, 40, 33);
      pdf.text('Aligned with UN-SEEA  |  IPCC  |  GHG Protocol  |  UNFCCC  |  Verra VCS  |  Gold Standard', W / 2, 5.5, { align: 'center' });

      // Logo
      if (logoBase64) {
        pdf.addImage(logoBase64, 'PNG', W / 2 - 35, 28, 70, 20);
      }

      // Title — dark green text
      y = 72;
      pdf.setFontSize(30);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BRAND);
      pdf.text('Planetary Performance', W / 2, y, { align: 'center' });
      y += 13;
      pdf.text('Assessment Report', W / 2, y, { align: 'center' });

      // Thin green line
      y += 8;
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(0.8);
      pdf.line(W / 2 - 40, y, W / 2 + 40, y);

      // Label
      y += 10;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(16, 185, 129);
      const labelLines = pdf.splitTextToSize(reportLabel || 'Environmental Assessment', CW - 20);
      labelLines.forEach((line: string) => {
        pdf.text(line, W / 2, y, { align: 'center' });
        y += 8;
      });

      // Score, Carbon Credits & ESV circles on cover
      if (reportData.summary?.overall_score != null) {
        y += 8;
        const score = reportData.summary.overall_score;
        const status = getOverallStatus(score);
        const scoreColor = hexToRgb(status.color);

        // Determine which circles to show
        const hasCarbon = pData?.carbon_credits?.available;
        const hasESV = pData?.ecosystem_service_value?.available;

        // Circle positions — evenly spaced across page width
        const circleR = 22;
        const circleCy = y + circleR + 2;
        const circles: { cx: number; label: string; value: string; sub: string; color: [number, number, number]; ringColor: [number, number, number] }[] = [];

        // PPA Score circle (always shown)
        circles.push({
          cx: 0, // placeholder, will be computed
          label: 'PPA SCORE',
          value: score.toFixed(1),
          sub: `${status.grade} — ${status.status}`,
          color: scoreColor,
          ringColor: scoreColor,
        });

        // Carbon Credits circle
        if (hasCarbon) {
          const cc = pData!.carbon_credits!;
          circles.push({
            cx: 0,
            label: 'CARBON CREDITS',
            value: `${cc.verified_co2_tonnes?.toFixed(0)}`,
            sub: `tCO2 verified`,
            color: [5, 150, 105],
            ringColor: [5, 150, 105],
          });
        }

        // ESV circle
        if (hasESV) {
          const esv = pData!.ecosystem_service_value!;
          const esvVal = esv.total_annual_esv_usd || 0;
          const esvDisplay = esvVal >= 1000000
            ? `$${(esvVal / 1000000).toFixed(1)}M`
            : esvVal >= 1000
            ? `$${(esvVal / 1000).toFixed(1)}K`
            : `$${esvVal.toFixed(0)}`;
          circles.push({
            cx: 0,
            label: 'ESV / YEAR',
            value: esvDisplay,
            sub: `$${esv.adjusted_esv_per_ha_usd?.toLocaleString()}/ha`,
            color: [37, 99, 235],
            ringColor: [37, 99, 235],
          });
        }

        // Compute horizontal positions — evenly distributed
        const totalCircles = circles.length;
        const spacing = CW / (totalCircles + 1);
        circles.forEach((c, idx) => {
          c.cx = M + spacing * (idx + 1);
        });

        // Draw each circle
        circles.forEach((c) => {
          // Outer ring
          pdf.setFillColor(230, 230, 230);
          pdf.circle(c.cx, circleCy, circleR + 2, 'F');
          // Colored ring
          pdf.setFillColor(...c.ringColor);
          pdf.circle(c.cx, circleCy, circleR, 'F');
          // White inner
          pdf.setFillColor(255, 255, 255);
          pdf.circle(c.cx, circleCy, circleR - 5, 'F');

          // Value text
          const fontSize = c.value.length > 6 ? 14 : c.value.length > 4 ? 16 : 20;
          pdf.setFontSize(fontSize);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...c.color);
          pdf.text(c.value, c.cx, circleCy + 2, { align: 'center' });

          // Label below circle
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text(c.label, c.cx, circleCy + circleR + 7, { align: 'center' });

          // Sub-label
          pdf.setFontSize(6.5);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...GRAY);
          pdf.text(c.sub, c.cx, circleCy + circleR + 12, { align: 'center' });
        });

        y = circleCy + circleR + 18;
      }

      // UN-SEEA badge — green bg box on white page
      y = H - 100;
      pdf.setFillColor(13, 40, 33);
      pdf.roundedRect(M + 8, y, CW - 16, 32, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(16, 185, 129);
      pdf.text('UN-SEEA Aligned Assessment', W / 2, y + 9, { align: 'center' });
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(180, 200, 190);
      pdf.text('Usable for ESG, TNFD, ISSB, TCFD, CDP & GRI disclosures', W / 2, y + 17, { align: 'center' });
      pdf.text('Methodology aligned with UN System of Environmental-Economic Accounting', W / 2, y + 23, { align: 'center' });
      pdf.text('Carbon quantification via IPCC Tier 1 with conservative verification', W / 2, y + 29, { align: 'center' });

      // Report metadata — dark text on white bg
      y = H - 55;
      pdf.setFontSize(8);
      pdf.setTextColor(...GRAY);
      pdf.text(`Date: ${dateStr}`, M + 10, y);
      pdf.text(`Prepared by: ErthaLoka team`, M + 10, y + 6);
      pdf.text(`Report ID: ${reportId || 'N/A'}`, M + 10, y + 24);
      if (formData.organizationName) {
        pdf.text(`Organization: ${formData.organizationName}`, M + 10, y + 12);
      }
      if (formData.organizationType) {
        pdf.text(`Type: ${formData.organizationType}`, M + 10, y + 18);
      }
      pdf.text(`Data Completeness: ${reportData.summary ? (reportData.summary.data_completeness * 100).toFixed(0) : 'N/A'}%`, W - M - 10, y, { align: 'right' });
      if (polygonPoints.length > 0) {
        const centLat = (polygonPoints.reduce((s, p) => s + p.lat, 0) / polygonPoints.length).toFixed(4);
        const centLng = (polygonPoints.reduce((s, p) => s + p.lng, 0) / polygonPoints.length).toFixed(4);
        pdf.text(`Location: ${centLat}, ${centLng}`, W - M - 10, y + 6, { align: 'right' });
      }
      if (reportData.summary?.ecosystem_type) {
        pdf.text(`Ecosystem: ${reportData.summary.ecosystem_type.replace(/_/g, ' ')}`, W - M - 10, y + 12, { align: 'right' });
      }

      // Confidential footer
      y = H - 12;
      pdf.setFontSize(7);
      pdf.setTextColor(...GRAY);
      pdf.text('CONFIDENTIAL — This report contains proprietary environmental assessment data', W / 2, y, { align: 'center' });

      // ========================================
      // PAGE 2: ABOUT THIS REPORT & STANDARDS + SCORING (merged)
      // ========================================
      pdf.addPage();
      y = M;
      drawWatermark();

      sectionTitle('Report Standards & Compliance', 'About This Report, Scoring Methodology & Global Standards Alignment');
      y += 2;

      // What This Report Contains
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BRAND);
      pdf.text('What This Report Contains', M, y);
      y += 6;

      const reportContents = [
        { label: 'Score', desc: 'Overall PPA score (0-100), AAA-CCC grade, pillar-level scores, and impact assessment across health, economic, and biodiversity dimensions.' },
        { label: 'Assessment', desc: 'Detailed remote sensing metrics across 5 environmental pillars with quality indicators, data sources, and per-pillar interpretation.' },
        { label: 'Report', desc: 'Carbon credits analysis (Verra VCS / Gold Standard aligned), Ecosystem Service Value (TEEB framework), and environmental narrative per pillar.' },
      ];

      reportContents.forEach((item) => {
        checkPage(12);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...BRAND);
        pdf.text(`${item.label}:`, M + 4, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        const lines = pdf.splitTextToSize(item.desc, CW - 30);
        pdf.text(lines, M + 28, y);
        y += Math.max(lines.length * 3.2, 5) + 2;
      });

      y += 2;

      // How We Score box
      drawInfoBox(
        'How We Score',
        [
          'Scoring powered by ErthaLoka proprietary AI algorithms and satellite remote sensing from NASA, ESA, and NOAA.',
          'Carbon stock calculated using IPCC Tier 1 methodology with conservative verification factor (0.7x) applied to raw estimates.',
          'Ecosystem valuation based on TEEB / Costanza et al. (2014) framework, adjusted by real-time ecosystem condition.',
          'Grade scale: AAA (86-100) Excellent, AA (72-85) Very Good, A (58-71) Good, BBB (44-57) Above Average, BB (30-43) Average, B (16-29) Below Average, CCC (0-15) Poor.',
        ],
        [236, 253, 245],
        [5, 150, 105],
        [5, 120, 85],
      );

      y += 2;

      // Standards Grid — 3 columns
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BRAND);
      pdf.text('Global Standards Alignment', M, y);
      y += 6;

      const standardsCols = [
        {
          title: 'Carbon Standards',
          color: [5, 150, 105] as [number, number, number],
          items: [
            { name: 'UNFCCC CDM', desc: 'Clean Development Mechanism' },
            { name: 'Verra VCS', desc: 'Verified Carbon Standard' },
            { name: 'Gold Standard', desc: 'Carbon credit certification' },
            { name: 'ICVCM', desc: 'Integrity Council for VCM' },
          ],
        },
        {
          title: 'Disclosure Frameworks',
          color: [37, 99, 235] as [number, number, number],
          items: [
            { name: 'UN-SEEA', desc: 'Ecosystem Accounting' },
            { name: 'ISSB', desc: 'Sustainability Standards' },
            { name: 'TNFD', desc: 'Nature-related Disclosures' },
            { name: 'TCFD', desc: 'Climate-related Disclosures' },
            { name: 'CDP', desc: 'Carbon Disclosure Project' },
            { name: 'GRI', desc: 'Global Reporting Initiative' },
          ],
        },
        {
          title: 'Methodology',
          color: [139, 92, 246] as [number, number, number],
          items: [
            { name: 'IPCC', desc: 'Climate science guidelines' },
            { name: 'GHG Protocol', desc: 'Greenhouse gas accounting' },
            { name: 'ISO 14064', desc: 'GHG quantification' },
            { name: 'Natural Capital', desc: 'Natural Capital Protocol' },
            { name: 'TEEB', desc: 'Economics of ecosystems' },
            { name: 'SBTi', desc: 'Science Based Targets' },
          ],
        },
      ];

      const colW = (CW - 6) / 3;
      checkPage(90);
      standardsCols.forEach((col, colIdx) => {
        const colX = M + colIdx * (colW + 3);

        // Column header
        pdf.setFillColor(...col.color);
        pdf.roundedRect(colX, y, colW, 8, 1.5, 1.5, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...WHITE);
        pdf.text(col.title, colX + colW / 2, y + 5.5, { align: 'center' });

        // Items
        col.items.forEach((item, itemIdx) => {
          const itemY = y + 11 + itemIdx * 10;
          // Alternating bg
          if (itemIdx % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(colX, itemY - 1, colW, 9, 'F');
          }
          pdf.setFontSize(7.5);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...col.color);
          pdf.text(item.name, colX + 3, itemY + 3);
          pdf.setFontSize(6.5);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...GRAY);
          pdf.text(item.desc, colX + 3, itemY + 7);
        });
      });

      // Move y past the tallest column
      const maxItems = Math.max(...standardsCols.map(c => c.items.length));
      y += 11 + maxItems * 10 + 6;

      // ========================================
      // SCORE SECTION (continues on same page if space, else new page)
      // ========================================
      if (sections.score && reportData.summary) {
        checkPage(70);

        sectionTitle('PPA Score Summary', 'Planetary Performance Assessment — Overall and Pillar Scores');
        y += 2;

        const score = reportData.summary.overall_score || 0;
        const status = getOverallStatus(score);
        const scoreColor = hexToRgb(status.color);

        // Overall score box
        checkPage(60);
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(M, y, CW, 50, 3, 3, 'F');
        pdf.setDrawColor(229, 231, 235);
        pdf.roundedRect(M, y, CW, 50, 3, 3, 'S');

        // Score circle
        drawScoreCircle(M + 30, y + 25, 18, score, scoreColor);

        // Text info
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...BRAND);
        pdf.text(`${status.grade} — ${status.status}`, M + 55, y + 15);

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text(status.description, M + 55, y + 23);

        // Interpretation
        pdf.setFontSize(8);
        pdf.setTextColor(...DARK);
        const interpText = reportData.summary.overall_interpretation || '';
        if (interpText) {
          const lines = pdf.splitTextToSize(interpText, CW - 60);
          pdf.text(lines, M + 55, y + 31);
        }

        y += 58;

        // Measurement note
        checkPage(12);
        pdf.setFillColor(240, 249, 255);
        pdf.roundedRect(M, y, CW, 10, 2, 2, 'F');
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(30, 64, 175);
        pdf.text('Measured through ErthaLoka proprietary research, AI algorithms, and satellite remote sensing from NASA, ESA & NOAA', M + 4, y + 6);
        y += 14;

        // Pillar score bars
        if (reportData.summary.pillar_scores) {
          checkPage(80);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text('Pillar Scores', M, y);
          y += 8;

          const pillarEntries = Object.entries(reportData.summary.pillar_scores);
          pillarEntries.forEach(([key, pScore]) => {
            checkPage(16);
            const config = PILLAR_CONFIGS[key];
            const color = config?.color ? hexToRgb(config.color) : BRAND_LIGHT;
            const pStatus = getOverallStatus(pScore as number);

            // Label
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...DARK);
            pdf.text(`${config?.name || key} (${config?.fullName || ''})`, M, y);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...GRAY);
            pdf.text(`${Math.round(pScore as number)}/100 — ${pStatus.grade}`, W - M, y, { align: 'right' });
            y += 5;

            // Bar
            drawBar(M, y, CW, 5, pScore as number, 100, color as [number, number, number]);
            y += 10;
          });

          y += 4;
        }

        // Impact Assessment
        if (reportData.summary.overall_score != null) {
          checkPage(50);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text('Impact Assessment', M, y);
          y += 2;
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...GRAY);
          pdf.text('Health, Economic & Biodiversity impact analysis based on PPA score', M, y + 4);
          y += 10;

          const impacts = getAllImpacts(
            reportData.summary.overall_score,
            reportData.summary.pillar_scores as Record<string, number>,
          );

          impacts.forEach((impact) => {
            checkPage(30);
            const impColor = hexToRgb(impact.color);

            // Impact card
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(M, y, CW, 22, 2, 2, 'F');

            // Color indicator
            pdf.setFillColor(...impColor);
            pdf.roundedRect(M, y, 3, 22, 1, 1, 'F');

            // Title & severity
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...impColor);
            pdf.text(`${impact.title} — ${impact.severity.toUpperCase()}`, M + 7, y + 6);

            // Positive
            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(34, 139, 34);
            const posLines = pdf.splitTextToSize(`+ ${impact.positive}`, CW - 12);
            pdf.text(posLines[0], M + 7, y + 12);

            // Risk
            pdf.setTextColor(200, 50, 50);
            const riskLines = pdf.splitTextToSize(`- ${impact.risk}`, CW - 12);
            pdf.text(riskLines[0], M + 7, y + 18);

            y += 26;
          });
        }
      }

      // ========================================
      // ENVIRONMENTAL OVERVIEW (after Score Summary, before Assessment)
      // ========================================
      if (sections.score && reportData.summary) {
        checkPage(60);

        sectionTitle('Environmental Overview', 'Ecosystem Condition Summary & Key Findings');
        y += 2;

        const eoScore = reportData.summary.overall_score || 0;
        const eoStatus = getOverallStatus(eoScore);
        const eoEcoType = reportData.summary.ecosystem_type || 'Unknown';
        const eoCompleteness = reportData.summary.data_completeness || 0;

        // Overall narrative based on grade
        const narrativeMap: Record<string, string> = {
          'AAA': 'This ecosystem demonstrates excellent environmental health across all measured dimensions. The area functions as a high-value natural asset with strong carbon sequestration, biodiversity support, and ecosystem service provision.',
          'AA': 'This ecosystem shows very good environmental condition with minor areas for improvement. It provides substantial ecological value and supports diverse ecosystem services effectively.',
          'A': 'This ecosystem is in good condition overall, though some pillars show room for enhancement. Active management could further improve ecosystem service delivery and resilience.',
          'BBB': 'This ecosystem shows above-average condition with mixed results across pillars. Targeted interventions in weaker areas could significantly improve overall ecosystem performance.',
          'BB': 'This ecosystem shows average environmental health. Several pillars require attention, and proactive management is recommended to prevent further degradation.',
          'B': 'This ecosystem shows below-average condition with significant challenges across multiple pillars. Urgent intervention is recommended to restore ecosystem function.',
          'CCC': 'This ecosystem is in poor condition and requires immediate restoration efforts. Most ecosystem services are significantly compromised.',
        };
        const narrative = narrativeMap[eoStatus.grade] || narrativeMap['BB'];

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        const narrativeLines = pdf.splitTextToSize(narrative, CW - 8);
        pdf.text(narrativeLines, M + 4, y);
        y += narrativeLines.length * 3.5 + 6;

        // Ecosystem type callout box
        checkPage(22);
        pdf.setFillColor(236, 253, 245);
        pdf.roundedRect(M, y, CW, 18, 2, 2, 'F');
        pdf.setDrawColor(5, 150, 105);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(M, y, CW, 18, 2, 2, 'S');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(5, 120, 85);
        pdf.text('Ecosystem Profile', M + 6, y + 6);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        pdf.text(`Type: ${eoEcoType.replace(/_/g, ' ')}`, M + 6, y + 12);
        pdf.text(`Data Quality: ${(eoCompleteness * 100).toFixed(0)}%`, M + CW * 0.4, y + 12);
        if (polygonPoints.length > 0) {
          const areaText = reportData.summary?.ecosystem_type ? `Ecosystem: ${eoEcoType.replace(/_/g, ' ')}` : '';
          pdf.text(areaText, M + CW * 0.7, y + 12);
        }
        y += 24;

        // Key findings: top + lowest pillar
        if (reportData.summary.pillar_scores) {
          const pillarEntries = Object.entries(reportData.summary.pillar_scores) as [string, number][];
          if (pillarEntries.length > 0) {
            const sorted = [...pillarEntries].sort((a, b) => (b[1] as number) - (a[1] as number));
            const topPillar = sorted[0];
            const lowPillar = sorted[sorted.length - 1];
            const topConfig = PILLAR_CONFIGS[topPillar[0]];
            const lowConfig = PILLAR_CONFIGS[lowPillar[0]];

            checkPage(30);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...BRAND);
            pdf.text('Key Findings', M, y);
            y += 7;

            // Strongest
            pdf.setFillColor(236, 253, 245);
            pdf.roundedRect(M, y, CW, 10, 2, 2, 'F');
            pdf.setFillColor(34, 197, 94);
            pdf.roundedRect(M, y, 3, 10, 1, 1, 'F');
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(34, 139, 34);
            pdf.text(`Strongest: ${topConfig?.fullName || topPillar[0]} — ${Math.round(topPillar[1])}/100`, M + 7, y + 6);
            y += 14;

            // Weakest
            pdf.setFillColor(254, 243, 199);
            pdf.roundedRect(M, y, CW, 10, 2, 2, 'F');
            pdf.setFillColor(245, 158, 11);
            pdf.roundedRect(M, y, 3, 10, 1, 1, 'F');
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(146, 64, 14);
            pdf.text(`Needs attention: ${lowConfig?.fullName || lowPillar[0]} — ${Math.round(lowPillar[1])}/100`, M + 7, y + 6);
            y += 16;
          }
        }

        // ========================================
        // RADAR CHART — 5 Pillars
        // ========================================
        if (reportData.summary.pillar_scores) {
          checkPage(110);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text('Pillar Radar Chart', M, y);
          y += 4;
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...GRAY);
          pdf.text('Visual representation of environmental performance across all 5 pillars', M, y + 3);
          y += 10;

          // Draw radar chart manually
          const radarCx = W / 2;
          const radarCy = y + 42;
          const radarR = 36;
          const pillarKeys = Object.keys(reportData.summary.pillar_scores);
          const pillarVals = Object.values(reportData.summary.pillar_scores) as number[];
          const n = pillarKeys.length;

          if (n >= 3) {
            // Draw concentric pentagons (grid at 33%, 66%, 100%)
            [0.33, 0.66, 1.0].forEach((scale) => {
              pdf.setDrawColor(220, 220, 220);
              pdf.setLineWidth(0.2);
              for (let i = 0; i < n; i++) {
                const a1 = (2 * Math.PI * i) / n - Math.PI / 2;
                const a2 = (2 * Math.PI * ((i + 1) % n)) / n - Math.PI / 2;
                const x1 = radarCx + Math.cos(a1) * radarR * scale;
                const y1 = radarCy + Math.sin(a1) * radarR * scale;
                const x2 = radarCx + Math.cos(a2) * radarR * scale;
                const y2 = radarCy + Math.sin(a2) * radarR * scale;
                pdf.line(x1, y1, x2, y2);
              }
            });

            // Draw axis lines
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.15);
            for (let i = 0; i < n; i++) {
              const angle = (2 * Math.PI * i) / n - Math.PI / 2;
              const ex = radarCx + Math.cos(angle) * radarR;
              const ey = radarCy + Math.sin(angle) * radarR;
              pdf.line(radarCx, radarCy, ex, ey);
            }

            // Draw data polygon (filled)
            const dataPoints: [number, number][] = [];
            for (let i = 0; i < n; i++) {
              const angle = (2 * Math.PI * i) / n - Math.PI / 2;
              const dist = (pillarVals[i] / 100) * radarR;
              dataPoints.push([
                radarCx + Math.cos(angle) * dist,
                radarCy + Math.sin(angle) * dist,
              ]);
            }

            // Fill
            pdf.setFillColor(34, 197, 94);
            pdf.setGState(new (pdf as any).GState({ opacity: 0.25 }));
            // Use lines to create filled polygon
            const polyPath: number[] = [];
            dataPoints.forEach(([px, py], idx) => {
              if (idx === 0) {
                pdf.moveTo(px, py);
              }
              polyPath.push(px, py);
            });
            // Draw as filled triangle fan
            for (let i = 1; i < dataPoints.length - 1; i++) {
              pdf.triangle(
                dataPoints[0][0], dataPoints[0][1],
                dataPoints[i][0], dataPoints[i][1],
                dataPoints[i + 1][0], dataPoints[i + 1][1],
                'F'
              );
            }
            pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

            // Stroke outline
            pdf.setDrawColor(22, 163, 74);
            pdf.setLineWidth(0.6);
            for (let i = 0; i < dataPoints.length; i++) {
              const next = (i + 1) % dataPoints.length;
              pdf.line(dataPoints[i][0], dataPoints[i][1], dataPoints[next][0], dataPoints[next][1]);
            }

            // Dots and labels at each vertex
            for (let i = 0; i < n; i++) {
              const angle = (2 * Math.PI * i) / n - Math.PI / 2;
              const config = PILLAR_CONFIGS[pillarKeys[i]];
              const color = config?.color ? hexToRgb(config.color) : BRAND_LIGHT;

              // Dot at data point
              pdf.setFillColor(...(color as [number, number, number]));
              pdf.circle(dataPoints[i][0], dataPoints[i][1], 1.5, 'F');

              // Label outside
              const labelDist = radarR + 10;
              const lx = radarCx + Math.cos(angle) * labelDist;
              const ly = radarCy + Math.sin(angle) * labelDist;
              pdf.setFontSize(7);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(...(color as [number, number, number]));
              const labelText = `${config?.name || pillarKeys[i]} (${Math.round(pillarVals[i])})`;
              const align = Math.cos(angle) < -0.1 ? 'right' : Math.cos(angle) > 0.1 ? 'left' : 'center';
              pdf.text(labelText, lx, ly + 1, { align: align as any });
            }

            y = radarCy + radarR + 18;
          }
        }

        // ========================================
        // CROSS-PILLAR COMPARISON
        // ========================================
        if (reportData.summary.pillar_scores) {
          checkPage(55);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text('Cross-Pillar Comparison', M, y);
          y += 8;

          const cpEntries = Object.entries(reportData.summary.pillar_scores) as [string, number][];
          const maxScore = 100;
          const barH = 7;

          cpEntries.forEach(([key, pScore]) => {
            checkPage(14);
            const config = PILLAR_CONFIGS[key];
            const color = config?.color ? hexToRgb(config.color) : BRAND_LIGHT;

            // Label row
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...(color as [number, number, number]));
            pdf.text(`${config?.name || key}`, M, y + 3);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...GRAY);
            pdf.text(`${Math.round(pScore)}`, M + 25, y + 3);

            // Bar
            drawBar(M + 32, y, CW - 32, barH, pScore, maxScore, color as [number, number, number]);
            y += barH + 4;
          });

          // Strongest & Weakest callout
          const cpSorted = [...cpEntries].sort((a, b) => b[1] - a[1]);
          const strongest = cpSorted[0];
          const weakest = cpSorted[cpSorted.length - 1];
          y += 2;
          checkPage(14);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(34, 139, 34);
          pdf.text(`Strongest: ${PILLAR_CONFIGS[strongest[0]]?.fullName || strongest[0]} (${Math.round(strongest[1])}/100)`, M, y);
          y += 5;
          pdf.setTextColor(200, 120, 20);
          pdf.text(`Weakest: ${PILLAR_CONFIGS[weakest[0]]?.fullName || weakest[0]} (${Math.round(weakest[1])}/100)`, M, y);
          y += 10;
        }
      }

      // ========================================
      // ASSESSMENT SECTION
      // ========================================
      if (sections.assessment && reportData.pillars) {
        pdf.addPage();
        y = M;
        drawWatermark();

        sectionTitle('Detailed Assessment', 'AI-Driven Satellite Remote Sensing — All Pillars & Environmental Metrics');

        Object.entries(reportData.pillars).forEach(([key, pillar]) => {
          const pillarId = getPillarId(key);
          const config = PILLAR_CONFIGS[pillarId];
          const color = config?.color ? hexToRgb(config.color) : [...BRAND_LIGHT] as [number, number, number];
          const pillarScore = reportData.summary?.pillar_scores?.[pillarId];
          const desc = PILLAR_DESCRIPTIONS[pillarId];

          // Pillar header
          checkPage(40);
          pdf.setFillColor(...color);
          pdf.roundedRect(M, y, CW, 16, 2, 2, 'F');
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...WHITE);
          pdf.text(pillar.pillar_name || config?.fullName || key, M + 6, y + 7);
          if (pillarScore != null) {
            const pStatus = getOverallStatus(pillarScore as number);
            pdf.text(`${Math.round(pillarScore as number)}/100 — ${pStatus.grade}`, W - M - 6, y + 7, { align: 'right' });
          }
          // Metric count
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${Object.keys(pillar.metrics).length} metrics measured`, M + 6, y + 13);
          if (pillar.data_date) {
            pdf.text(`Data: ${pillar.data_date}`, W - M - 6, y + 13, { align: 'right' });
          }
          y += 22;

          // Description
          if (desc) {
            checkPage(20);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(...GRAY);
            const whatLines = pdf.splitTextToSize(desc.what, CW - 4);
            pdf.text(whatLines, M + 2, y);
            y += whatLines.length * 3.5 + 4;
          }

          // Metrics table header
          checkPage(12);
          pdf.setFillColor(240, 240, 240);
          pdf.rect(M, y, CW, 7, 'F');
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...DARK);
          pdf.text('Metric', M + 3, y + 5);
          pdf.text('Value', M + CW * 0.45, y + 5);
          pdf.text('Unit', M + CW * 0.65, y + 5);
          pdf.text('Quality', M + CW * 0.8, y + 5);
          y += 9;

          // Metrics rows
          let rowIndex = 0;
          Object.entries(pillar.metrics).forEach(([metricName, metric]) => {
            checkPage(8);
            const displayName = metricName.replace(/_/g, ' ');
            const capName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

            // Alternating row colors
            if (rowIndex % 2 === 0) {
              pdf.setFillColor(250, 250, 252);
              pdf.rect(M, y - 1, CW, 7, 'F');
            }

            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...DARK);
            pdf.text(capName.substring(0, 35), M + 3, y + 4);

            // Value
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...color);
            const val = metric.value != null
              ? (typeof metric.value === 'number' ? metric.value.toFixed(2) : String(metric.value))
              : 'N/A';
            pdf.text(val, M + CW * 0.45, y + 4);

            // Unit
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...GRAY);
            pdf.text((metric.unit || '-').substring(0, 15), M + CW * 0.65, y + 4);

            // Quality badge
            const qColor = hexToRgb(getQualityColor(metric.quality));
            pdf.setFillColor(...qColor);
            pdf.roundedRect(M + CW * 0.8, y, 18, 6, 1, 1, 'F');
            pdf.setFontSize(6);
            pdf.setTextColor(...WHITE);
            pdf.text(metric.quality || 'N/A', M + CW * 0.8 + 9, y + 4, { align: 'center' });

            y += 7;
            rowIndex++;
          });

          y += 6;

          // Per-pillar score interpretation
          if (pillarScore != null) {
            checkPage(16);
            const pStatus = getOverallStatus(pillarScore as number);
            const pColor = hexToRgb(pStatus.color);
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(M, y, CW, 12, 2, 2, 'F');
            pdf.setFillColor(...pColor);
            pdf.roundedRect(M, y, 3, 12, 1, 1, 'F');
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...pColor);
            pdf.text(`${pStatus.grade} — ${pStatus.status}`, M + 7, y + 5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...GRAY);
            pdf.text(pStatus.description, M + 7, y + 10);
            y += 16;
          }

          y += 6;
        });

        // Assessment note
        checkPage(16);
        pdf.setFillColor(240, 249, 255);
        pdf.roundedRect(M, y, CW, 12, 2, 2, 'F');
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(30, 64, 175);
        pdf.text('Assessment conducted using AI-driven satellite remote sensing. For ground-truth LiDAR verification, contact ErthaLoka.', M + 4, y + 5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('connect@erthaloka.com', M + 4, y + 10);
        y += 16;
      }

      // ========================================
      // REPORT SECTION
      // ========================================
      if (sections.report) {
        pdf.addPage();
        y = M;
        drawWatermark();

        sectionTitle('Environmental Report', 'Carbon Credits, Ecosystem Service Value & Narrative Analysis');
        y += 4;

        // Carbon Credits
        if (pData?.carbon_credits?.available) {
          checkPage(50);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text('Carbon Credits Analysis', M, y);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...GRAY);
          pdf.text('Aligned with Verra VCS / Gold Standard', M + 55, y);
          y += 8;

          const cc = pData.carbon_credits;
          const ccItems = [
            ['Carbon Stock', `${cc.carbon_stock_mg_c_ha?.toFixed(2)} Mg C/ha`],
            ['Total Carbon', `${cc.total_carbon_mg?.toFixed(2)} Mg C`],
            ['CO2 Equivalent', `${cc.co2_equivalent_tonnes?.toFixed(2)} tonnes`],
            ['Verified Credits (0.7x)', `${cc.verified_co2_tonnes?.toFixed(2)} tonnes CO2`],
            ['Market Value (Low)', `$${cc.estimated_value?.low_usd?.toLocaleString()}`],
            ['Market Value (Mid)', `$${cc.estimated_value?.mid_usd?.toLocaleString()}`],
            ['Market Value (High)', `$${cc.estimated_value?.high_usd?.toLocaleString()}`],
          ];

          ccItems.forEach(([label, value], idx) => {
            checkPage(8);
            if (idx % 2 === 0) {
              pdf.setFillColor(236, 253, 245);
              pdf.rect(M, y - 1, CW, 7, 'F');
            }
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...DARK);
            pdf.text(label, M + 4, y + 4);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(5, 150, 105);
            pdf.text(value, W - M - 4, y + 4, { align: 'right' });
            y += 7;
          });

          // Carbon methodology note
          y += 3;
          checkPage(10);
          pdf.setFillColor(236, 253, 245);
          pdf.roundedRect(M, y, CW, 8, 1.5, 1.5, 'F');
          pdf.setFontSize(6.5);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(5, 100, 75);
          pdf.text('Carbon stock calculated using IPCC Tier 1 methodology with 0.7x conservative verification factor', M + 4, y + 5);
          y += 14;
        }

        // Ecosystem Service Value
        if (pData?.ecosystem_service_value?.available) {
          checkPage(45);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text('Ecosystem Service Value (ESV)', M, y);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...GRAY);
          pdf.text('TEEB / Natural Capital Protocol', M + 70, y);
          y += 8;

          const esv = pData.ecosystem_service_value;
          const esvItems = [
            ['Ecosystem Type', (esv.ecosystem_type || '').replace(/_/g, ' ')],
            ['Baseline NCV', `$${esv.base_esv_per_ha_usd?.toLocaleString()}/ha/yr`],
            ['PPA-Adjusted ESV', `$${esv.adjusted_esv_per_ha_usd?.toLocaleString()}/ha/yr`],
            ['Total Area', `${esv.area_ha?.toFixed(2)} ha`],
            ['Total Annual ESV', `$${esv.total_annual_esv_usd?.toLocaleString()}/yr`],
          ];

          esvItems.forEach(([label, value], idx) => {
            checkPage(8);
            if (idx % 2 === 0) {
              pdf.setFillColor(239, 246, 255);
              pdf.rect(M, y - 1, CW, 7, 'F');
            }
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...DARK);
            pdf.text(label, M + 4, y + 4);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(37, 99, 235);
            pdf.text(value, W - M - 4, y + 4, { align: 'right' });
            y += 7;
          });
          y += 8;
        }

        // ========================================
        // LAND ECOSYSTEM VALUE — Service Breakdown
        // ========================================
        {
          const ecoType = reportData.summary?.ecosystem_type || 'default';
          const phiScore = reportData.summary?.overall_score || 0;
          const backendESV = pData?.ecosystem_service_value;
          const esvBreakdown = calculateESVBreakdown(phiScore, ecoType);
          const areaHa = backendESV?.area_ha || 1;
          const currentAnnualESV = backendESV?.total_annual_esv_usd || esvBreakdown.adjustedValue * areaHa;
          const projections = calculateAllProjections(currentAnnualESV, phiScore);

          checkPage(30);
          sectionTitle('Land Ecosystem Value — Service Breakdown', 'Costanza et al. (2014) + PPA Adjustment');
          y += 2;

          // Table header
          checkPage(10);
          pdf.setFillColor(...BRAND);
          pdf.rect(M, y, CW, 7, 'F');
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...WHITE);
          pdf.text('Service', M + 3, y + 5);
          pdf.text('Value ($/ha/yr)', M + CW * 0.45, y + 5);
          pdf.text('Share', M + CW * 0.65, y + 5);
          pdf.text('Distribution', M + CW * 0.77, y + 5);
          y += 9;

          const totalEsvValue = esvBreakdown.services.reduce((s, sv) => s + sv.value, 0);

          esvBreakdown.services.forEach((svc, idx) => {
            checkPage(8);
            if (idx % 2 === 0) {
              pdf.setFillColor(248, 250, 252);
              pdf.rect(M, y - 1, CW, 7, 'F');
            }
            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...DARK);
            pdf.text(svc.name, M + 3, y + 4);

            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(5, 150, 105);
            pdf.text(`$${svc.value.toLocaleString()}`, M + CW * 0.45, y + 4);

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...GRAY);
            pdf.text(`${svc.percentage}%`, M + CW * 0.65, y + 4);

            // Colored bar
            const barX = M + CW * 0.77;
            const barW = CW * 0.2;
            const svcColor = hexToRgb(svc.color);
            pdf.setFillColor(240, 240, 240);
            pdf.roundedRect(barX, y, barW, 5, 1, 1, 'F');
            const fillW = (svc.percentage / 100) * barW;
            if (fillW > 0) {
              pdf.setFillColor(...svcColor);
              pdf.roundedRect(barX, y, fillW, 5, 1, 1, 'F');
            }

            y += 7;
          });

          // Total row
          checkPage(10);
          pdf.setFillColor(236, 253, 245);
          pdf.rect(M, y - 1, CW, 8, 'F');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text('Total Adjusted ESV', M + 3, y + 5);
          pdf.text(`$${totalEsvValue.toLocaleString()}/ha/yr`, M + CW * 0.45, y + 5);
          y += 14;

          // ========================================
          // 5-YEAR VALUE PROJECTION
          // ========================================
          checkPage(70);
          sectionTitle('5-Year Value Projection', 'Conservative, Moderate & Optimistic Growth Scenarios');
          y += 2;

          const scenarios = [
            { label: 'Conservative (2%)', data: projections.conservative, color: [245, 158, 11] as [number, number, number] },
            { label: 'Moderate (5%)', data: projections.moderate, color: [34, 197, 94] as [number, number, number] },
            { label: 'Optimistic (10%)', data: projections.optimistic, color: [59, 130, 246] as [number, number, number] },
          ];

          // 3-column layout
          const projColW = (CW - 8) / 3;
          checkPage(65);

          scenarios.forEach((sc, colIdx) => {
            const colX = M + colIdx * (projColW + 4);

            // Header
            pdf.setFillColor(...sc.color);
            pdf.roundedRect(colX, y, projColW, 8, 1.5, 1.5, 'F');
            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...WHITE);
            pdf.text(sc.label, colX + projColW / 2, y + 5.5, { align: 'center' });

            // Year rows
            const yearLabels = ['Year 0', 'Year 1', 'Year 3', 'Year 5'];
            sc.data.projections.forEach((proj, rowIdx) => {
              const rowY = y + 11 + rowIdx * 9;
              if (rowIdx % 2 === 0) {
                pdf.setFillColor(248, 250, 252);
                pdf.rect(colX, rowY - 1, projColW, 8, 'F');
              }
              pdf.setFontSize(7);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(...GRAY);
              pdf.text(yearLabels[rowIdx], colX + 3, rowY + 4);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(...DARK);
              pdf.text(`$${proj.esv.toLocaleString()}`, colX + projColW - 3, rowY + 4, { align: 'right' });
            });

            // Growth %
            const growthY = y + 11 + 4 * 9 + 2;
            pdf.setFillColor(...sc.color);
            pdf.setGState(new (pdf as any).GState({ opacity: 0.15 }));
            pdf.roundedRect(colX, growthY, projColW, 8, 1.5, 1.5, 'F');
            pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...sc.color);
            pdf.text(`+${sc.data.esvGrowthPercent}% growth`, colX + projColW / 2, growthY + 5.5, { align: 'center' });
          });

          y += 11 + 4 * 9 + 16;

          // ========================================
          // CARBON SEQUESTRATION POTENTIAL
          // ========================================
          checkPage(50);
          sectionTitle('Carbon Sequestration Potential', '5-Year Cumulative Carbon Capture by Scenario');
          y += 2;

          // Table header
          pdf.setFillColor(...BRAND);
          pdf.rect(M, y, CW, 7, 'F');
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...WHITE);
          pdf.text('Scenario', M + 3, y + 5);
          pdf.text('Rate (tCO2/ha/yr)', M + CW * 0.35, y + 5);
          pdf.text('5-Year Total', M + CW * 0.58, y + 5);
          pdf.text('Description', M + CW * 0.75, y + 5);
          y += 9;

          scenarios.forEach((sc, idx) => {
            checkPage(8);
            if (idx % 2 === 0) {
              pdf.setFillColor(248, 250, 252);
              pdf.rect(M, y - 1, CW, 7, 'F');
            }
            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...sc.color);
            pdf.text(sc.data.scenario.label, M + 3, y + 4);

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...DARK);
            pdf.text(`${sc.data.scenario.carbonRate.toFixed(1)}`, M + CW * 0.35, y + 4);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${sc.data.totalCarbon.toFixed(1)} tCO2`, M + CW * 0.58, y + 4);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...GRAY);
            pdf.text(sc.data.scenario.description.substring(0, 30), M + CW * 0.75, y + 4);
            y += 7;
          });
          y += 8;

          // ========================================
          // VALUE COMPARISON — Current vs Projected
          // ========================================
          checkPage(55);
          sectionTitle('Value Comparison — Current vs Projected', 'Annual ESV: Current and Year 5 Projections');
          y += 2;

          const compBars = [
            { label: 'Current ESV', value: projections.currentESV, color: [107, 114, 128] as [number, number, number] },
            { label: 'Conservative Yr 5', value: projections.conservative.year5ESV, color: [245, 158, 11] as [number, number, number] },
            { label: 'Moderate Yr 5', value: projections.moderate.year5ESV, color: [34, 197, 94] as [number, number, number] },
            { label: 'Optimistic Yr 5', value: projections.optimistic.year5ESV, color: [59, 130, 246] as [number, number, number] },
          ];

          const maxCompVal = Math.max(...compBars.map(b => b.value));

          compBars.forEach((bar) => {
            checkPage(14);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...bar.color);
            pdf.text(bar.label, M, y + 3);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...DARK);
            pdf.text(`$${bar.value.toLocaleString()}`, M + CW - 2, y + 3, { align: 'right' });
            y += 5;

            drawBar(M, y, CW, 6, bar.value, maxCompVal, bar.color);
            y += 10;
          });
          y += 4;
        }

        // Environmental Narrative
        checkPage(30);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...BRAND);
        pdf.text('Environmental Narrative', M, y);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text('TNFD / ISSB context — why each pillar matters', M + 52, y);
        y += 8;

        if (reportData.pillars) {
          Object.entries(reportData.pillars).forEach(([key, pillar]) => {
            const pillarId = getPillarId(key);
            const config = PILLAR_CONFIGS[pillarId];
            const desc = PILLAR_DESCRIPTIONS[pillarId];
            const pillarScore = reportData.summary?.pillar_scores?.[pillarId];
            if (!desc) return;

            checkPage(30);
            const color = config?.color ? hexToRgb(config.color) : [...BRAND_LIGHT] as [number, number, number];

            // Pillar mini-header
            pdf.setFillColor(...color);
            pdf.roundedRect(M, y, 4, 4, 1, 1, 'F');
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...DARK);
            pdf.text(`${pillar.pillar_name || config?.fullName}${pillarScore != null ? ` (${Math.round(pillarScore as number)}/100)` : ''}`, M + 7, y + 3);
            y += 7;

            // Why it matters
            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...GRAY);
            const whyLines = pdf.splitTextToSize(`Why it matters: ${desc.why}`, CW - 8);
            pdf.text(whyLines, M + 7, y);
            y += whyLines.length * 3.2 + 6;
          });
        }
      }

      // ========================================
      // NOTES & METHODOLOGY (always included)
      // ========================================
      pdf.addPage();
      y = M;
      drawWatermark();

      sectionTitle('Notes & Methodology', 'Data Sources, Standards Reference & Compliance Framework');
      y += 4;

      // Assessment Methodology
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BRAND);
      pdf.text('Assessment Methodology', M, y);
      y += 6;

      const methodNotes = [
        'This assessment uses remote sensing data from NASA, ESA, and NOAA satellite instruments to measure 30+ environmental metrics across 5 pillars of planetary health.',
        'Metrics are normalized on a 0-100 scale using peer-reviewed environmental thresholds. The overall PPA score is a weighted average based on ecosystem type and data quality.',
        'Quality indicators (Good, Moderate, Supplemented, Poor, Unavailable) reflect the reliability of each data point based on cloud cover, sensor accuracy, and temporal coverage.',
        'Carbon credits are calculated using IPCC Tier 1 methodology with conservative verification factors (0.7x) applied to raw CO2 equivalent estimates.',
        'Ecosystem Service Value (ESV) uses Costanza et al. (2014) baseline values adjusted by the PPA score multiplier to reflect current ecosystem condition.',
      ];

      methodNotes.forEach((note) => {
        checkPage(14);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        const lines = pdf.splitTextToSize(`• ${note}`, CW - 6);
        pdf.text(lines, M + 3, y);
        y += lines.length * 3.2 + 3;
      });

      y += 4;

      // UN-SEEA Compliance
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BRAND);
      pdf.text('UN-SEEA Compliance', M, y);
      y += 6;

      const guidelineNotes = [
        'This report is prepared in accordance with the United Nations System of Environmental-Economic Accounting (UN-SEEA) Ecosystem Accounting framework.',
        'The assessment methodology aligns with SEEA-EA Chapter 6 (Ecosystem Condition) and Chapter 7 (Ecosystem Services), providing standardized metrics suitable for national and corporate reporting.',
        'Environmental data is structured to support the Kunming-Montreal Global Biodiversity Framework (GBF) monitoring requirements and national biodiversity strategy reporting.',
      ];

      guidelineNotes.forEach((note) => {
        checkPage(12);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        const lines = pdf.splitTextToSize(`• ${note}`, CW - 6);
        pdf.text(lines, M + 3, y);
        y += lines.length * 3.2 + 3;
      });

      y += 4;

      // Standards Reference Table — comprehensive 16+ standards
      checkPage(10);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BRAND);
      pdf.text('Standards Reference', M, y);
      y += 6;

      const allStandards = [
        { abbr: 'UN-SEEA', full: 'System of Environmental-Economic Accounting', body: 'United Nations' },
        { abbr: 'IPCC', full: 'Intergovernmental Panel on Climate Change', body: 'WMO / UNEP' },
        { abbr: 'GHG Protocol', full: 'Greenhouse Gas Protocol', body: 'WRI / WBCSD' },
        { abbr: 'UNFCCC CDM', full: 'Clean Development Mechanism', body: 'United Nations' },
        { abbr: 'Verra VCS', full: 'Verified Carbon Standard', body: 'Verra' },
        { abbr: 'Gold Standard', full: 'Gold Standard for Global Goals', body: 'Gold Standard Foundation' },
        { abbr: 'ICVCM', full: 'Integrity Council for Voluntary Carbon Markets', body: 'ICVCM' },
        { abbr: 'ISSB', full: 'International Sustainability Standards Board', body: 'IFRS Foundation' },
        { abbr: 'TNFD', full: 'Taskforce on Nature-related Financial Disclosures', body: 'TNFD' },
        { abbr: 'TCFD', full: 'Task Force on Climate-related Financial Disclosures', body: 'FSB' },
        { abbr: 'CDP', full: 'Carbon Disclosure Project', body: 'CDP Worldwide' },
        { abbr: 'GRI', full: 'Global Reporting Initiative', body: 'GRI' },
        { abbr: 'ISO 14064', full: 'GHG Quantification & Reporting', body: 'ISO' },
        { abbr: 'Natural Capital', full: 'Natural Capital Protocol', body: 'Capitals Coalition' },
        { abbr: 'TEEB', full: 'The Economics of Ecosystems & Biodiversity', body: 'UNEP' },
        { abbr: 'SBTi', full: 'Science Based Targets initiative', body: 'CDP / UNGC / WRI / WWF' },
      ];

      // Table header
      checkPage(8);
      pdf.setFillColor(...BRAND);
      pdf.rect(M, y, CW, 7, 'F');
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...WHITE);
      pdf.text('Standard', M + 3, y + 5);
      pdf.text('Full Name', M + 35, y + 5);
      pdf.text('Governing Body', M + CW * 0.72, y + 5);
      y += 9;

      allStandards.forEach((std, idx) => {
        checkPage(7);
        if (idx % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(M, y - 1, CW, 7, 'F');
        }
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...BRAND);
        pdf.text(std.abbr, M + 3, y + 4);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...DARK);
        pdf.text(std.full.substring(0, 40), M + 35, y + 4);
        pdf.setTextColor(...GRAY);
        pdf.text(std.body.substring(0, 25), M + CW * 0.72, y + 4);
        y += 7;
      });

      y += 6;

      // Standard & framework logos on Notes page — 2 rows of 5
      const notesRow1 = [
        { img: unseeaBase64, label: 'UN-SEEA' },
        { img: unfcccBase64, label: 'UNFCCC' },
        { img: verraBase64, label: 'Verra VCS' },
        { img: goldStdBase64, label: 'Gold Standard' },
        { img: esgBase64, label: 'ESG' },
      ].filter(l => l.img !== null);
      const notesRow2 = [
        { img: tnfdBase64, label: 'TNFD' },
        { img: issbBase64, label: 'ISSB' },
        { img: tcfdBase64, label: 'TCFD' },
        { img: cdpBase64, label: 'CDP' },
        { img: griBase64, label: 'GRI' },
      ].filter(l => l.img !== null);

      const drawNotesLogoRow = (logos: typeof notesRow1) => {
        if (logos.length === 0) return;
        checkPage(24);
        const nlW = 26;
        const nlH = 12;
        const nlGap = 5;
        const nlTotalW = logos.length * (nlW + 4) + (logos.length - 1) * nlGap;
        const nlStartX = (W - nlTotalW) / 2;
        logos.forEach((logo, idx) => {
          const lx = nlStartX + idx * (nlW + 4 + nlGap);
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(lx - 2, y - 2, nlW + 4, nlH + 10, 2, 2, 'F');
          pdf.setDrawColor(220, 220, 220);
          pdf.roundedRect(lx - 2, y - 2, nlW + 4, nlH + 10, 2, 2, 'S');
          pdf.addImage(logo.img!, 'PNG', lx, y, nlW, nlH);
          pdf.setFontSize(5.5);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND);
          pdf.text(logo.label, lx + nlW / 2, y + nlH + 5, { align: 'center' });
        });
        y += nlH + 14;
      };
      drawNotesLogoRow(notesRow1);
      drawNotesLogoRow(notesRow2);

      // SEEA compliance statement
      checkPage(10);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BRAND);
      pdf.text('This report is prepared in accordance with UN-SEEA Ecosystem Accounting guidelines.', M, y);
      y += 8;

      // Disclaimer
      checkPage(25);
      pdf.setFillColor(254, 243, 199);
      pdf.roundedRect(M, y, CW, 22, 2, 2, 'F');
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14);
      pdf.text('Disclaimer', M + 4, y + 5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      const disclaimerLines = pdf.splitTextToSize(
        'This report is based on satellite remote sensing data and computational models. While every effort is made to ensure accuracy, actual conditions may vary. This report should be used as a screening tool and supplemented with ground-truth verification for critical decisions. ErthaLoka does not guarantee the accuracy of third-party data sources. Carbon credit estimates are indicative and subject to formal verification by accredited bodies (e.g., Verra, Gold Standard).',
        CW - 8
      );
      pdf.text(disclaimerLines, M + 4, y + 10);
      y += 28;

      // ========================================
      // LAST PAGE: CTA
      // ========================================
      pdf.addPage();
      y = M;

      // Green background
      pdf.setFillColor(13, 40, 33);
      pdf.rect(0, 0, W, H, 'F');

      // Logo
      if (logoBase64) {
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(W / 2 - 35, 22, 70, 20, 3, 3, 'F');
        pdf.addImage(logoBase64, 'PNG', W / 2 - 30, 24, 60, 16);
      }

      y = 56;
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...WHITE);
      pdf.text('Want More Accurate Results?', W / 2, y, { align: 'center' });

      y += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(16, 185, 129);
      pdf.text('Upgrade to our comprehensive on-ground assessment', W / 2, y, { align: 'center' });

      y += 14;

      // Services — 6 cards
      const services = [
        { title: 'LiDAR & Pictorial Assessment', desc: 'Ground-truth verified scoring with LiDAR scanning and high-resolution pictorial surveys for highest data accuracy' },
        { title: 'Daily Live Monitoring', desc: 'Real-time environmental monitoring from ground-deployed IoT sensor networks with 24/7 data streaming' },
        { title: 'In-House Advanced Technology', desc: 'Proprietary sensor technology and edge computing infrastructure for continuous environmental measurement' },
        { title: 'AI Scoring & Assessment', desc: 'Machine learning models trained on millions of data points for precise, multi-dimensional environmental scoring' },
        { title: 'AI Prediction & Solutions', desc: 'Predictive analytics for ecosystem trends, carbon forecasting, and AI-driven restoration recommendations' },
        { title: 'Detailed Reports per Global Standards', desc: 'Comprehensive reports with full audit trails aligned with UN-SEEA, Verra VCS, Gold Standard, and ISSB frameworks' },
      ];

      services.forEach((svc) => {
        pdf.setFillColor(20, 55, 45);
        pdf.roundedRect(M + 5, y, CW - 10, 18, 2, 2, 'F');

        // Green dot
        pdf.setFillColor(16, 185, 129);
        pdf.circle(M + 12, y + 6, 2, 'F');

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(16, 185, 129);
        pdf.text(svc.title, M + 18, y + 7);

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(180, 200, 190);
        const descLines = pdf.splitTextToSize(svc.desc, CW - 28);
        pdf.text(descLines[0], M + 18, y + 13);
        y += 21;
      });

      // Contact CTA
      y += 4;
      pdf.setFillColor(16, 185, 129);
      pdf.roundedRect(M + 20, y, CW - 40, 20, 3, 3, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(13, 40, 33);
      pdf.text('Get in Touch', W / 2, y + 9, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('connect@erthaloka.com', W / 2, y + 16, { align: 'center' });

      y += 26;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 180, 170);
      pdf.text('UN-SEEA aligned reports usable for', W / 2, y, { align: 'center' });
      y += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(16, 185, 129);
      pdf.text('ESG  •  TNFD  •  ISSB  •  TCFD  •  CDP  •  GRI', W / 2, y, { align: 'center' });

      // Bottom note
      y = H - 28;
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 130, 120);
      const ctaNote = pdf.splitTextToSize(
        'ErthaLoka provides technology-driven environmental intelligence for corporates, financial institutions, and governments. Our platform combines satellite remote sensing, ground-deployed IoT sensors, LiDAR scanning, and proprietary AI to deliver the most comprehensive planetary health assessments available.',
        CW - 20
      );
      ctaNote.forEach((line: string, idx: number) => {
        pdf.text(line, W / 2, y + idx * 3.5, { align: 'center' });
      });

      // ========================================
      // FOOTER on all pages (watermarks already drawn before content)
      // ========================================
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer on all pages except cover
        if (i > 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.3);
          pdf.line(M, H - 14, W - M, H - 14);

          pdf.setFontSize(6);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(150, 150, 150);
          pdf.text('ErthaLoka — PPA Report | UN-SEEA Aligned', M, H - 10);
          pdf.text(`Page ${i} of ${totalPages}`, W - M, H - 10, { align: 'right' });
          pdf.text('CONFIDENTIAL', W / 2, H - 10, { align: 'center' });
        }
      }

      // Save
      const fileName = `PPA_Report_${reportLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {steps.map((step, idx) => {
            const isActive = idx === stepIndex;
            const isComplete = idx < stepIndex;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-[#0D2821] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-medium mt-1 ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-1 rounded mx-1 ${
                      idx < stepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 1: Details */}
        {currentStep === 'details' && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-10 h-10 text-orange-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">Assessment Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                Enter a label and optional organization details
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder='e.g., "Site Alpha", "Phase 2 Land"'
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-4">Optional organization details</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="Organization name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Type
                  </label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  >
                    <option value="">Select type (optional)</option>
                    {organizationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@org.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleContinueToPolygon}
                className="flex items-center gap-2 px-6 py-3 bg-[#0D2821] text-white rounded-lg hover:bg-[#065f46] transition-colors font-medium"
              >
                Continue to Polygon Selection
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Polygon */}
        {currentStep === 'polygon' && (
          <div className="min-h-[500px]">
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              Select the 4-corner polygon for assessment
            </div>
            <PolygonLandSelector
              onComplete={handlePolygonComplete}
              onBack={() => setCurrentStep('details')}
            />
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 'results' && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-[#0D2821] animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Running PPA Assessment...</p>
                <p className="text-sm text-gray-400 mt-2">
                  This may take 25-35 seconds
                </p>
                {saving && (
                  <p className="text-sm text-blue-500 mt-4">Saving to history...</p>
                )}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : phiData?.summary ? (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{formData.label}</h3>
                  {saved && (
                    <p className="text-sm text-green-600 mt-1 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Saved to history
                    </p>
                  )}
                </div>

                {/* PPA Score Summary */}
                <PHIScoreSummary summary={phiData.summary} />

                {/* ESV Breakdown */}
                <ESVBreakdown
                  phiScore={phiData.summary.overall_score || 0}
                  ecosystemType={phiData.summary.ecosystem_type}
                />

                {/* Carbon Credits & ESV Cards */}
                {polygonData &&
                  (polygonData.carbon_credits?.available ||
                    polygonData.ecosystem_service_value?.available) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Carbon Credits */}
                      {polygonData.carbon_credits?.available && (
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                              <TreePine className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Carbon Credits</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                              <span className="text-gray-600">Carbon Stock</span>
                              <span className="font-semibold">
                                {polygonData.carbon_credits.carbon_stock_mg_c_ha?.toFixed(1)} Mg C/ha
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                              <span className="text-gray-600">Total Carbon</span>
                              <span className="font-semibold">
                                {polygonData.carbon_credits.total_carbon_mg?.toFixed(1)} Mg C
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                              <span className="text-gray-600">CO2 Equivalent</span>
                              <span className="font-semibold">
                                {polygonData.carbon_credits.co2_equivalent_tonnes?.toFixed(1)} tonnes
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                              <span className="text-gray-600">Verified Credits</span>
                              <span className="font-bold text-emerald-600">
                                {polygonData.carbon_credits.verified_co2_tonnes?.toFixed(1)} tonnes
                                CO2
                              </span>
                            </div>
                            <div className="bg-emerald-100 rounded-xl p-4 mt-2">
                              <p className="text-sm text-gray-600 mb-1">Estimated Market Value</p>
                              <span className="text-emerald-700 font-bold text-2xl">
                                $
                                {polygonData.carbon_credits.estimated_value?.mid_usd?.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ($
                                {polygonData.carbon_credits.estimated_value?.low_usd?.toLocaleString()}{' '}
                                - $
                                {polygonData.carbon_credits.estimated_value?.high_usd?.toLocaleString()}
                                )
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ecosystem Service Value */}
                      {polygonData.ecosystem_service_value?.available && (
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                              <GlobeIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                              Ecosystem Service Value
                            </h3>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                              <span className="text-gray-600">Ecosystem Type</span>
                              <span className="font-semibold capitalize">
                                {polygonData.ecosystem_service_value.ecosystem_type?.replace(
                                  /_/g,
                                  ' '
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                              <span className="text-gray-600">Baseline NCV</span>
                              <span className="font-semibold">
                                $
                                {polygonData.ecosystem_service_value.base_esv_per_ha_usd?.toLocaleString()}
                                /ha/yr
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                              <span className="text-gray-600">Adjusted ESV</span>
                              <span className="font-semibold">
                                $
                                {polygonData.ecosystem_service_value.adjusted_esv_per_ha_usd?.toLocaleString()}
                                /ha/yr
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                              <span className="text-gray-600">Total Area</span>
                              <span className="font-semibold">
                                {polygonData.ecosystem_service_value.area_ha?.toFixed(2)} ha
                              </span>
                            </div>
                            <div className="bg-blue-100 rounded-xl p-4 mt-2">
                              <p className="text-sm text-gray-600 mb-1">Total Annual ESV</p>
                              <span className="text-blue-700 font-bold text-2xl">
                                $
                                {polygonData.ecosystem_service_value.total_annual_esv_usd?.toLocaleString()}
                                /yr
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Environmental Overview Radar */}
                {radarData && radarData.labels.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Environmental Overview
                    </h3>
                    <div className="max-w-xl mx-auto">
                      <RadarChart
                        labels={radarData.labels}
                        datasets={[
                          {
                            label: 'Environmental Health',
                            data: radarData.values,
                            backgroundColor: 'rgba(22, 163, 74, 0.2)',
                            borderColor: 'rgb(22, 163, 74)',
                          },
                        ]}
                        height={350}
                      />
                    </div>
                  </div>
                )}

                {/* Cross-Pillar Comparison */}
                {phiData.summary?.pillar_scores && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Cross-Pillar Comparison
                    </h3>
                    <BarChart
                      labels={Object.entries(phiData.summary.pillar_scores).map(
                        ([key]) =>
                          PILLAR_CONFIGS[getPillarId(key)]?.name || key
                      )}
                      datasets={[
                        {
                          label: 'Pillar Score',
                          data: Object.values(phiData.summary.pillar_scores),
                          backgroundColor: Object.entries(phiData.summary.pillar_scores).map(
                            ([key]) =>
                              PILLAR_CONFIGS[getPillarId(key)]?.color || '#6b7280'
                          ),
                        },
                      ]}
                      height={300}
                    />
                  </div>
                )}

                {/* Pillar Details - All Metrics */}
                {phiData.pillars && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Remote Sensing Data — All Pillars & Metrics
                    </h3>
                    {Object.entries(phiData.pillars).map(([key, pillar]) => {
                      const pillarId = getPillarId(key);
                      const config = PILLAR_CONFIGS[pillarId];
                      const pillarScore = phiData.summary?.pillar_scores?.[pillarId];
                      const pillarRadar = preparePillarRadarData(pillar.metrics);

                      return (
                        <div
                          key={key}
                          className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                        >
                          {/* Pillar Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: config?.color || '#6b7280' }}
                            >
                              {pillarId}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-bold text-gray-900">
                                  {pillar.pillar_name || config?.fullName || key}
                                </h4>
                                {pillarScore != null && (
                                  <span
                                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{
                                      backgroundColor: `${config?.color || '#6b7280'}20`,
                                      color: config?.color || '#6b7280',
                                    }}
                                  >
                                    {Math.round(pillarScore)}/100
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {Object.keys(pillar.metrics).length} metrics
                                {pillar.data_date ? ` · Data: ${pillar.data_date}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Metrics Grid */}
                            <div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(pillar.metrics).map(([metricName, metric]) => (
                                  <div
                                    key={metricName}
                                    className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <h5 className="text-xs font-semibold text-gray-700 capitalize">
                                        {metricName.replace(/_/g, ' ')}
                                      </h5>
                                      <span
                                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                        style={{
                                          backgroundColor: `${getQualityColor(metric.quality)}15`,
                                          color: getQualityColor(metric.quality),
                                        }}
                                      >
                                        {metric.quality || 'N/A'}
                                      </span>
                                    </div>
                                    <div
                                      className="text-lg font-bold"
                                      style={{ color: config?.color || '#0D2821' }}
                                    >
                                      {formatMetricValue(metric.value, metric.unit)}
                                    </div>
                                    {metric.description && (
                                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                                        {metric.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Per-Pillar Radar */}
                            {pillarRadar && pillarRadar.labels.length > 0 && (
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                  {pillar.pillar_name || config?.name} Radar
                                </h5>
                                <RadarChart
                                  labels={pillarRadar.labels}
                                  datasets={[
                                    {
                                      label: pillar.pillar_name || config?.name || key,
                                      data: pillarRadar.values,
                                      backgroundColor: `${config?.color || '#6b7280'}30`,
                                      borderColor: config?.color || '#6b7280',
                                    },
                                  ]}
                                  height={250}
                                />
                                <p className="text-[10px] text-gray-400 text-center mt-1">
                                  Normalized 0-100 (higher = better)
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => setCurrentStep('download')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0D2821] text-white rounded-lg hover:bg-[#065f46] transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Go to Download
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <RotateCcw className="w-5 h-5" />
                    New Assessment
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Step 4: Download */}
        {currentStep === 'download' && (
          <div className="max-w-lg mx-auto space-y-6 py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">Assessment Complete</h3>
              <p className="text-gray-500 mt-1">{formData.label}</p>
              {phiData?.summary?.overall_score != null && (
                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  Score: {phiData.summary.overall_score.toFixed(1)} / 100
                </p>
              )}
            </div>

            {/* PDF Section Toggles */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Select Report Sections</h4>
              <div className="space-y-3">
                {[
                  { key: 'score' as PDFSection, label: 'Score', desc: 'Overall PPA score, pillar scores, gauges, impact assessment' },
                  { key: 'assessment' as PDFSection, label: 'Assessment', desc: 'All 5 pillars with 30+ metrics, quality indicators, detailed analysis' },
                  { key: 'report' as PDFSection, label: 'Report', desc: 'Carbon credits, ESV, narrative analysis, recommendations' },
                ].map((section) => (
                  <label
                    key={section.key}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      pdfSections[section.key] ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={pdfSections[section.key]}
                      onChange={(e) => setPdfSections(prev => ({ ...prev, [section.key]: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{section.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{section.desc}</p>
                    </div>
                  </label>
                ))}

                {/* All toggle */}
                <button
                  onClick={() => {
                    const allSelected = pdfSections.score && pdfSections.assessment && pdfSections.report;
                    setPdfSections({ score: !allSelected, assessment: !allSelected, report: !allSelected });
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pdfSections.score && pdfSections.assessment && pdfSections.report
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {pdfSections.score && pdfSections.assessment && pdfSections.report ? 'All Selected' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Download button */}
            <div className="space-y-3">
              <button
                onClick={() => downloadPDF()}
                disabled={isGeneratingPDF || (!pdfSections.score && !pdfSections.assessment && !pdfSections.report)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0D2821] text-white rounded-lg hover:bg-[#065f46] transition-colors font-medium disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
              </button>

              {!pdfSections.score && !pdfSections.assessment && !pdfSections.report && (
                <p className="text-xs text-red-500 text-center">Select at least one section to download</p>
              )}

              <button
                onClick={() => setCurrentStep('results')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Eye className="w-5 h-5" />
                View Results
              </button>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <RotateCcw className="w-5 h-5" />
                Run New Assessment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">Assessment History</h3>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No baseline assessments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Label</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Admin</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Score</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Date</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3 text-gray-400 font-mono text-xs">
                      {item.id ? item.id.substring(0, 8) : '-'}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-900">
                      {item.label || 'Untitled'}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{item.admin_email}</td>
                    <td className="py-3 px-3">
                      {item.overall_score != null ? (
                        <span className="font-semibold text-emerald-600">
                          {item.overall_score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-600 max-w-[200px] truncate">
                      {item.location_name || '-'}
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewHistoryItem(item)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => downloadPDF(item.phi_response, item.label || 'Assessment')}
                          disabled={!item.phi_response}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaselineAssessment;
