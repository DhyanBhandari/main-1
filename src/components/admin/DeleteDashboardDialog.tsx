/**
 * DeleteDashboardDialog - Confirmation dialog for deleting dashboards
 */

import { useState } from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { deleteInstitute } from '@/services/adminApi';

interface DeleteDashboardDialogProps {
  isOpen: boolean;
  institute: any;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDashboardDialog({
  isOpen,
  institute,
  onClose,
  onConfirm,
}: DeleteDashboardDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!institute?.institute_id) return;

    setLoading(true);
    setError(null);

    try {
      await deleteInstitute(institute.institute_id);
      onConfirm(); // Refresh parent data
      onClose(); // Close dialog
    } catch (err: any) {
      setError(err.message || 'Failed to delete dashboard');
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

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    Delete Dashboard?
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete the dashboard for{' '}
                <strong className="text-gray-900">{institute?.name}</strong>?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  This will:
                </p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Remove the organization from the database</li>
                  <li>Invalidate all login credentials</li>
                  <li>Revoke dashboard access permanently</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Dashboard'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DeleteDashboardDialog;
