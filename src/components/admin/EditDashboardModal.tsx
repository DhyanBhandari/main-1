/**
 * EditDashboardModal - Edit organization details and credentials
 */

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Save, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { updateInstitute } from '@/services/adminApi';

interface EditDashboardModalProps {
  isOpen: boolean;
  institute: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDashboardModal({
  isOpen,
  institute,
  onClose,
  onSuccess,
}: EditDashboardModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ instituteId: string; password: string } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passwordMode, setPasswordMode] = useState<'none' | 'auto' | 'custom'>('none');
  const [customPassword, setCustomPassword] = useState('');

  useEffect(() => {
    if (isOpen && institute) {
      // Pre-fill form with current values
      setOrganizationName(institute.name || '');
      setOrganizationType(institute.organization_type || '');
      setEmail(institute.email || '');
      setCountryCode(institute.country_code || '');
      setPhoneNumber(institute.phone_number || institute.phone || '');
      setPasswordMode('none');
      setCustomPassword('');
      setError(null);
      setSuccess(false);
      setNewCredentials(null);

      // Reset scroll position to top
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [isOpen, institute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setNewCredentials(null);

    try {
      const updates: any = {};

      // Only include changed fields
      if (organizationName !== institute.name) updates.organizationName = organizationName;
      if (organizationType !== institute.organization_type) updates.organizationType = organizationType;
      if (email !== institute.email) updates.email = email;
      if (countryCode !== institute.country_code) updates.countryCode = countryCode;
      if (phoneNumber !== (institute.phone_number || institute.phone)) updates.phoneNumber = phoneNumber;

      // Handle password
      if (passwordMode === 'auto') {
        updates.newPassword = 'auto';
      } else if (passwordMode === 'custom' && customPassword) {
        updates.newPassword = customPassword;
      }

      const credentials = await updateInstitute(institute.institute_id, updates);

      setSuccess(true);
      if (credentials) {
        setNewCredentials(credentials);
      }

      onSuccess(); // Refresh parent data

      // Auto-close after 2 seconds if no password change, otherwise keep open to show credentials
      if (!credentials) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update institute');
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-xl shadow-2xl z-50 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Dashboard
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update organization details and credentials
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div ref={contentRef} className="flex-1 overflow-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Organization Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Type
                    </label>
                    <select
                      value={organizationType}
                      onChange={(e) => setOrganizationType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="NGO">NGO</option>
                      <option value="Government">Government</option>
                      <option value="Academic">Academic</option>
                      <option value="Private">Private</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country Code
                      </label>
                      <input
                        type="text"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        placeholder="+1"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Reset */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Password Management
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="passwordMode"
                        value="none"
                        checked={passwordMode === 'none'}
                        onChange={() => setPasswordMode('none')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Keep Current Password</p>
                        <p className="text-sm text-gray-500">Don't change the password</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="passwordMode"
                        value="auto"
                        checked={passwordMode === 'auto'}
                        onChange={() => setPasswordMode('auto')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Auto-Generate New Password</p>
                        <p className="text-sm text-gray-500">System will create a secure random password</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="passwordMode"
                        value="custom"
                        checked={passwordMode === 'custom'}
                        onChange={() => setPasswordMode('custom')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Set Custom Password</p>
                        <p className="text-sm text-gray-500 mb-2">Enter a specific password</p>
                        {passwordMode === 'custom' && (
                          <input
                            type="text"
                            value={customPassword}
                            onChange={(e) => setCustomPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            required={passwordMode === 'custom'}
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">Institute Updated Successfully!</p>
                        {newCredentials && (
                          <div className="mt-3 p-3 bg-white rounded border border-green-200">
                            <p className="text-sm font-medium text-gray-900 mb-2">New Password Generated:</p>
                            <p className="text-lg font-mono font-bold text-blue-600">{newCredentials.password}</p>
                            <p className="text-xs text-gray-500 mt-2">Make sure to save this password - it won't be shown again!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Update Failed</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {success && !newCredentials ? 'Close' : 'Cancel'}
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || success}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EditDashboardModal;
