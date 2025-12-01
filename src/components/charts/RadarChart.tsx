/**
 * Animated Radar Chart Component for PHI Raw Data Visualization
 */

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { chartColors } from './ChartConfig';

// Register radar chart components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
  height?: number;
  title?: string;
  max?: number;
}

export const RadarChart = ({
  labels,
  datasets,
  height = 350,
  title,
  max = 100
}: RadarChartProps) => {
  const data = {
    labels,
    datasets: datasets.map((ds, index) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.backgroundColor || 'rgba(22, 163, 74, 0.2)',
      borderColor: ds.borderColor || chartColors.primary,
      borderWidth: 2,
      pointBackgroundColor: ds.borderColor || chartColors.primary,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: ds.borderColor || chartColors.primary,
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
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: { bottom: 20 },
      },
    },
    scales: {
      r: {
        min: 0,
        max: max,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 500,
          },
          color: '#374151',
        },
        ticks: {
          stepSize: max / 5,
          font: {
            size: 10,
          },
          color: '#6b7280',
          backdropColor: 'transparent',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
    },
  };

  return (
    <div style={{ height }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;
