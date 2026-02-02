/**
 * VideoPage.tsx - Dashboard Video Display Page
 *
 * Displays the dashboard demo video after user completes sign-up
 * Features:
 * - Full-screen video display
 * - Video plays once and stops (no loop)
 * - "Back to Home" button to return to landing page
 *
 * @author ErthaLoka Dev Team
 */

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const VideoPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 relative">
      {/* Back to Home Button - Top Left */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={handleBackToHome}
        className="absolute top-6 left-6 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full font-medium transition-all duration-300 hover:scale-105 border border-white/20"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </motion.button>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Welcome to ErthaLoka Dashboard
          </h1>
          <p className="text-lg text-gray-300">
            Explore how we monitor and measure planetary health
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          <video
            className="w-full h-auto"
            controls
            controlsList="nodownload"
            preload="metadata"
            style={{ maxHeight: '80vh' }}
          >
            <source src="/dashboard--1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-8"
        >
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0D2821] to-[#065f46] text-white rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Return to Homepage
          </button>
        </motion.div>
      </motion.div>

      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default VideoPage;
