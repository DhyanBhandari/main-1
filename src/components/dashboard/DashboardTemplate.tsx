/**
 * DashboardTemplate - Reusable Dashboard Component
 *
 * This template is used across:
 * - Public Dashboard (/dashboard)
 * - Institute Dashboards (/institute/:id/dashboard)
 * - Admin Preview (in admin panel)
 *
 * Same layout, same UI - different data based on location
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wind, Leaf, TreePine, Thermometer, Globe,
  Menu, X, LogOut, RefreshCw, MapPin, Clock,
  AlertCircle, BarChart3, Building2
} from 'lucide-react';
import { DottedGlowBackground } from '@/components/ui/dotted-glow-background';
import logo from '@/assets/logo-new.png';
import type { DashboardTemplateProps } from '@/types/dashboard';
import { PILLAR_CONFIGS } from '@/types/dashboard';
import DashboardOverview from './DashboardOverview';
import DashboardPillarSection from './DashboardPillarSection';
import DashboardLiveMonitoring from './DashboardLiveMonitoring';
import DashboardSidebar from './DashboardSidebar';

// Set icons for pillar configs
PILLAR_CONFIGS.A.icon = Wind;
PILLAR_CONFIGS.B.icon = Leaf;
PILLAR_CONFIGS.C.icon = TreePine;
PILLAR_CONFIGS.D.icon = Thermometer;
PILLAR_CONFIGS.E.icon = Globe;

const SECTION_IDS = ['overview', 'live', 'A', 'B', 'C', 'D', 'E'];

const DashboardTemplate = ({
  data,
  location,
  user = { name: 'User', role: 'public' },
  options = {},
  loading = false,
  error = null,
  onRefresh,
  onLogout,
}: DashboardTemplateProps) => {
  const [activePillar, setActivePillar] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Setup Intersection Observer for scroll tracking
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) setActivePillar(sectionId);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  // Observe sections
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;
    Object.entries(sectionRefs.current).forEach(([id, ref]) => {
      if (ref) {
        ref.setAttribute('data-section', id);
        observer.observe(ref);
      }
    });
    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [loading, data]);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
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
              {user.role === 'institute' && <Building2 className="w-4 h-4 text-gray-500" />}
              <span className="font-medium text-gray-700">{location.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!loading && data && (
              <div className="lg:hidden text-right">
                <div className="text-xs text-gray-500">PPA Score</div>
                <div className="text-lg font-bold text-[#0D2821]">
                  {data.summary.overall_score?.toFixed(0) || '—'}
                </div>
              </div>
            )}
            {options.showLogout && onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
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
                className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed top-16 left-0 bottom-0 w-72 bg-white z-50 overflow-y-auto shadow-xl"
              >
                <DashboardSidebar
                  data={data}
                  location={location}
                  activePillar={activePillar}
                  onSectionClick={scrollToSection}
                  onRefresh={options.showRefresh ? onRefresh : undefined}
                  isMobile={true}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Left Sidebar - Desktop */}
        <aside className="hidden lg:flex fixed top-16 left-0 bottom-0 w-72 border-r border-gray-200 bg-white/80 backdrop-blur-sm flex-col overflow-y-auto z-20">
          <DashboardSidebar
            data={data}
            location={location}
            activePillar={activePillar}
            onSectionClick={scrollToSection}
            onRefresh={options.showRefresh ? onRefresh : undefined}
            isMobile={false}
          />
        </aside>

        {/* Main Content */}
        <main className="lg:ml-72 pt-16 min-h-screen">
          <div className="p-4 md:p-8 max-w-6xl">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D2821] mx-auto mb-4" />
                  <p className="text-gray-600">
                    {location.type === 'polygon' ? 'Loading polygon data...' : 'Loading dashboard...'}
                  </p>
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
                    {onRefresh && (
                      <button
                        onClick={onRefresh}
                        className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {!loading && !error && data && (
              <>
                {/* Overview Section */}
                <section ref={(el) => (sectionRefs.current['overview'] = el)} className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {location.name} Dashboard
                  </h1>
                  <DashboardOverview
                    data={data}
                    location={location}
                    onPillarClick={scrollToSection}
                  />
                </section>

                {/* Live Monitoring Section */}
                {(data.weather || data.aqi) && (
                  <section ref={(el) => (sectionRefs.current['live'] = el)} className="mb-8">
                    <DashboardLiveMonitoring weather={data.weather} aqi={data.aqi} />
                  </section>
                )}

                {/* Pillar Sections */}
                {Object.entries(PILLAR_CONFIGS).map(([key, config]) => (
                  <section
                    key={key}
                    ref={(el) => (sectionRefs.current[key] = el)}
                    className="mb-8 scroll-mt-20"
                  >
                    <DashboardPillarSection
                      pillarKey={key}
                      pillarConfig={config}
                      pillarData={data.pillars[key as keyof typeof data.pillars]}
                      score={data.summary.pillar_scores[key as keyof typeof data.summary.pillar_scores]}
                    />
                  </section>
                ))}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardTemplate;
