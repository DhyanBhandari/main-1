/**
 * DashboardPreviewModal - Preview dashboard for admin
 *
 * Shows the full dashboard that the organization sees
 */

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getDashboardPreview } from '@/services/adminApi';
import DashboardTemplate from '@/components/dashboard/DashboardTemplate';
import type { DashboardData } from '@/types/dashboard';

interface DashboardPreviewModalProps {
  isOpen: boolean;
  institute: any;
  onClose: () => void;
}

export function DashboardPreviewModal({
  isOpen,
  institute,
  onClose,
}: DashboardPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (isOpen && institute?.institute_id) {
      loadDashboardData();
    }
  }, [isOpen, institute?.institute_id]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardPreview(institute.institute_id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Dashboard Preview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {institute?.name || 'Organization Dashboard'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {loading && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard data...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center max-w-md p-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold mb-2">Failed to Load Dashboard</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                    <button
                      onClick={loadDashboardData}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && dashboardData && (
                <DashboardTemplate
                  data={dashboardData}
                  location={{
                    name: institute?.name || 'Organization',
                    description: institute?.organization_type || 'Organization Dashboard',
                    coordinates: institute?.polygon_coordinates || [],
                  }}
                  user={{
                    name: institute?.name || 'Organization',
                    role: 'institute',
                  }}
                  options={{
                    showHeader: false, // Hide duplicate header in modal
                    showRefresh: false,
                  }}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DashboardPreviewModal;
