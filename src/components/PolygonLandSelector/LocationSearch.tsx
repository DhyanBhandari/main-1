/**
 * LocationSearch - Step 1 of polygon selection
 *
 * Options:
 * 1. Search by address (geocoding via OpenStreetMap Nominatim)
 * 2. Use current location (browser geolocation)
 * 3. Manual coordinate entry
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Navigation, MapPin, Loader2, X, Check } from 'lucide-react';
import type { Coordinates } from './index';

interface LocationSearchProps {
  onLocationSelect: (coords: Coordinates, name: string) => void;
  selectedLocation: Coordinates | null;
  locationName: string;
}

type SearchMethod = 'search' | 'gps' | 'manual';

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  selectedLocation,
  locationName,
}) => {
  const [activeMethod, setActiveMethod] = useState<SearchMethod>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (activeMethod !== 'search' || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5`
        );
        const data = await response.json();
        setSearchResults(
          data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            display_name: item.display_name,
          }))
        );
      } catch (err) {
        setError('Failed to search location. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeMethod]);

  const handleResultSelect = (result: SearchResult) => {
    onLocationSelect({ lat: result.lat, lng: result.lng }, result.display_name);
    setSearchResults([]);
  };

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
          );
          const data = await response.json();
          onLocationSelect(coords, data.display_name || 'Current Location');
        } catch {
          onLocationSelect(coords, 'Current Location');
        }

        setIsGettingLocation(false);
      },
      (err) => {
        setError('Unable to get your location. Please allow location access or enter manually.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationSelect]);

  const handleManualSubmit = useCallback(() => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid numeric coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    setError(null);
    onLocationSelect({ lat, lng }, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  }, [manualLat, manualLng, onLocationSelect]);

  const methods = [
    { id: 'search' as SearchMethod, icon: Search, label: 'Search Address' },
    { id: 'gps' as SearchMethod, icon: Navigation, label: 'Current Location' },
    { id: 'manual' as SearchMethod, icon: MapPin, label: 'Enter Coordinates' },
  ];

  return (
    <div className="space-y-6">
      {/* Method Selection Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => {
              setActiveMethod(method.id);
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeMethod === method.id
                ? 'bg-white dark:bg-gray-700 text-[#2F5233] dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <method.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{method.label}</span>
          </button>
        ))}
      </div>

      {/* Search by Address */}
      {activeMethod === 'search' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an address or place..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 text-[#2F5233] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Get Current Location */}
      {activeMethod === 'gps' && (
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-full bg-[#2F5233]/10 flex items-center justify-center mb-4">
            <Navigation className="w-10 h-10 text-[#2F5233]" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            Use your device's GPS to find your current location
          </p>
          <button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center gap-2 px-6 py-3 bg-[#2F5233] text-white rounded-lg font-medium hover:bg-[#3d6b44] transition-colors disabled:opacity-50"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Get My Location
              </>
            )}
          </button>
        </div>
      )}

      {/* Manual Coordinate Entry */}
      {activeMethod === 'manual' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="-90 to 90"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                placeholder="-180 to 180"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleManualSubmit}
            disabled={!manualLat || !manualLng}
            className="w-full py-3 bg-[#2F5233] text-white rounded-lg font-medium hover:bg-[#3d6b44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set Location
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-800 dark:text-green-300">Location Selected</p>
            <p className="text-sm text-green-600 dark:text-green-400 truncate">{locationName}</p>
            <p className="text-xs text-green-500 dark:text-green-500">
              {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
