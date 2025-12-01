/**
 * Animated Doughnut Chart Component
 */

import { Doughnut } from 'react-chartjs-2';
import { animationConfig, chartColors } from './ChartConfig';

interface DoughnutChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
  height?: number;
  title?: string;
  centerText?: string;
}

const defaultColors = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
  chartColors.danger,
];

export const DoughnutChart = ({
  labels,
  data,
  colors,
  height = 300,
  title,
  centerText
}: DoughnutChartProps) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors || defaultColors.slice(0, data.length),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
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
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    ...animationConfig,
  };

  return (
    <div style={{ height, position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      {centerText && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '40%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div className="text-2xl font-bold text-gray-800">{centerText}</div>
        </div>
      )}
    </div>
  );
};

export default DoughnutChart;
