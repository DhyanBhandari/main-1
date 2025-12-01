/**
 * Progressive Line Chart Component
 * Animated line chart that reveals data points progressively
 */

import { Line } from 'react-chartjs-2';
import { useRef, useEffect, useState } from 'react';
import { chartColors } from './ChartConfig';

interface ProgressiveLineProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
  height?: number;
  title?: string;
  animateOnScroll?: boolean;
  gradientFill?: boolean;
}

export const ProgressiveLine = ({
  labels,
  datasets,
  height = 300,
  title,
  animateOnScroll = true,
  gradientFill = true,
}: ProgressiveLineProps) => {
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!animateOnScroll);

  // Intersection observer for scroll animation
  useEffect(() => {
    if (!animateOnScroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animateOnScroll]);

  const chartData = {
    labels,
    datasets: datasets.map((ds, index) => ({
      label: ds.label,
      data: isVisible ? ds.data : ds.data.map(() => 0),
      borderColor: ds.borderColor || chartColors.primary,
      backgroundColor: ds.backgroundColor || chartColors.primaryLight,
      fill: ds.fill ?? gradientFill,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: ds.borderColor || chartColors.primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 3,
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
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            return ` ${context.dataset.label}: ${value.toFixed(1)}`;
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
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280',
        },
      },
      y: {
        min: 0,
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
      duration: isVisible ? 2000 : 0,
      easing: 'easeOutQuart' as const,
      delay: (context: any) => {
        if (context.type === 'data' && context.mode === 'default') {
          return context.dataIndex * 100;
        }
        return 0;
      },
    },
    transitions: {
      active: {
        animation: {
          duration: 300,
        },
      },
    },
  };

  return (
    <div ref={containerRef} style={{ height }} className="relative">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default ProgressiveLine;
