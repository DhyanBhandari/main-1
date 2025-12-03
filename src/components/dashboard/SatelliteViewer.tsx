/**
 * SatelliteViewer - Interactive satellite imagery viewer
 *
 * Features:
 * - Multiple image types (True Color, NDVI, LST, Land Cover, Forest)
 * - Color legends for each image type
 * - Loading states
 * - Error handling
 */

import React, { useState, useEffect } from 'react';
import { Satellite, Loader2, AlertCircle, RefreshCw, MapPin, Layers } from 'lucide-react';

// Image type configurations
const IMAGE_TYPES = [
  {
    id: 'true_color',
    name: 'True Color',
    description: 'Sentinel-2 RGB composite',
    icon: '🛰️'
  },
  {
    id: 'ndvi',
    name: 'Vegetation (NDVI)',
    description: 'Plant health index',
    icon: '🌿'
  },
  {
    id: 'lst',
    name: 'Temperature (LST)',
    description: 'Land surface temperature',
    icon: '🌡️'
  },
  {
    id: 'land_cover',
    name: 'Land Cover',
    description: 'ESA WorldCover classification',
    icon: '🗺️'
  },
  {
    id: 'forest',
    name: 'Forest Cover',
    description: 'Hansen tree cover density',
    icon: '🌲'
  }
];

// Color legends for each image type
const LEGENDS: Record<string, { color: string; label: string; value?: string }[]> = {
  ndvi: [
    { color: '#8B4513', label: 'No vegetation', value: '< 0' },
    { color: '#D2691E', label: 'Bare soil', value: '0 - 0.2' },
    { color: '#FFD700', label: 'Sparse', value: '0.2 - 0.4' },
    { color: '#9ACD32', label: 'Moderate', value: '0.4 - 0.6' },
    { color: '#228B22', label: 'Dense', value: '0.6 - 0.8' },
    { color: '#006400', label: 'Very dense', value: '> 0.8' }
  ],
  lst: [
    { color: '#313695', label: 'Very cold', value: '< 10°C' },
    { color: '#4575b4', label: 'Cold', value: '10-18°C' },
    { color: '#74add1', label: 'Cool', value: '18-25°C' },
    { color: '#fee090', label: 'Warm', value: '25-32°C' },
    { color: '#f46d43', label: 'Hot', value: '32-40°C' },
    { color: '#a50026', label: 'Very hot', value: '> 40°C' }
  ],
  land_cover: [
    { color: '#006400', label: 'Tree cover' },
    { color: '#ffbb22', label: 'Shrubland' },
    { color: '#ffff4c', label: 'Grassland' },
    { color: '#f096ff', label: 'Cropland' },
    { color: '#fa0000', label: 'Built-up' },
    { color: '#b4b4b4', label: 'Bare/sparse' },
    { color: '#0064c8', label: 'Water' },
    { color: '#0096a0', label: 'Wetland' }
  ],
  forest: [
    { color: '#FFFFFF', label: 'No trees', value: '0%' },
    { color: '#E8F5E9', label: 'Very sparse', value: '1-20%' },
    { color: '#A5D6A7', label: 'Sparse', value: '20-40%' },
    { color: '#66BB6A', label: 'Medium', value: '40-60%' },
    { color: '#388E3C', label: 'Dense', value: '60-80%' },
    { color: '#1B5E20', label: 'Very dense', value: '80-100%' }
  ]
};

interface SatelliteViewerProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  apiBaseUrl?: string;
}

const SatelliteViewer: React.FC<SatelliteViewerProps> = ({
  latitude,
  longitude,
  locationName,
  apiBaseUrl = import.meta.env.VITE_PHI_API_URL || 'http://localhost:8000'
}) => {
  const [selectedType, setSelectedType] = useState('ndvi');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch satellite image
  const fetchImage = async (imageType: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/satellite/image?lat=${latitude}&lon=${longitude}&image_type=${imageType}&buffer_km=5`
      );

      const data = await response.json();

      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        setError(data.error || 'Image not available');
        setImageUrl(null);
      }
    } catch (err) {
      setError('Failed to fetch satellite image');
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch image when type or location changes
  useEffect(() => {
    if (latitude && longitude) {
      fetchImage(selectedType);
    }
  }, [selectedType, latitude, longitude]);

  const currentLegend = LEGENDS[selectedType];
  const currentType = IMAGE_TYPES.find(t => t.id === selectedType);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Satellite Imagery</h3>
        </div>
        {locationName && (
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span>{locationName}</span>
          </div>
        )}
      </div>

      {/* Image Type Selector */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Layer Type</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {IMAGE_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedType === type.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>
        {currentType && (
          <p className="text-xs text-muted-foreground mt-2">{currentType.description}</p>
        )}
      </div>

      {/* Image Display */}
      <div className="relative aspect-square bg-muted">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading satellite image...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <span className="text-sm text-muted-foreground text-center">{error}</span>
            <button
              onClick={() => fetchImage(selectedType)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`${currentType?.name || selectedType} satellite view`}
            className="w-full h-full object-cover"
            onError={() => setError('Failed to load image')}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Select an image type</span>
          </div>
        )}
      </div>

      {/* Color Legend */}
      {currentLegend && currentLegend.length > 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Color Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currentLegend.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-xs">
                  <span className="text-foreground">{item.label}</span>
                  {item.value && (
                    <span className="text-muted-foreground ml-1">({item.value})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coordinates footer */}
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {latitude.toFixed(4)}°, {longitude.toFixed(4)}° | 5km buffer
        </span>
      </div>
    </div>
  );
};

export default SatelliteViewer;
