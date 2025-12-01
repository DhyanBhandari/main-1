import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, MapPin, Mail, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkAPIHealth } from "@/services/phiApi";
import { useAuth } from "@/auth";

interface PHIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PHIModal = ({ isOpen, onClose }: PHIModalProps) => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(!user);

  // Update auth state when user changes
  useEffect(() => {
    setShowAuth(!user);
  }, [user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {/* Conditional Content */}
              <div className="p-4 sm:p-6 md:p-8">
                {showAuth ? (
                  <AuthFormContent onAuthSuccess={() => setShowAuth(false)} />
                ) : (
                  <PHIReportFormContent onClose={onClose} />
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Auth Form Component
interface AuthFormContentProps {
  onAuthSuccess: () => void;
}

const AuthFormContent = ({ onAuthSuccess }: AuthFormContentProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, googleSignIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName || undefined);
      } else {
        await signIn(email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await googleSignIn();
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#0d2821] mb-2">
        {isSignUp ? "Create Account" : "Sign In"}
      </h2>
      <p className="text-gray-600 mb-6">
        {isSignUp
          ? "Sign up to access PHI Reports"
          : "Sign in to get your PHI Report"}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2821] focus:border-transparent outline-none transition-all disabled:bg-gray-100"
              placeholder="Your name"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2821] focus:border-transparent outline-none transition-all disabled:bg-gray-100"
              placeholder="your@email.com"
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2821] focus:border-transparent outline-none transition-all disabled:bg-gray-100"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {isSignUp && (
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#0d2821] text-white rounded-lg font-semibold hover:bg-[#065f46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isSignUp ? "Creating Account..." : "Signing In..."}
            </>
          ) : isSignUp ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Sign in with Google
      </button>

      <p className="text-center text-sm text-gray-600 mt-6">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className="text-[#0d2821] font-semibold hover:underline"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
};

// PHI Report Form Component
interface PHIReportFormContentProps {
  onClose: () => void;
}

const PHIReportFormContent = ({ onClose }: PHIReportFormContentProps) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFetchLocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to fetch location. Please enter manually.");
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  };

  const validateCoordinates = (): boolean => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90");
      return false;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError("Longitude must be between -180 and 180");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateCoordinates()) return;

    setIsSubmitting(true);

    try {
      // Optional: Check API health before navigating
      await checkAPIHealth();

      // Navigate to report page with location data
      navigate("/getthereport", {
        state: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      });
      onClose();
    } catch (err) {
      // Still navigate even if health check fails - let the report page handle errors
      navigate("/getthereport", {
        state: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      });
      onClose();
    }
  };

  return (
    <div>
      {/* User greeting */}
      {user && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Welcome, <span className="font-semibold">{user.displayName || user.email}</span>
          </p>
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl font-bold text-[#0d2821] mb-2">
        Get Your PHI Report
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your location coordinates to analyze satellite data
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Latitude
          </label>
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2821] focus:border-transparent outline-none transition-all disabled:bg-gray-100"
            placeholder="e.g., 40.7128"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitude
          </label>
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2821] focus:border-transparent outline-none transition-all disabled:bg-gray-100"
            placeholder="e.g., -74.0060"
          />
        </div>

        <button
          type="button"
          onClick={handleFetchLocation}
          disabled={isLoading || isSubmitting}
          className="w-full py-3 border-2 border-[#0d2821] text-[#0d2821] rounded-lg font-semibold hover:bg-[#0d2821] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching Location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Fetch My Location
            </>
          )}
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !latitude || !longitude}
          className="w-full py-3 bg-[#0d2821] text-white rounded-lg font-semibold hover:bg-[#065f46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing Report...
            </>
          ) : (
            "Get the Report"
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          The analysis will query satellite data and may take 25-35 seconds
        </p>
      </form>
    </div>
  );
};
