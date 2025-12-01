/**
 * Animated Bar Chart Component
 */

import { Bar } from 'react-chartjs-2';
import { commonOptions, chartColors } from './ChartConfig';

interface BarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
  height?: number;
  title?: string;
  stacked?: boolean;
}

const defaultColors = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
];

export const BarChart = ({
  labels,
  datasets,
  height = 300,
  title,
  stacked = false
}: BarChartProps) => {
  const data = {
    labels,
    datasets: datasets.map((ds, index) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: ds.borderColor || defaultColors[index % defaultColors.length],
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false as const,
    })),
  };

  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
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
      ...commonOptions.scales,
      x: {
        ...commonOptions.scales.x,
        stacked,
      },
      y: {
        ...commonOptions.scales.y,
        stacked,
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
