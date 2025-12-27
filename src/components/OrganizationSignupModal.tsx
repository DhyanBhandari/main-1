/**
 * OrganizationSignupModal - Public signup form for dashboard access
 *
 * Organizations request access to their own PHI dashboard.
 * After submission, request goes to admin for approval.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { submitAccessRequest } from '@/services/adminApi';
import type { AccessRequestFormData } from '@/types/admin';

interface OrganizationSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

// Organization types dropdown options
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

export const OrganizationSignupModal = ({ isOpen, onClose }: OrganizationSignupModalProps) => {
  const [formData, setFormData] = useState<AccessRequestFormData>({
    organizationName: '',
    organizationType: '',
    email: '',
    countryCode: '+91',
    phoneNumber: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (
        !formData.organizationName ||
        !formData.organizationType ||
        !formData.email ||
        !formData.phoneNumber
      ) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate message minimum length
      if (formData.message.length < 20) {
        throw new Error('Please provide more details about your request (minimum 20 characters)');
      }

      // Submit request
      await submitAccessRequest(formData);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form on close
    if (submitSuccess) {
      setFormData({
        organizationName: '',
        organizationType: '',
        email: '',
        countryCode: '+91',
        phoneNumber: '',
        message: '',
      });
      setSubmitSuccess(false);
    }
    setSubmitError(null);
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
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0D2821] text-white px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <h2 className="text-xl font-bold">Request Dashboard Access</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Success State */}
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-gray-600 mb-2">Your access request is pending approval.</p>
                <p className="text-sm text-gray-500 mb-6">
                  Our team will review your request and send login credentials to your email once
                  approved.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-[#0D2821] text-white rounded-full hover:bg-[#065f46] transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Fill out this form to request access to your organization's Natural Capital
                  Value dashboard.
                </p>

                {submitError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{submitError}</span>
                  </div>
                )}

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
                    placeholder="Enter your organization name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
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
                    required
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
                    required
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
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tell us about your land/project <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">(min 20 characters)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe the land parcel or project you want to monitor..."
                    rows={3}
                    minLength={20}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.message.length}/20 characters</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#0D2821] text-white rounded-full font-medium hover:bg-[#065f46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  After approval, you will receive login credentials via email.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrganizationSignupModal;
