/**
 * Animated Bubble Chart Component
 * Displays time-based data density with bubble sizes representing magnitude
 */

import { Bubble } from 'react-chartjs-2';
import { chartColors } from './ChartConfig';

interface BubbleDataPoint {
  x: number;
  y: number;
  r: number;
}

interface BubbleChartProps {
  datasets: {
    label: string;
    data: BubbleDataPoint[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

export const BubbleChart = ({
  datasets,
  height = 350,
  title,
  xLabel = 'Hour of Day',
  yLabel = 'CO2 Level (ppm)',
}: BubbleChartProps) => {
  const defaultColors = [
    'rgba(22, 163, 74, 0.6)',
    'rgba(59, 130, 246, 0.6)',
    'rgba(249, 115, 22, 0.6)',
    'rgba(168, 85, 247, 0.6)',
  ];

  const borderColors = [
    'rgb(22, 163, 74)',
    'rgb(59, 130, 246)',
    'rgb(249, 115, 22)',
    'rgb(168, 85, 247)',
  ];

  const chartData = {
    datasets: datasets.map((ds, index) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: ds.borderColor || borderColors[index % borderColors.length],
      borderWidth: 2,
      hoverBackgroundColor: (ds.backgroundColor || defaultColors[index % defaultColors.length]).replace('0.6', '0.9'),
      hoverBorderWidth: 3,
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 14,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 10,
        callbacks: {
          label: (context: any) => {
            const point = context.raw;
            return [
              ` Hour: ${point.x}:00`,
              ` Value: ${point.y}`,
              ` Magnitude: ${point.r.toFixed(1)}`,
            ];
          },
        },
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
      x: {
        min: 0,
        max: 24,
        title: {
          display: true,
          text: xLabel,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 4,
          callback: (value: any) => `${value}:00`,
          font: {
            size: 11,
          },
          color: '#6b7280',
        },
      },
      y: {
        title: {
          display: true,
          text: yLabel,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280',
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const,
      delay: (context: any) => {
        if (context.type === 'data') {
          return context.dataIndex * 50;
        }
        return 0;
      },
    },
  };

  return (
    <div style={{ height }} className="relative">
      <Bubble data={chartData} options={options} />
    </div>
  );
};

export default BubbleChart;
