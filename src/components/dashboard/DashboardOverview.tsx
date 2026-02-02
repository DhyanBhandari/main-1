/**
 * DashboardOverview - Overview section with radar chart and pillar cards
 */

import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import type { DashboardData, DashboardLocation } from '@/types/dashboard';
import { PILLAR_CONFIGS } from '@/types/dashboard';

interface DashboardOverviewProps {
  data: DashboardData;
  location: DashboardLocation;
  onPillarClick: (pillarId: string) => void;
}

const DashboardOverview = ({ data, location, onPillarClick }: DashboardOverviewProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRadarData = () => {
    return Object.entries(data.summary.pillar_scores).map(([key, value]) => ({
      subject: PILLAR_CONFIGS[key]?.name || key,
      score: value,
      fullMark: 100,
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Radar Chart */}
        <div className="flex-1 min-h-[250px]">
          <h3 className="text-lg font-semibold mb-4">Pillar Scores</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={getRadarData()} outerRadius={70}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
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
            {Object.entries(PILLAR_CONFIGS).map(([key, config]) => {
              const Icon = config.icon;
              const score = data.summary.pillar_scores[key as keyof typeof data.summary.pillar_scores] || 0;
              return (
                <button
                  key={key}
                  onClick={() => onPillarClick(key)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
                  >
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
  );
};

export default DashboardOverview;
