/**
 * PolygonLandSelector - Interactive land parcel selection
 *
 * Two Paths:
 * PATH A: Select on Satellite Map (3 steps)
 *   Step 1: Find Location (search, GPS, manual)
 *   Step 2: Set Radius (5km, 10km, 25km, 100km)
 *   Step 3: Click 4 corners on satellite image
 *
 * PATH B: Direct Coordinate Entry (1 step)
 *   Enter 4 corner coordinates directly
 */

import React, { useState, useCallback } from 'react';
import { Map, MapPin, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import LocationSearch from './LocationSearch';
import RadiusSelector from './RadiusSelector';
import InteractiveMap from './InteractiveMap';
import DirectCoordinateEntry from './DirectCoordinateEntry';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PolygonPoint extends Coordinates {
  label: string;
}

interface PolygonLandSelectorProps {
  onComplete: (points: PolygonPoint[]) => void;
  onBack: () => void;
}

type Path = 'choice' | 'map-flow' | 'direct-entry';
type MapStep = 'location' | 'radius' | 'select';

const mapSteps: { id: MapStep; title: string; description: string }[] = [
  { id: 'location', title: 'Find Location', description: 'Search or enter coordinates' },
  { id: 'radius', title: 'Set Radius', description: 'Choose map viewing area' },
  { id: 'select', title: 'Mark Land', description: 'Click 4 corners on map' },
];

const PolygonLandSelector: React.FC<PolygonLandSelectorProps> = ({ onComplete, onBack }) => {
  // Path selection
  const [currentPath, setCurrentPath] = useState<Path>('choice');

  // Map flow state (PATH A)
  const [mapStep, setMapStep] = useState<MapStep>('location');
  const [centerLocation, setCenterLocation] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);

  const mapStepIndex = mapSteps.findIndex(s => s.id === mapStep);

  // Handlers for Location Search
  const handleLocationSelect = useCallback((coords: Coordinates, name: string) => {
    setCenterLocation(coords);
    setLocationName(name);
  }, []);

  // Handlers for Radius
  const handleRadiusSelect = useCallback((selectedRadius: number) => {
    setRadius(selectedRadius);
  }, []);

  // Handlers for Points
  const handlePointsChange = useCallback((points: PolygonPoint[]) => {
    setPolygonPoints(points);
  }, []);

  // Navigation for Map Flow
  const handleMapNext = () => {
    if (mapStep === 'location' && centerLocation) {
      setMapStep('radius');
    } else if (mapStep === 'radius') {
      setMapStep('select');
    } else if (mapStep === 'select' && polygonPoints.length === 4) {
      onComplete(polygonPoints);
    }
  };

  const handleMapBack = () => {
    if (mapStep === 'location') {
      setCurrentPath('choice');
    } else if (mapStep === 'radius') {
      setMapStep('location');
    } else if (mapStep === 'select') {
      setMapStep('radius');
    }
  };

  const canProceedMap = () => {
    switch (mapStep) {
      case 'location':
        return centerLocation !== null;
      case 'radius':
        return radius > 0;
      case 'select':
        return polygonPoints.length === 4;
      default:
        return false;
    }
  };

  // Direct Entry Complete
  const handleDirectComplete = (points: PolygonPoint[]) => {
    onComplete(points);
  };

  // ============ RENDER: Choice Screen ============
  if (currentPath === 'choice') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            How do you want to define your land?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose the method that works best for you
          </p>
        </div>

        <div className="space-y-3">
          {/* Option A: Map View */}
          <button
            onClick={() => setCurrentPath('map-flow')}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#2F5233] hover:bg-[#2F5233]/5 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Select on Map
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Find your land visually and click 4 corners on the image
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    3 steps
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    Visual selection
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Option B: Direct Entry */}
          <button
            onClick={() => setCurrentPath('direct-entry')}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#2F5233] hover:bg-[#2F5233]/5 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  I Have My Coordinates
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Enter 4 corner points directly (NW, NE, SE, SW)
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    1 step
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    Quick entry
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mx-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Menu
        </button>
      </div>
    );
  }

  // ============ RENDER: Direct Entry (PATH B) ============
  if (currentPath === 'direct-entry') {
    return (
      <DirectCoordinateEntry
        onComplete={handleDirectComplete}
        onBack={() => setCurrentPath('choice')}
      />
    );
  }

  // ============ RENDER: Map Flow (PATH A) ============
  return (
    <div className="flex flex-col h-full">
      {/* Step Progress */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex items-center justify-between mb-3">
          {mapSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    index < mapStepIndex
                      ? 'bg-green-500 text-white'
                      : index === mapStepIndex
                      ? 'bg-[#2F5233] text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {index < mapStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400 text-center max-w-[70px]">
                  {step.title}
                </span>
              </div>
              {index < mapSteps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    index < mapStepIndex
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {mapSteps[mapStepIndex].description}
        </p>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto">
        {mapStep === 'location' && (
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            selectedLocation={centerLocation}
            locationName={locationName}
          />
        )}

        {mapStep === 'radius' && centerLocation && (
          <RadiusSelector
            selectedRadius={radius}
            onRadiusSelect={handleRadiusSelect}
            locationName={locationName}
          />
        )}

        {mapStep === 'select' && centerLocation && (
          <InteractiveMap
            center={centerLocation}
            radius={radius}
            points={polygonPoints}
            onPointsChange={handlePointsChange}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 flex justify-between">
        <button
          onClick={handleMapBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {mapStep === 'location' ? 'Back' : 'Previous'}
        </button>

        <button
          onClick={handleMapNext}
          disabled={!canProceedMap()}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            canProceedMap()
              ? 'bg-[#2F5233] text-white hover:bg-[#3d6b44]'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {mapStep === 'select' ? (
            <>
              <Check className="w-4 h-4" />
              Analyze Land
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PolygonLandSelector;
