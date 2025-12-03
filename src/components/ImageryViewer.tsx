import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Radar,
  Thermometer,
  TreePine,
  Map,
  Layers
} from 'lucide-react';
import { ImageryResponse, ImageryResult, getImagery } from '@/services/phiApi';

interface ImageryViewerProps {
  latitude: number;
  longitude: number;
  onLoad?: () => void;
}

// Imagery type configuration
const IMAGERY_CONFIG = {
  true_color: {
    icon: ImageIcon,
    label: 'True Color',
    shortLabel: 'RGB',
    color: '#3b82f6',
    description: 'Natural color view from Sentinel-2'
  },
  ndvi: {
    icon: TreePine,
    label: 'Vegetation Health',
    shortLabel: 'NDVI',
    color: '#22c55e',
    description: 'Vegetation density and health index'
  },
  lst: {
    icon: Thermometer,
    label: 'Temperature',
    shortLabel: 'LST',
    color: '#ef4444',
    description: 'Land surface temperature from MODIS'
  },
  land_cover: {
    icon: Layers,
    label: 'Land Cover',
    shortLabel: 'Cover',
    color: '#a855f7',
    description: 'ESA WorldCover classification'
  },
  forest_cover: {
    icon: TreePine,
    label: 'Forest Density',
    shortLabel: 'Forest',
    color: '#065f46',
    description: 'Tree canopy cover percentage'
  }
};

type ImageryType = keyof typeof IMAGERY_CONFIG;

export const ImageryViewer = ({ latitude, longitude, onLoad }: ImageryViewerProps) => {
  const [imagery, setImagery] = useState<ImageryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ImageryType>('true_color');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  useEffect(() => {
    const fetchImagery = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getImagery(latitude, longitude, 5, 512);
        setImagery(data);
        onLoad?.();
      } catch (err) {
        console.error('Failed to fetch imagery:', err);
        setError(err instanceof Error ? err.message : 'Failed to load imagery');
      } finally {
        setLoading(false);
      }
    };

    fetchImagery();
  }, [latitude, longitude, onLoad]);

  const handleImageLoad = (type: string) => {
    setImageLoadStates(prev => ({ ...prev, [type]: 'loaded' }));
  };

  const handleImageError = (type: string) => {
    setImageLoadStates(prev => ({ ...prev, [type]: 'error' }));
  };

  const getCurrentImagery = (): ImageryResult | undefined => {
    if (!imagery?.imagery) return undefined;
    return imagery.imagery[selectedType];
  };

  const navigateImagery = (direction: 'prev' | 'next') => {
    const types = Object.keys(IMAGERY_CONFIG) as ImageryType[];
    const currentIndex = types.indexOf(selectedType);
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % types.length
      : (currentIndex - 1 + types.length) % types.length;
    setSelectedType(types[newIndex]);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Radar className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl font-bold text-gray-900">Remote Sensing Imagery</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-gray-500">Loading Earth observation data...</p>
          <p className="text-sm text-gray-400 mt-1">Generating imagery from multiple sources</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Radar className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl font-bold text-gray-900">Remote Sensing Imagery</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load imagery</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const currentImagery = getCurrentImagery();
  const config = IMAGERY_CONFIG[selectedType];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Radar className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">Remote Sensing Imagery</h3>
          </div>
          {imagery?.generated_at && (
            <span className="text-xs text-gray-400">
              Generated: {new Date(imagery.generated_at).toLocaleString()}
            </span>
          )}
        </div>

        {/* Imagery Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(IMAGERY_CONFIG) as ImageryType[]).map((type) => {
            const typeConfig = IMAGERY_CONFIG[type];
            const Icon = typeConfig.icon;
            const isActive = selectedType === type;
            const imgData = imagery?.imagery?.[type];
            const isAvailable = imgData?.available;

            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                disabled={!isAvailable}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500'
                    : isAvailable
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{typeConfig.label}</span>
                <span className="sm:hidden">{typeConfig.shortLabel}</span>
                {!isAvailable && <span className="text-xs">(N/A)</span>}
              </button>
            );
          })}
        </div>

        {/* Main Image Display */}
        <div className="relative bg-gray-100 rounded-xl overflow-hidden" style={{ minHeight: '320px' }}>
          {/* Navigation Arrows */}
          <button
            onClick={() => navigateImagery('prev')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => navigateImagery('next')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Image Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedType}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full"
            >
              {currentImagery?.available && currentImagery.url ? (
                <>
                  {imageLoadStates[selectedType] !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  )}
                  <img
                    src={currentImagery.url}
                    alt={config.label}
                    className={`w-full h-auto transition-opacity duration-300 ${
                      imageLoadStates[selectedType] === 'loaded' ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(selectedType)}
                    onError={() => handleImageError(selectedType)}
                  />
                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setFullscreenImage(currentImagery.url!)}
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                  >
                    <Maximize2 className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <AlertCircle className="w-12 h-12 mb-3" />
                  <p className="font-medium">Imagery not available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {currentImagery?.error || 'No data for this location'}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Image Info Overlay */}
          {currentImagery?.available && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="font-semibold">{config.label}</p>
                  <p className="text-sm text-white/80">{config.description}</p>
                </div>
                {currentImagery.capture_date && (
                  <div className="text-right text-sm">
                    <p className="text-white/60">Captured</p>
                    <p className="font-medium">{currentImagery.capture_date}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend (if available) */}
        {currentImagery?.legend && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">Legend</p>
            {currentImagery.legend.classes ? (
              // Categorical legend (land cover)
              <div className="flex flex-wrap gap-2">
                {currentImagery.legend.classes.map((cls, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: cls.color }}
                    />
                    <span className="text-xs text-gray-600">{cls.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              // Gradient legend (NDVI, LST, forest cover)
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">
                  {currentImagery.legend.min?.label}
                </span>
                <div
                  className="flex-1 h-3 rounded"
                  style={{
                    background: `linear-gradient(to right, ${currentImagery.legend.min?.color}, ${currentImagery.legend.max?.color})`
                  }}
                />
                <span className="text-xs text-gray-600">
                  {currentImagery.legend.max?.label}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Technology Badge */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>Technology: {currentImagery?.source || 'Remote Sensing'}</span>
          <span>Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={fullscreenImage}
              alt={config.label}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg">
              <p className="text-white font-medium">{config.label}</p>
              <p className="text-white/70 text-sm">{config.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageryViewer;
