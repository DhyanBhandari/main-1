/**
 * InstituteLoginPage.tsx - Institute Login Page
 *
 * A simple page that displays the institute login modal.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-new.png";
import { Building2, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { loginInstitute, getInstituteSession, clearPasswordChangeRequired } from "@/services/instituteAuth";
import PasswordChangeModal from "@/components/PasswordChangeModal";

const InstituteLoginPage = () => {
  const navigate = useNavigate();
  const [instituteId, setInstituteId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loggedInInstituteId, setLoggedInInstituteId] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const session = getInstituteSession();
    if (session) {
      // If requiresPasswordChange, show the modal
      if (session.requiresPasswordChange) {
        setLoggedInInstituteId(session.instituteId);
        setShowPasswordChange(true);
      } else {
        navigate(`/institute/${session.instituteId}/dashboard`);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const session = await loginInstitute({ id: instituteId, password });

      // Check if password change is required (first login)
      if (session.requiresPasswordChange) {
        setLoggedInInstituteId(session.instituteId);
        setShowPasswordChange(true);
      } else {
        navigate(`/institute/${session.instituteId}/dashboard`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeSuccess = async () => {
    if (loggedInInstituteId) {
      // Clear the requiresPasswordChange flag in session
      await clearPasswordChangeRequired(loggedInInstituteId);
      // Navigate to dashboard
      navigate(`/institute/${loggedInInstituteId}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DottedGlowBackground
          className="absolute inset-0 w-full h-full"
          gap={15}
          radius={2}
          color="#a1a1aa"
          glowColor="#021a10ff"
          opacity={0.15}
          speedMin={0.3}
          speedMax={1.6}
          speedScale={1}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="ErthaLoka" className="h-12 mx-auto mb-4" />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#0D2821] text-white px-6 py-5">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">Institute Login</h1>
                <p className="text-sm opacity-70">Access your PHI dashboard</p>
              </div>
            </div>
          </div>

          <div className="p-6">
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

            <p className="text-xs text-gray-500 text-center mt-6">
              Contact your administrator if you need credentials
            </p>

            {/* Back to home */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-green-700 hover:text-green-800 font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Password Change Modal - shown on first login */}
      <PasswordChangeModal
        isOpen={showPasswordChange}
        instituteId={loggedInInstituteId || ""}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
};

export default InstituteLoginPage;
