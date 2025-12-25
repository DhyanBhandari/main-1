/**
 * DirectCoordinateEntry - PATH B: Direct 4-point entry
 * Single step for users who already have their coordinates
 */

import React, { useState, useCallback } from 'react';
import { ChevronLeft, MapPin, Check, RotateCcw } from 'lucide-react';
import type { PolygonPoint } from './index';

const markerColors = ['#e74c3c', '#3498db', '#27ae60', '#f39c12'];
const pointLabels = ['NW', 'NE', 'SE', 'SW'];
const pointNames = ['Northwest', 'Northeast', 'Southeast', 'Southwest'];

interface DirectCoordinateEntryProps {
  onComplete: (points: PolygonPoint[]) => void;
  onBack: () => void;
}

// Simple area calculation
const calculateArea = (points: PolygonPoint[]): { m2: number; ha: number; acres: number } | null => {
  if (points.length !== 4) return null;

  try {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / 4;
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * Math.cos(toRadians(centerLat));

    const coords = points.map((p) => ({
      x: p.lng * metersPerDegreeLng,
      y: p.lat * metersPerDegreeLat,
    }));

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].x * coords[j].y;
      area -= coords[j].x * coords[i].y;
    }
    area = Math.abs(area) / 2;

    return {
      m2: area,
      ha: area / 10000,
      acres: area / 4046.86,
    };
  } catch {
    return null;
  }
};

const DirectCoordinateEntry: React.FC<DirectCoordinateEntryProps> = ({ onComplete, onBack }) => {
  const [inputs, setInputs] = useState<{ lat: string; lng: string }[]>(
    Array(4).fill(null).map(() => ({ lat: '', lng: '' }))
  );
  const [error, setError] = useState<string | null>(null);
  const [validatedPoints, setValidatedPoints] = useState<PolygonPoint[] | null>(null);

  // Validate and set points
  const handleValidate = useCallback(() => {
    setError(null);
    const points: PolygonPoint[] = [];

    for (let i = 0; i < 4; i++) {
      const lat = parseFloat(inputs[i].lat);
      const lng = parseFloat(inputs[i].lng);

      if (isNaN(lat) || isNaN(lng)) {
        setError(`${pointNames[i]}: Please enter valid coordinates`);
        setValidatedPoints(null);
        return;
      }

      if (lat < -90 || lat > 90) {
        setError(`${pointNames[i]}: Latitude must be between -90 and 90`);
        setValidatedPoints(null);
        return;
      }

      if (lng < -180 || lng > 180) {
        setError(`${pointNames[i]}: Longitude must be between -180 and 180`);
        setValidatedPoints(null);
        return;
      }

      points.push({ lat, lng, label: pointLabels[i] });
    }

    setValidatedPoints(points);
  }, [inputs]);

  // Clear all
  const handleClear = useCallback(() => {
    setInputs(Array(4).fill(null).map(() => ({ lat: '', lng: '' })));
    setValidatedPoints(null);
    setError(null);
  }, []);

  // Submit
  const handleSubmit = useCallback(() => {
    if (validatedPoints && validatedPoints.length === 4) {
      onComplete(validatedPoints);
    }
  }, [validatedPoints, onComplete]);

  const allFieldsFilled = inputs.every(p => p.lat && p.lng);
  const polygonArea = validatedPoints ? calculateArea(validatedPoints) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Enter Your Land Coordinates
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter 4 corner points in clockwise order
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Coordinate Entry Grid */}
      <div className="grid grid-cols-2 gap-3">
        {pointLabels.map((label, index) => (
          <div
            key={label}
            className={`p-3 rounded-xl border-2 transition-colors ${
              validatedPoints
                ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: markerColors[index] }}
              >
                {label}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {pointNames[index]}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Latitude</label>
                <input
                  type="text"
                  placeholder="e.g., 12.9716"
                  value={inputs[index].lat}
                  onChange={(e) => {
                    const updated = [...inputs];
                    updated[index] = { ...updated[index], lat: e.target.value };
                    setInputs(updated);
                    setValidatedPoints(null);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Longitude</label>
                <input
                  type="text"
                  placeholder="e.g., 77.5946"
                  value={inputs[index].lng}
                  onChange={(e) => {
                    const updated = [...inputs];
                    updated[index] = { ...updated[index], lng: e.target.value };
                    setInputs(updated);
                    setValidatedPoints(null);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
        <button
          onClick={handleValidate}
          disabled={!allFieldsFilled}
          className="flex-1 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Validate Points
        </button>
      </div>

      {/* Validated Area Display */}
      {validatedPoints && polygonArea && (
        <div className="bg-[#2F5233]/10 dark:bg-[#2F5233]/20 border border-[#2F5233]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-[#2F5233] dark:text-green-400">
              Coordinates Validated
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {polygonArea.ha.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hectares</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {polygonArea.acres.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Acres</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(polygonArea.m2 / 1000000).toFixed(4)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">km²</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={!validatedPoints}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            validatedPoints
              ? 'bg-[#2F5233] text-white hover:bg-[#3d6b44]'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Analyze Land
        </button>
      </div>
    </div>
  );
};

export default DirectCoordinateEntry;
