/**
 * InteractiveMap - Step 3 of PATH A
 * Click on satellite map to place 4 corners OR enter manually
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MousePointerClick, Edit3, RotateCcw, MapPin, Trash2 } from 'lucide-react';
import type { Coordinates, PolygonPoint } from './index';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const markerColors = ['#e74c3c', '#3498db', '#27ae60', '#f39c12'];
const pointLabels = ['NW', 'NE', 'SE', 'SW'];

// Create custom marker icons
const createIcon = (label: string, color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 11px;
    ">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Get zoom level from radius
const getZoom = (radius: number): number => {
  if (radius <= 5) return 14;
  if (radius <= 10) return 13;
  if (radius <= 25) return 11;
  return 9;
};

// Simple area calculation
const calculateArea = (points: PolygonPoint[]): { ha: number; acres: number } | null => {
  if (points.length !== 4) return null;
  try {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const centerLat = points.reduce((s, p) => s + p.lat, 0) / 4;
    const mLat = 111320;
    const mLng = 111320 * Math.cos(toRad(centerLat));
    const coords = points.map(p => ({ x: p.lng * mLng, y: p.lat * mLat }));
    let area = 0;
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      area += coords[i].x * coords[j].y - coords[j].x * coords[i].y;
    }
    area = Math.abs(area) / 2;
    return { ha: area / 10000, acres: area / 4046.86 };
  } catch {
    return null;
  }
};

interface InteractiveMapProps {
  center: Coordinates;
  radius: number;
  points: PolygonPoint[];
  onPointsChange: (points: PolygonPoint[]) => void;
}

// Map click handler
const ClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void; enabled: boolean }> = ({ onClick, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Map view controller
const MapController: React.FC<{ center: Coordinates; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center, zoom]);
  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ center, radius, points, onPointsChange }) => {
  const [mode, setMode] = useState<'click' | 'manual'>('click');
  const [manualInputs, setManualInputs] = useState(
    Array(4).fill(null).map(() => ({ lat: '', lng: '' }))
  );
  const zoom = getZoom(radius);
  const area = calculateArea(points);

  // Add point from map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (points.length >= 4) return;
    const newPoint: PolygonPoint = { lat, lng, label: pointLabels[points.length] };
    onPointsChange([...points, newPoint]);
  }, [points, onPointsChange]);

  // Remove point
  const handleRemove = useCallback((index: number) => {
    const updated = points.filter((_, i) => i !== index).map((p, i) => ({ ...p, label: pointLabels[i] }));
    onPointsChange(updated);
  }, [points, onPointsChange]);

  // Clear all
  const handleClear = useCallback(() => {
    onPointsChange([]);
  }, [onPointsChange]);

  // Manual submit
  const handleManualSubmit = useCallback(() => {
    const newPoints: PolygonPoint[] = [];
    for (let i = 0; i < 4; i++) {
      const lat = parseFloat(manualInputs[i].lat);
      const lng = parseFloat(manualInputs[i].lng);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert(`Point ${pointLabels[i]}: Invalid coordinates`);
        return;
      }
      newPoints.push({ lat, lng, label: pointLabels[i] });
    }
    onPointsChange(newPoints);
  }, [manualInputs, onPointsChange]);

  // Polygon positions for map
  const polygonPositions = points.length >= 3 ? points.map(p => [p.lat, p.lng] as [number, number]) : [];

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setMode('click')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'click' ? 'bg-white dark:bg-gray-700 text-[#2F5233] shadow-sm' : 'text-gray-500'
          }`}
        >
          <MousePointerClick className="w-4 h-4" />
          Click on Map
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'manual' ? 'bg-white dark:bg-gray-700 text-[#2F5233] shadow-sm' : 'text-gray-500'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Enter Coordinates
        </button>
      </div>

      {mode === 'click' ? (
        <>
          {/* Instructions */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {points.length < 4
                ? `Click to place point ${points.length + 1}/4 (${pointLabels[points.length]})`
                : 'All 4 points placed!'}
            </span>
            {points.length > 0 && (
              <button onClick={handleClear} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            )}
          </div>

          {/* Map */}
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700" style={{ height: '300px' }}>
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <MapController center={center} zoom={zoom} />

              {/* Satellite Layer */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri"
              />

              {/* Click Handler */}
              <ClickHandler onClick={handleMapClick} enabled={points.length < 4} />

              {/* Markers */}
              {points.map((pt, i) => (
                <Marker
                  key={i}
                  position={[pt.lat, pt.lng]}
                  icon={createIcon(pt.label, markerColors[i])}
                />
              ))}

              {/* Polygon */}
              {polygonPositions.length >= 3 && (
                <Polygon
                  positions={polygonPositions}
                  pathOptions={{ color: '#2F5233', fillColor: '#2F5233', fillOpacity: 0.2, weight: 2 }}
                />
              )}
            </MapContainer>

            {/* Legend */}
            <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow p-2 z-[1000]">
              {pointLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-xs py-0.5">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: markerColors[i] }} />
                  <span className={points.length > i ? 'text-gray-800 dark:text-white' : 'text-gray-400'}>{label}</span>
                  {points.length > i && (
                    <button onClick={() => handleRemove(i)} className="text-red-500 hover:text-red-600 ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Points Summary */}
          {points.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {points.map((pt, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: markerColors[i] }}>
                    {pt.label}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 font-mono">
                    {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Manual Entry */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {pointLabels.map((label, i) => (
              <div key={label} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: markerColors[i] }}>
                    {label}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="Lat"
                    value={manualInputs[i].lat}
                    onChange={(e) => {
                      const u = [...manualInputs];
                      u[i] = { ...u[i], lat: e.target.value };
                      setManualInputs(u);
                    }}
                    className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    placeholder="Lng"
                    value={manualInputs[i].lng}
                    onChange={(e) => {
                      const u = [...manualInputs];
                      u[i] = { ...u[i], lng: e.target.value };
                      setManualInputs(u);
                    }}
                    className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleManualSubmit}
            className="w-full py-2 bg-[#2F5233] text-white rounded-lg text-sm font-medium hover:bg-[#3d6b44]"
          >
            Set Points
          </button>
        </div>
      )}

      {/* Area Display */}
      {area && (
        <div className="bg-[#2F5233]/10 dark:bg-[#2F5233]/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#2F5233]" />
            <span className="text-sm font-semibold text-[#2F5233] dark:text-green-400">Land Area</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white dark:bg-gray-800 p-2 rounded">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{area.ha.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Hectares</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{area.acres.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Acres</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
