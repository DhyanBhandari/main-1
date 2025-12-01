/**
 * Animated Line Chart Component
 */

import { Line } from 'react-chartjs-2';
import { commonOptions, chartColors } from './ChartConfig';

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
  height?: number;
  title?: string;
}

const defaultColors = [
  { border: chartColors.primary, bg: chartColors.primaryLight },
  { border: chartColors.secondary, bg: chartColors.secondaryLight },
  { border: chartColors.tertiary, bg: chartColors.tertiaryLight },
  { border: chartColors.quaternary, bg: chartColors.quaternaryLight },
];

export const LineChart = ({ labels, datasets, height = 300, title }: LineChartProps) => {
  const data = {
    labels,
    datasets: datasets.map((ds, index) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.borderColor || defaultColors[index % defaultColors.length].border,
      backgroundColor: ds.backgroundColor || defaultColors[index % defaultColors.length].bg,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: ds.borderColor || defaultColors[index % defaultColors.length].border,
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
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
