/**
 * InstituteLoginModal.tsx - Institute Login Modal
 *
 * Simple ID/password login for institutes to access their dashboard.
 * Uses Firestore for credential verification.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginInstitute } from "@/services/instituteAuth";

interface InstituteLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstituteLoginModal = ({ isOpen, onClose }: InstituteLoginModalProps) => {
  const navigate = useNavigate();
  const [instituteId, setInstituteId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const session = await loginInstitute({ id: instituteId, password });
      onClose();
      // Navigate to the institute dashboard
      navigate(`/institute/${session.instituteId}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInstituteId("");
    setPassword("");
    setError(null);
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
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#0D2821] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <h2 className="text-xl font-bold">Institute Login</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-6 text-center">
              Enter your institute credentials to access your dashboard
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Institute ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute ID
                </label>
                <input
                  type="text"
                  value={instituteId}
                  onChange={(e) => setInstituteId(e.target.value)}
                  placeholder="Enter your institute ID"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  required
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !instituteId || !password}
                className="w-full py-3 bg-[#0D2821] text-white rounded-full font-medium hover:bg-[#065f46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              Contact your administrator if you need credentials
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstituteLoginModal;
