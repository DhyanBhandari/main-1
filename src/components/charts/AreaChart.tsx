/**
 * Animated Area Chart Component
 * For displaying cumulative data like carbon sequestration
 */

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AreaChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}

interface AreaChartProps {
  labels: string[];
  datasets: AreaChartDataset[];
  height?: number;
  title?: string;
  yAxisLabel?: string;
  stacked?: boolean;
}

export const AreaChart = ({
  labels,
  datasets,
  height = 300,
  title,
  yAxisLabel,
  stacked = false,
}: AreaChartProps) => {
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.borderColor || '#22c55e',
      backgroundColor: ds.backgroundColor || 'rgba(34, 197, 94, 0.2)',
      borderWidth: 2,
      fill: ds.fill !== false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
          color: '#374151',
        },
      },
      title: {
        display: !!title,
        text: title,
        color: '#111827',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: { bottom: 15 },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const value = context.raw;
            return ` ${context.dataset.label}: ${value.toFixed(1)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        stacked,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default AreaChart;
