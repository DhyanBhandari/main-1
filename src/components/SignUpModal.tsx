/**
 * SignUpModal.tsx - User Registration Modal
 *
 * A two-step registration flow:
 * 1. Google Authentication (if not already signed in)
 * 2. User Details Form (name, email, phone, business type, organization, message)
 *
 * Features:
 * - Google Sign-in integration
 * - Pre-fills data from Google account
 * - Country code dropdown for phone numbers
 * - Business type dropdown with various organization types
 * - Form validation
 * - Submits data to Firestore
 *
 * @author ErthaLoka Dev Team
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { signInWithGoogle, getCurrentUser, onAuthChange, AuthUser } from "@/auth/authService";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/db/firestore";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Country codes for phone number
const countryCodes = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+61", country: "Australia" },
  { code: "+55", country: "Brazil" },
  { code: "+971", country: "UAE" },
  { code: "+65", country: "Singapore" },
  { code: "+82", country: "South Korea" },
  { code: "+31", country: "Netherlands" },
  { code: "+46", country: "Sweden" },
  { code: "+41", country: "Switzerland" },
  { code: "+34", country: "Spain" },
  { code: "+39", country: "Italy" },
  { code: "+7", country: "Russia" },
  { code: "+52", country: "Mexico" },
  { code: "+27", country: "South Africa" },
];

// Business types dropdown options
const businessTypes = [
  "Corporates",
  "Banks",
  "Financial Institutions",
  "FinTech",
  "NGO",
  "Non-Profit Organization",
  "Government Organization",
  "Educational Institution",
  "Research Institute",
  "Consulting Firm",
  "Investment Fund",
  "Insurance Company",
  "Real Estate",
  "Agriculture & Forestry",
  "Energy & Utilities",
  "Other",
];

interface FormData {
  name: string;
  email: string;
  alternateEmail: string;
  countryCode: string;
  phoneNumber: string;
  businessType: string;
  organizationName: string;
  message: string;
}

export const SignUpModal = ({ isOpen, onClose }: SignUpModalProps) => {
  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    alternateEmail: "",
    countryCode: "+91",
    phoneNumber: "",
    businessType: "",
    organizationName: "",
    message: "",
  });
  const [useAlternateEmail, setUseAlternateEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData((prev) => ({
        ...prev,
        name: currentUser.displayName || "",
        email: currentUser.email || "",
      }));
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || authUser.displayName || "",
          email: prev.email || authUser.email || "",
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitSuccess(false);
      setSubmitError(null);
      setAuthError(null);

      // Pre-fill from current user if authenticated
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData((prev) => ({
          ...prev,
          name: currentUser.displayName || "",
          email: currentUser.email || "",
        }));
      }
    }
  }, [isOpen]);

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const authUser = await signInWithGoogle();
      setUser(authUser);
      setFormData((prev) => ({
        ...prev,
        name: authUser.displayName || "",
        email: authUser.email || "",
      }));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.phoneNumber || !formData.businessType || !formData.organizationName) {
        throw new Error("Please fill in all required fields");
      }

      // Validate message minimum length
      if (formData.message.length < 20) {
        throw new Error("Description/Message must be at least 20 characters");
      }

      // Prepare submission data
      const submissionData = {
        uid: user?.uid,
        name: formData.name,
        email: useAlternateEmail ? formData.alternateEmail : formData.email,
        googleEmail: formData.email,
        countryCode: formData.countryCode,
        phoneNumber: formData.phoneNumber,
        fullPhone: `${formData.countryCode}${formData.phoneNumber}`,
        businessType: formData.businessType,
        organizationName: formData.organizationName,
        message: formData.message,
        createdAt: serverTimestamp(),
        source: "website_signup",
      };

      // Save to Firestore
      await addDoc(collection(db, "signups"), submissionData);

      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal and reset
  const handleClose = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
    setAuthError(null);
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
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0D2821] text-white px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold">Sign Up</h2>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Thank you for signing up. We will contact you shortly.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-[#0D2821] text-white rounded-full hover:bg-[#065f46] transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : !user ? (
              /* Step 1: Google Authentication */
              <div className="text-center py-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Welcome to ErthaLoka
                </h3>
                <p className="text-gray-600 mb-8">
                  Sign in with Google to continue registration
                </p>

                {authError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{authError}</span>
                  </div>
                )}

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
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
                      <span className="font-medium text-gray-700">
                        Sign in with Google
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Step 2: User Details Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{submitError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setUseAlternateEmail(!useAlternateEmail)}
                    className="mt-1 text-sm text-green-600 hover:text-green-700"
                  >
                    {useAlternateEmail ? "Use Google email" : "Use different email"}
                  </button>
                </div>

                {/* Alternate Email */}
                {useAlternateEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="alternateEmail"
                      value={formData.alternateEmail}
                      onChange={handleInputChange}
                      placeholder="Enter alternate email"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      required={useAlternateEmail}
                    />
                  </div>
                )}

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

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    required
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

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
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description / Message <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">(min 20 characters)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your interest or requirements..."
                    rows={3}
                    minLength={20}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/20 characters
                  </p>
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
                    "Complete Registration"
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignUpModal;
