/**
 * Animated Polar Area Chart Component
 * Displays 5-axis environmental metrics in a radial format
 */

import { PolarArea } from 'react-chartjs-2';
import { chartColors } from './ChartConfig';

interface PolarAreaChartProps {
  labels: string[];
  data: number[];
  height?: number;
  title?: string;
  colors?: string[];
}

export const PolarAreaChart = ({
  labels,
  data,
  height = 350,
  title,
  colors
}: PolarAreaChartProps) => {
  const defaultColors = [
    'rgba(22, 163, 74, 0.7)',   // green - Air Quality
    'rgba(59, 130, 246, 0.7)',  // blue - Temperature
    'rgba(249, 115, 22, 0.7)',  // orange - Humidity
    'rgba(168, 85, 247, 0.7)',  // purple - Light
    'rgba(239, 68, 68, 0.7)',   // red - Pressure
  ];

  const borderColors = [
    'rgb(22, 163, 74)',
    'rgb(59, 130, 246)',
    'rgb(249, 115, 22)',
    'rgb(168, 85, 247)',
    'rgb(239, 68, 68)',
  ];

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors || defaultColors,
      borderColor: borderColors,
      borderWidth: 2,
      hoverBackgroundColor: defaultColors.map(c => c.replace('0.7', '0.9')),
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
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
            const value = context.raw || 0;
            return ` Score: ${value.toFixed(1)}/100`;
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
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          circular: true,
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          display: false, // Hide labels on the chart, show in legend
        },
        ticks: {
          stepSize: 20,
          font: {
            size: 10,
          },
          color: '#9ca3af',
          backdropColor: 'transparent',
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutQuart' as const,
    },
  };

  return (
    <div style={{ height }} className="relative">
      <PolarArea data={chartData} options={options} />
    </div>
  );
};

export default PolarAreaChart;
