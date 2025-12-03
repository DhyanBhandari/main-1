/**
 * TimeSeriesChart - Open-Meteo style time series visualization
 *
 * Features:
 * - Dark theme optimized
 * - Download buttons (XLSX, CSV)
 * - API URL display
 * - Generation time display
 */

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Download, ExternalLink } from 'lucide-react';
import { commonOptions } from './ChartConfig';

interface TimeSeriesData {
  time: string[];
  values: number[];
  unit: string;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData;
  title: string;
  color?: string;
  description?: string;
  apiUrl?: string;
  generationTime?: number;
  showDownloadButtons?: boolean;
  height?: number;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title,
  color = '#22c55e',
  description,
  apiUrl,
  generationTime,
  showDownloadButtons = true,
  height = 256
}) => {
  // Format labels for display (show only some labels to avoid crowding)
  const formatLabel = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric'
    });
  };

  const chartData = useMemo(() => ({
    labels: data.time.map((t, i) =>
      // Show every 6th label for hourly data
      i % 6 === 0 ? formatLabel(t) : ''
    ),
    datasets: [
      {
        label: `${title} (${data.unit})`,
        data: data.values,
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2
      }
    ]
  }), [data, title, color]);

  const options = useMemo(() => ({
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: false
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return new Date(data.time[index]).toLocaleString();
          },
          label: (context: any) => {
            return `${title}: ${context.parsed.y?.toFixed(2)} ${data.unit}`;
          }
        }
      }
    },
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        title: {
          display: true,
          text: data.unit,
          color: '#A0A0A0'
        }
      }
    }
  }), [data, title]);

  // Download as CSV
  const downloadCSV = () => {
    const csv = [
      ['Time', title],
      ...data.time.map((t, i) => [t, data.values[i]])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download as JSON (XLSX alternative for simplicity)
  const downloadJSON = () => {
    const json = {
      title,
      unit: data.unit,
      data: data.time.map((t, i) => ({
        time: t,
        value: data.values[i]
      }))
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {generationTime !== undefined && (
            <span className="text-xs text-muted-foreground">
              Generated in {generationTime.toFixed(2)}ms
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4" style={{ height }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Footer with downloads and API URL */}
      {(showDownloadButtons || apiUrl) && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Download buttons */}
            {showDownloadButtons && (
              <div className="flex gap-2">
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Download size={14} />
                  CSV
                </button>
                <button
                  onClick={downloadJSON}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <Download size={14} />
                  JSON
                </button>
              </div>
            )}

            {/* API URL */}
            {apiUrl && (
              <a
                href={apiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink size={12} />
                <span className="truncate max-w-xs">API URL</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSeriesChart;
