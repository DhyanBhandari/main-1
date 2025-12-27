/**
 * ApproveRequestModal - Multi-step approval workflow
 *
 * Steps:
 * 1. Review request details
 * 2. Select polygon using PolygonLandSelector
 * 3. Show generated credentials
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import PolygonLandSelector from '@/components/PolygonLandSelector';
import CredentialsDisplay from './CredentialsDisplay';
import { approveRequest } from '@/services/adminApi';
import type { AccessRequest, GeneratedCredentials, PolygonPoint } from '@/types/admin';

interface ApproveRequestModalProps {
  isOpen: boolean;
  request: AccessRequest | null;
  adminEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'review' | 'polygon' | 'credentials';

export function ApproveRequestModal({
  isOpen,
  request,
  adminEmail,
  onClose,
  onSuccess,
}: ApproveRequestModalProps) {
  const [step, setStep] = useState<Step>('review');
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handlePolygonComplete = async (points: PolygonPoint[]) => {
    setPolygonPoints(points);
    setLoading(true);
    setError(null);

    try {
      if (!request) throw new Error('No request selected');

      const creds = await approveRequest(Number(request.id), points, adminEmail);
      setCredentials(creds);
      setStep('credentials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    // In a real implementation, this would call a backend API or Firebase Function
    // For now, we'll simulate it
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEmailSent(true);
    setSendingEmail(false);
  };

  const handleClose = () => {
    // Reset state
    setStep('review');
    setPolygonPoints([]);
    setCredentials(null);
    setError(null);
    setEmailSent(false);

    if (credentials) {
      onSuccess();
    }
    onClose();
  };

  if (!isOpen || !request) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0D2821] text-white px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Approve Request</h2>
                <p className="text-sm opacity-70">{request.organizationName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-center gap-4">
              {['Review', 'Set Polygon', 'Credentials'].map((label, idx) => {
                const stepMap: Step[] = ['review', 'polygon', 'credentials'];
                const currentIdx = stepMap.indexOf(step);
                const isActive = idx === currentIdx;
                const isComplete = idx < currentIdx;

                return (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-[#0D2821] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isComplete ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </span>
                    {idx < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            {/* Step 1: Review */}
            {step === 'review' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Organization Name
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {request.organizationName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Organization Type
                    </label>
                    <div className="text-lg text-gray-900">{request.organizationType}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <div className="text-gray-900">{request.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </label>
                    <div className="text-gray-900">{request.fullPhone}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Message
                  </label>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">{request.message}</div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep('polygon')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0D2821] text-white rounded-lg hover:bg-[#065f46] transition-colors"
                  >
                    Continue to Polygon Selection
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Polygon Selection */}
            {step === 'polygon' && (
              <div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-[#0D2821] animate-spin mb-4" />
                    <p className="text-gray-600">Creating organization account...</p>
                  </div>
                ) : (
                  <div className="min-h-[500px]">
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      Select the 4-corner polygon for this organization's land parcel
                    </div>
                    <PolygonLandSelector
                      onComplete={handlePolygonComplete}
                      onBack={() => setStep('review')}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Credentials */}
            {step === 'credentials' && credentials && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Organization Approved!</h3>
                  <p className="text-gray-600">
                    Share these credentials with {request.organizationName}
                  </p>
                </div>

                <CredentialsDisplay
                  credentials={credentials}
                  email={request.email}
                  onSendEmail={handleSendEmail}
                  sendingEmail={sendingEmail}
                />

                {emailSent && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                    Email sent successfully to {request.email}
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ApproveRequestModal;
