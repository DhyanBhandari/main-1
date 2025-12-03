/**
 * Chart.js Configuration and Animation Settings
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  BubbleController,
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
  BarElement,
  ArcElement,
  RadialLinearScale,
  BubbleController,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Animation configurations
export const animationConfig = {
  animation: {
    duration: 1000,
    easing: 'easeOutQuart' as const,
  },
  transitions: {
    active: {
      animation: {
        duration: 300,
      },
    },
  },
};

// Color palette
export const chartColors = {
  primary: 'rgb(22, 163, 74)',      // green-600
  primaryLight: 'rgba(22, 163, 74, 0.2)',
  secondary: 'rgb(59, 130, 246)',   // blue-500
  secondaryLight: 'rgba(59, 130, 246, 0.2)',
  tertiary: 'rgb(249, 115, 22)',    // orange-500
  tertiaryLight: 'rgba(249, 115, 22, 0.2)',
  quaternary: 'rgb(168, 85, 247)',  // purple-500
  quaternaryLight: 'rgba(168, 85, 247, 0.2)',
  danger: 'rgb(239, 68, 68)',       // red-500
  dangerLight: 'rgba(239, 68, 68, 0.2)',
};

// Pillar colors for PHI dashboard
export const pillarColors = {
  A: { main: '#3498db', light: 'rgba(52, 152, 219, 0.2)' },  // Atmospheric - Blue
  B: { main: '#27ae60', light: 'rgba(39, 174, 96, 0.2)' },   // Biodiversity - Green
  C: { main: '#8e44ad', light: 'rgba(142, 68, 173, 0.2)' },  // Carbon - Purple
  D: { main: '#e74c3c', light: 'rgba(231, 76, 60, 0.2)' },   // Degradation - Red
  E: { main: '#f39c12', light: 'rgba(243, 156, 18, 0.2)' },  // Ecosystem - Orange
};

// Common chart options
export const commonOptions = {
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
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
  ...animationConfig,
};
