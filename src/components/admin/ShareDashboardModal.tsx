/**
 * ShareDashboardModal - Share dashboard credentials with organization
 *
 * Displays credentials and provides copy/email functionality
 */

import { useState } from 'react';
import { X, Copy, Mail, Eye, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { sendCredentialsEmail } from '@/services/adminApi';

interface ShareDashboardModalProps {
  isOpen: boolean;
  institute: any;
  onClose: () => void;
}

export function ShareDashboardModal({
  isOpen,
  institute,
  onClose,
}: ShareDashboardModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const loginUrl = `${window.location.origin}/institute/login`;
  const dashboardUrl = `${window.location.origin}/institute/${institute?.institute_id}/dashboard`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSendEmail = async () => {
    if (!institute?.email || !institute?.name || !institute?.institute_id) {
      setEmailError('Missing required information to send email');
      return;
    }

    setEmailSending(true);
    setEmailError(null);
    setEmailSent(false);

    try {
      // Note: Password should be retrieved from backend or passed securely
      // For now, we'll show a warning that password can't be emailed without it
      await sendCredentialsEmail(
        institute.email,
        institute.name,
        institute.institute_id,
        '[Password not available - please reset via Edit]', // Password placeholder
        loginUrl
      );
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to send email');
    } finally {
      setEmailSending(false);
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Dashboard Access Credentials
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  For {institute?.name}
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
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Login URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Login Page URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={loginUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(loginUrl, 'url')}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    {copied === 'url' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Institute ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Institute ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={institute?.institute_id || ''}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono font-bold"
                  />
                  <button
                    onClick={() => copyToClipboard(institute?.institute_id || '', 'id')}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    title="Copy Institute ID"
                  >
                    {copied === 'id' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Password is not shown here for security reasons.
                  If the organization needs a new password, use the "Edit" option to reset it.
                </p>
              </div>

              {/* Email Status Messages */}
              {emailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Email Sent Successfully!</p>
                      <p className="text-sm text-green-700 mt-1">
                        Credentials have been sent to {institute?.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {emailError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Failed to Send Email</p>
                      <p className="text-sm text-red-700 mt-1">{emailError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Dashboard Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Direct Dashboard URL (requires login)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dashboardUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(dashboardUrl, 'dashboard')}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    title="Copy Dashboard URL"
                  >
                    {copied === 'dashboard' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleSendEmail}
                  disabled={emailSending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Credentials Email
                    </>
                  )}
                </button>
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  <Eye className="w-5 h-5" />
                  Open Dashboard
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ShareDashboardModal;
