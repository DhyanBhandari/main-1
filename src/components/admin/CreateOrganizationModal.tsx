/**
 * CreateOrganizationModal - Create organization directly (without signup request)
 *
 * Steps:
 * 1. Enter organization details
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
  MapPin,
  Loader2,
  CheckCircle,
  Plus,
} from 'lucide-react';
import PolygonLandSelector from '@/components/PolygonLandSelector';
import CredentialsDisplay from './CredentialsDisplay';
import { createInstituteDirect } from '@/services/adminApi';
import type { GeneratedCredentials, PolygonPoint } from '@/types/admin';

// Organization types (same as OrganizationSignupModal)
const organizationTypes = [
  'Corporates',
  'Banks',
  'Financial Institutions',
  'FinTech',
  'NGO',
  'Non-Profit Organization',
  'Government Organization',
  'Educational Institution',
  'Research Institute',
  'Consulting Firm',
  'Investment Fund',
  'Insurance Company',
  'Real Estate',
  'Agriculture & Forestry',
  'Energy & Utilities',
  'Other',
];

// Country codes for phone number
const countryCodes = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+61', country: 'Australia' },
  { code: '+55', country: 'Brazil' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+82', country: 'South Korea' },
  { code: '+31', country: 'Netherlands' },
  { code: '+46', country: 'Sweden' },
  { code: '+41', country: 'Switzerland' },
  { code: '+34', country: 'Spain' },
  { code: '+39', country: 'Italy' },
  { code: '+7', country: 'Russia' },
  { code: '+52', country: 'Mexico' },
  { code: '+27', country: 'South Africa' },
];

interface CreateOrganizationModalProps {
  isOpen: boolean;
  adminEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'form' | 'polygon' | 'credentials';

interface FormData {
  organizationName: string;
  organizationType: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
}

export function CreateOrganizationModal({
  isOpen,
  adminEmail,
  onClose,
  onSuccess,
}: CreateOrganizationModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    organizationType: '',
    email: '',
    countryCode: '+91',
    phoneNumber: '',
  });
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.organizationName.trim()) {
      setError('Organization name is required');
      return false;
    }
    if (!formData.organizationType) {
      setError('Organization type is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleContinueToPolygon = () => {
    setError(null);
    if (validateForm()) {
      setStep('polygon');
    }
  };

  const handlePolygonComplete = async (points: PolygonPoint[]) => {
    setLoading(true);
    setError(null);

    try {
      const creds = await createInstituteDirect(
        {
          organizationName: formData.organizationName,
          organizationType: formData.organizationType,
          email: formData.email,
          countryCode: formData.countryCode,
          phoneNumber: formData.phoneNumber,
          polygonPoints: points,
        },
        adminEmail
      );
      setCredentials(creds);
      setStep('credentials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEmailSent(true);
    setSendingEmail(false);
  };

  const handleClose = () => {
    // Reset state
    setStep('form');
    setFormData({
      organizationName: '',
      organizationType: '',
      email: '',
      countryCode: '+91',
      phoneNumber: '',
    });
    setCredentials(null);
    setError(null);
    setEmailSent(false);

    if (credentials) {
      onSuccess();
    }
    onClose();
  };

  if (!isOpen) return null;

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
              <Plus className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Create New Organization</h2>
                <p className="text-sm opacity-70">Direct dashboard creation</p>
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
              {['Organization Info', 'Set Polygon', 'Credentials'].map((label, idx) => {
                const stepMap: Step[] = ['form', 'polygon', 'credentials'];
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

            {/* Step 1: Organization Form */}
            {step === 'form' && (
              <div className="space-y-6 max-w-lg mx-auto">
                <p className="text-gray-600 text-center mb-6">
                  Enter the organization details to create a new dashboard account.
                </p>

                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="Enter organization name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                {/* Organization Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  >
                    <option value="">Select organization type</option>
                    {organizationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@organization.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="w-32 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    >
                      {countryCodes.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                          {cc.code} ({cc.country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleContinueToPolygon}
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
                      onBack={() => setStep('form')}
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
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Organization Created!</h3>
                  <p className="text-gray-600">
                    Share these credentials with {formData.organizationName}
                  </p>
                </div>

                <CredentialsDisplay
                  credentials={credentials}
                  email={formData.email}
                  onSendEmail={handleSendEmail}
                  sendingEmail={sendingEmail}
                />

                {emailSent && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                    Email sent successfully to {formData.email}
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

export default CreateOrganizationModal;
