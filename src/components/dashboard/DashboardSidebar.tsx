/**
 * DashboardSidebar - Navigation sidebar for dashboard template
 */

import { motion } from 'framer-motion';
import { BarChart3, RefreshCw, Clock, MapPin, Building2 } from 'lucide-react';
import type { DashboardData, DashboardLocation, PillarConfig } from '@/types/dashboard';
import { PILLAR_CONFIGS } from '@/types/dashboard';

interface DashboardSidebarProps {
  data: DashboardData | null;
  location: DashboardLocation;
  activePillar: string;
  onSectionClick: (sectionId: string) => void;
  onRefresh?: () => void;
  isMobile: boolean;
}

const DashboardSidebar = ({
  data,
  location,
  activePillar,
  onSectionClick,
  onRefresh,
  isMobile,
}: DashboardSidebarProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Score Card */}
      {data && (
        <div className="bg-gradient-to-br from-[#0D2821] to-[#1a4a3d] rounded-2xl p-5 text-white mb-6">
          {location.type === 'polygon' && (
            <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
              <Building2 className="w-4 h-4" />
              {location.name}
            </div>
          )}
          <div className="text-xs opacity-70 mb-1">Planetary Performance Assessment</div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">
              {data.summary.overall_score?.toFixed(1) || '—'}
            </span>
            <span className="text-sm mb-1 opacity-70">/100</span>
          </div>
          <div className="text-sm opacity-70 mt-2 capitalize">
            {data.summary.overall_interpretation || 'Loading...'}
          </div>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.summary.overall_score || 0}%` }}
              className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
            />
          </div>
          {location.area_hectares && (
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{location.area_hectares.toFixed(2)} hectares</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        <button
          onClick={() => onSectionClick('overview')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activePillar === 'overview' ? 'bg-[#0D2821] text-white shadow-lg' : 'hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">Overview</span>
        </button>

        <div className="pt-2 pb-1">
          <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Pillars
          </span>
        </div>

        {Object.entries(PILLAR_CONFIGS).map(([key, config]) => {
          const Icon = config.icon;
          const score = data?.summary.pillar_scores[key as keyof typeof data.summary.pillar_scores] || 0;
          return (
            <button
              key={key}
              onClick={() => onSectionClick(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activePillar === key ? 'bg-[#0D2821] text-white shadow-lg' : 'hover:bg-gray-100'
              }`}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: activePillar === key ? 'white' : config.color }}
              />
              <span className="font-medium flex-1 text-left">{config.name}</span>
              <span
                className={`text-sm font-bold ${
                  activePillar === key ? 'text-white' : getScoreColor(score)
                }`}
              >
                {score.toFixed(0)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Refresh Button */}
      {onRefresh && (
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <button
            onClick={onRefresh}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh Data</span>
          </button>
          {data && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(data.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
