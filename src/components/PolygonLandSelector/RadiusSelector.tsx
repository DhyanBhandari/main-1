/**
 * RadiusSelector - Step 2 of polygon selection
 *
 * Allows user to select the viewing radius around their selected location.
 * This determines the zoom level and area visible on the satellite map.
 */

import React from 'react';
import { Circle, Check } from 'lucide-react';

interface RadiusSelectorProps {
  selectedRadius: number;
  onRadiusSelect: (radius: number) => void;
  locationName: string;
}

interface RadiusOption {
  value: number;
  label: string;
  description: string;
  zoomLevel: number;
}

const radiusOptions: RadiusOption[] = [
  { value: 5, label: '5 km', description: 'Small farm or plot', zoomLevel: 14 },
  { value: 10, label: '10 km', description: 'Medium farm or estate', zoomLevel: 13 },
  { value: 25, label: '25 km', description: 'Large agricultural area', zoomLevel: 11 },
  { value: 100, label: '100 km', description: 'Regional overview', zoomLevel: 9 },
];

const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  selectedRadius,
  onRadiusSelect,
  locationName,
}) => {
  return (
    <div className="space-y-6">
      {/* Info Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Select Viewing Radius
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose how much area to display around your location
        </p>
        {locationName && (
          <p className="text-xs text-[#2F5233] dark:text-green-400 mt-1 truncate px-4">
            {locationName}
          </p>
        )}
      </div>

      {/* Radius Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {radiusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onRadiusSelect(option.value)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selectedRadius === option.value
                ? 'border-[#2F5233] bg-[#2F5233]/5 dark:bg-[#2F5233]/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {/* Selection Indicator */}
            {selectedRadius === option.value && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#2F5233] flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedRadius === option.value
                    ? 'bg-[#2F5233] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Circle className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-xl font-bold ${
                    selectedRadius === option.value
                      ? 'text-[#2F5233] dark:text-green-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {option.label}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Visual Representation */}
      <div className="relative h-48 bg-gradient-to-br from-[#2F5233]/10 to-[#2F5233]/5 dark:from-[#2F5233]/20 dark:to-[#2F5233]/10 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Concentric circles representing radius */}
          <div className="relative">
            {[50, 40, 30, 20, 10].map((size, index) => {
              const radiusValue = radiusOptions[4 - index]?.value;
              const isSelected = selectedRadius === radiusValue;
              return (
                <div
                  key={size}
                  className={`absolute rounded-full border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-[#2F5233] bg-[#2F5233]/10'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{
                    width: `${size * 3}px`,
                    height: `${size * 3}px`,
                    top: `50%`,
                    left: `50%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isSelected ? 1 : 0.3,
                  }}
                />
              );
            })}
            {/* Center point */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg z-10" />
          </div>
        </div>

        {/* Selected radius label */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-[#2F5233] dark:text-green-400 shadow">
            {selectedRadius} km radius selected
          </span>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        You can adjust this later. A larger radius shows more context but may make precise
        selection harder.
      </p>
    </div>
  );
};

export default RadiusSelector;
