/**
 * SinglePage.tsx - Main Single Page Website Component
 *
 * This is the primary landing page for ErthaLoka's single-page website.
 * All navigation uses anchor links (#section-id) instead of route changes.
 *
 * STRUCTURE:
 * 1. Hero Section - Main headline with globe animation
 * 2. Technology Section (#technology) - Assessment, Score, Report cards
 * 3. Live Monitoring Section - Real-time sensor dashboard
 * 4. CTA Section - "Get your Natural Capital Value" button
 * 5. Solutions Section (#solutions) - Corporates, Banks, Investors cards
 * 6. EPA Collectives Section (#epa-collectives) - NaturalCapitalSection component
 * 7. About Section (#about) - Mission and Impact Flywheel
 * 8. Partners Section - Infinite scroll partners
 * 9. Footer - Contact and links
 *
 * BACKGROUND:
 * Uses DottedGlowBackground fixed behind all content for consistent
 * zinc dots shining effect throughout the page.
 *
 * USAGE:
 * This component is rendered at the "/" route in App.tsx
 * The old HomePage is still available if needed.
 *
 * @author ErthaLoka Dev Team
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import { ClipboardCheck, BarChart3, FileText, Download, Building2, Landmark, TrendingUp } from "lucide-react";

// Layout Components
import SinglePageHeader from "@/components/SinglePageHeader";
import Footer from "@/components/Footer";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

// Feature Components
import Globe from "@/components/Globe";
import { PHIModal } from "@/components/PHIModal";
import { SignUpModal } from "@/components/SignUpModal";
import NaturalCapitalSection from "@/components/NaturalCapitalSection";
import { InfiniteScrollPartners } from "@/components/InfiniteScrollPartners";
import SensorMetrics from "@/pages/Datanomics/SensorMetrics";

// Assets
import planetImg from "@/assets/planet-impact.jpg";
import remoteSensingImg from "@/assets/new/n/remote-sensing.avif";
import scoringImg from "@/assets/new/n/score-.jpeg";
import reportImg from "@/assets/new/n/re.jpg";
import corporatesImg from "@/assets/new/corporates--2.jpg";
import banksImg from "@/assets/new/bank--1.jpg";
import investorImg from "@/assets/new/invest--1.jpg";
import groupPhotoImg from "@/assets/new/Group-Photo.jpg";

// Team Member Images
import ramachandranImg from "@/assets/new/Ramachandran.png";
import vivekaImg from "@/assets/new/viveka.png";
import pravinImg from "@/assets/new/Pravin-kumar.png";
import rajarajanImg from "@/assets/new/Rajarajan.png";
import arunImg from "@/assets/new/Arun-prakash.png";

/**
 * Technology Section Cards Data
 * Each card represents a core capability of the Planetary Performance System
 * Images are from src/assets/new folder
 */
const technologyCards = [
  {
    icon: ClipboardCheck,
    title: "Assessment",
    description: "Baseline and periodic planetary performance assessments using the ABCDE framework.",
    image: remoteSensingImg,
  },
  {
    icon: BarChart3,
    title: "Score",
    description: "Planetary Performance Score (AAA-CCC) translating nature performance into a credit-style signal.",
    image: scoringImg,
  },
  {
    icon: FileText,
    title: "Report",
    description: "UN-SEEA aligned reports usable for ESG, TNFD, and ISSB disclosures.",
    image: reportImg,
  },
];

/**
 * Solutions Section Cards Data
 * Tailored solutions for different institutional audiences
 * Images are from src/assets/new folder
 */
const solutionsCards = [
  {
    icon: Building2,
    title: "Corporates",
    description: "Identify nature-related risks, strengthen supply chains, and move ESG from reporting to decision-making.",
    image: corporatesImg,
  },
  {
    icon: Landmark,
    title: "Banks & Financial Institutions",
    description: "Integrate nature into credit risk, portfolio screening, and nature-linked finance.",
    image: banksImg,
  },
  {
    icon: TrendingUp,
    title: "Investors",
    description: "Enable due diligence, benchmarking, and preparation of nature-backed assets.",
    image: investorImg,
  },
];

/**
 * Team Members Data
 * Advisory Board, Mentors & Team
 * Row 1: CEO, Viveka, Impact Officer (3 cards)
 * Row 2: Rajarajan, Arun (2 cards centered)
 */
const teamMembersRow1 = [
  {
    name: "Ramachandran KP",
    role: "Founder @ ErthaLoka",
    image: ramachandranImg,
    details: [
      "Founder - Travellers Tribe & Learning Expedition",
      "Co-Founder @ Dream Holidays",
      "TOP 400 Ideas (2016) - IIMA",
      "TOP 50 Ideas (2016) - IIMC",
      "Pre-Incubated (2018) @ IIMB - NSRCEL",
      "Ex-Accenture, Tesco & C-Cubed Solutions",
    ],
  },
  {
    name: "Dr. Viveka Kalidasan, Ph.D",
    role: "Mentor/Advisor",
    image: vivekaImg,
    details: [
      "Founder-CEO | River Venture Studio Global",
      "Thought Leader In Industry 5.0/4.0",
      "Deeptech Venture Builder AI/ML",
      "MIT 35 Innovators Under 35",
      "SG Top 100 Women in Tech",
      "NUS Outstanding Young Alumni | DEI in Deeptech",
    ],
  },
  {
    name: "Pravin Kumar",
    role: "Impact Officer @ ErthaLoka",
    image: pravinImg,
    details: [
      "MSW (Gold Medalist)",
      "Founder at Green Shadows & Annapradokshana Charitable Trust",
      "Recipient of the Changemaker Award from TYCL",
      "50000 native trees planted and 12 urban forest projects created in Pondicherry and Tamilnadu",
    ],
  },
];

const teamMembersRow2 = [
  {
    name: "Rajarajan Rathinavelu",
    role: "Advisor",
    image: rajarajanImg,
    details: [
      "Founder & MD",
      "Keyleer Automation Solutions UG | Member of Board of Directors - Young Seed Educational Trust",
      "Europa-Universität Flensburg: Doctor of Philosophy (Ph.D) - Energy Planning",
      "Hochschule Flensburg: Masters - Wind Energy Engineering",
    ],
  },
  {
    name: "Arun Prakash Ambathy",
    role: "Advisor",
    image: arunImg,
    details: [
      "Resource Person: Auroville Forest Group & Auroville Centre for Scientific Research",
      "Special Forces Veteran - Indian Army",
      "Founder @ Ambathy Nature Research Foundation",
      "Spear Heading projects Ecological Planning & Assessments",
    ],
  },
];

/**
 * Main SinglePage Component
 * Renders the complete single-page website with all sections
 */
const SinglePage = () => {
  // Scroll progress for Globe animation
  const { scrollYProgress } = useScroll();
  const location = useLocation();

  // Handle hash navigation from other pages
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  // PHI Modal state for CTA buttons
  const [isModalOpen, setIsModalOpen] = useState(false);

  // SignUp Modal state
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-green-100 selection:text-green-900 font-sans">

      {/* ============================================
          FIXED BACKGROUND - Dotted Glow Effect
          This creates the consistent zinc dots shining
          effect throughout the entire page
          ============================================ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DottedGlowBackground
          className="absolute inset-0 w-full h-full"
          gap={15}
          radius={2}
          color="#a1a1aa"      // zinc-400 dots
          glowColor="#021a10ff" // Dark green glow
          opacity={0.2}
          speedMin={0.3}
          speedMax={1.6}
          speedScale={1}
        />
      </div>

      {/* ============================================
          MAIN CONTENT WRAPPER
          All content sits above the fixed background
          ============================================ */}
      <div className="relative z-10">

        {/* Navigation Header - Anchor-based navigation */}
        <SinglePageHeader />

        {/* ==========================================
            SECTION 1: HERO
            Desktop: Text left, Globe right (two columns)
            Mobile: Globe background with text overlay
            ========================================== */}
        <section className="relative h-auto min-h-[100vh] pb-8 pt-32 lg:pt-40 w-full overflow-hidden flex items-center justify-center">

          {/* Mobile Only: Globe as Background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
          >
            <div
              className="opacity-40"
              style={{
                width: '90vh',
                height: '90vh',
                minWidth: '350px',
                minHeight: '350px'
              }}
            >
              <Globe className="w-full h-full" scrollYProgress={scrollYProgress} />
            </div>
          </motion.div>

          {/* Desktop: Two Column Layout | Mobile: Text Overlay */}
          <div className="container relative z-20 px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Text Content - Left on desktop, centered overlay on mobile */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter text-gray-900 mb-4 md:mb-6 leading-[1.1]"
                >
                  Planetary Performance System for{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D2821] to-[#065f46]">
                    Institutions
                  </span>
                </motion.h1>

                {/* Sub-title - Bold, same color as heading */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 font-bold mb-4 md:mb-6"
                >
                  Measuring, managing, and pricing planetary performance - so preservation becomes profitable.
                </motion.p>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-sm sm:text-base md:text-lg text-[#0D2821] font-semibold mb-6 md:mb-8"
                >
                  Verified by Science. Secured by Data. Trusted by Design.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="h-12 md:h-14 px-8 md:px-10 rounded-full bg-[#0D2821] hover:bg-[#065f46] text-white shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-base md:text-lg font-medium"
                  >
                    Get your Natural Capital Value
                  </button>
                </motion.div>
              </div>

              {/* Desktop Only: Globe on Right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="hidden lg:flex items-center justify-center"
              >
                <div className="w-[500px] h-[500px] xl:w-[600px] xl:h-[600px]">
                  <Globe className="w-full h-full" scrollYProgress={scrollYProgress} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 2: TECHNOLOGY
            ID: #technology (for navbar anchor)
            3 cards: Assessment, Score, Report
            ========================================== */}
        <section id="technology" className="py-20 relative">

          <div className="container px-6 mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-6">
                Technology
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The Planetary Performance System (PPS) is ErthaLoka's core digital platform for measuring and monitoring natural capital performance.
              </p>
            </motion.div>

            {/* Technology Cards Grid - Portrait Cards (60% image, 40% text) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {technologyCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/50 hover:shadow-xl hover:border-green-200 transition-all duration-300 group flex flex-col"
                  style={{ aspectRatio: '3/4' }}
                >
                  {/* Card Image - 60% height */}
                  <div className="relative h-[60%] overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Card Content - 40% height with white background */}
                  <div className="h-[40%] p-6 bg-white flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{card.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 3: LIVE MONITORING
            Two-column layout: Left text, Right sensor data
            Below: Real-time trends graph
            Uses SensorMetrics component from Datanomics
            ========================================== */}
        <section className="py-10 relative">
          {/*
            SensorMetrics Component
            - Left: Text content and description
            - Right: Sensor cards (CO2, Temperature, Humidity, Pressure, Light)
            - Below: Real-time trends line chart
            Data sourced from EPA Project Sites via useSensorData hook
          */}
          <SensorMetrics />
        </section>

        {/* ==========================================
            SECTION 4: CTA - Natural Capital Value
            Primary call-to-action button
            Opens PHIModal for user interaction
            ========================================== */}
        <section className="py-20 relative">

          <div className="container px-6 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-[85%] md:w-[80%] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5 bg-[#0d2821] shadow-lg text-white rounded-full text-xl sm:text-2xl md:text-3xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center gap-2"
              >
                Get your Natural Capital Value
                <Download className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 font-bold animate-pulse" />
                <span className="text-sm font-normal opacity-80">In guidelines with UN-SEEA framework for environmental accounting</span>
              </button>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 5: SOLUTIONS
            ID: #solutions (for navbar anchor)
            3 cards: Corporates, Banks, Investors
            ========================================== */}
        <section id="solutions" className="py-20 relative">
          <div className="container px-6 mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-6">
                Solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tailored solutions for organizations ready to integrate nature into their strategy.
              </p>
            </motion.div>

            {/* Solutions Cards Grid - Portrait Cards (60% image, 40% text) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {solutionsCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/50 hover:shadow-xl hover:border-green-200 transition-all duration-300 group flex flex-col"
                  style={{ aspectRatio: '3/4' }}
                >
                  {/* Card Image - 60% height */}
                  <div className="relative h-[60%] overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Card Content - 40% height with white background */}
                  <div className="h-[40%] p-6 bg-white flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{card.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sign Up Now Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <button
                onClick={() => setIsSignUpModalOpen(true)}
                className="w-full sm:w-[70%] md:w-[60%] lg:w-[50%] mx-auto px-16 py-4 bg-[#0D2821] text-white rounded-full text-xl md:text-2xl font-bold hover:bg-[#065f46] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign Up Now
              </button>
            </motion.div>
          </div>
        </section>

        {/* ==========================================
            SECTION 6: EPA COLLECTIVES
            ID: #epa-collectives (for navbar anchor)
            Reuses existing NaturalCapitalSection component
            Shows: MEASURE, VERIFY, VALUE process
            ========================================== */}
        <section id="epa-collectives">
          <NaturalCapitalSection />
        </section>

        {/* ==========================================
            SECTION 7: ABOUT
            ID: #about (for navbar anchor)
            Company mission and Impact Flywheel
            ========================================== */}
        <section id="about" className="py-20 relative">

          <div className="container px-6 mx-auto relative z-10">

            {/* About Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-6">
                World's First Planetary Asset Preservation Company
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Where People, Planet & Purpose Thrive Together
              </p>
            </motion.div>

            {/* Mission Section - Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-12 items-stretch mb-20">

              {/* Team Photo - Portrait Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-4 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl h-full" style={{ minHeight: '500px' }}>
                  <img
                    src={groupPhotoImg}
                    alt="ErthaLoka Team"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </motion.div>

              {/* Mission Text */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6 flex flex-col justify-center"
              >
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-blue-500 rounded-full" />
                </div>

                <blockquote className="text-2xl font-light italic text-gray-700 border-l-4 border-green-600 pl-6 py-2">
                  "We make preservation more profitable than destruction."
                </blockquote>

                <p className="text-lg text-gray-600 leading-relaxed">
                  ErthaLoka is building the infrastructure to turn planetary health into the world's most valuable asset class. We're creating a future where protecting nature is not just the right thing to do - it's the most economically rational choice.
                </p>

                <p className="text-lg text-gray-600 leading-relaxed">
                  Our team combines expertise in environmental science, blockchain technology, and sustainable finance to create transparent, verifiable systems for measuring and valuing natural capital.
                </p>

                <p className="text-lg text-gray-600 leading-relaxed">
                  Together, we're pioneering a new economic paradigm where ecosystem health drives financial returns, empowering communities and institutions to invest in a thriving planet.
                </p>
              </motion.div>
            </div>

            {/* Advisory Board, Mentors & Team Section */}
            <div className="mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-4">Advisory Board, Mentors & Team</h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  The experts driving our planetary mission forward
                </p>
              </motion.div>

              {/* Team Grid - Row 1: 3 cards */}
              <div className="flex flex-wrap justify-evenly gap-y-4 mb-4">
                {teamMembersRow1.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-[#0D2821] rounded-xl overflow-hidden text-white w-[230px]"
                  >
                    {/* Image Section */}
                    <div className="h-[240px] bg-[#1a3d33] relative overflow-hidden">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0D2821] to-[#1a4a3d]">
                          <span className="text-5xl font-bold text-white/20">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text Section */}
                    <div className="p-3">
                      <h4 className="text-sm font-bold text-amber-400 mb-0.5">
                        {member.name}
                      </h4>
                      <p className="text-green-400 font-semibold text-[10px] mb-1.5">
                        {member.role}
                      </p>
                      <ul className="space-y-0.5">
                        {member.details.map((detail, idx) => (
                          <li key={idx} className="text-[9px] text-gray-300 leading-tight">
                            • {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Team Grid - Row 2: 2 cards centered */}
              <div className="flex flex-wrap justify-evenly gap-y-4 max-w-2xl mx-auto">
                {teamMembersRow2.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-[#0D2821] rounded-xl overflow-hidden text-white w-[230px]"
                  >
                    {/* Image Section */}
                    <div className="h-[240px] bg-[#1a3d33] relative overflow-hidden">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0D2821] to-[#1a4a3d]">
                          <span className="text-5xl font-bold text-white/20">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text Section */}
                    <div className="p-3">
                      <h4 className="text-sm font-bold text-amber-400 mb-0.5">
                        {member.name}
                      </h4>
                      <p className="text-green-400 font-semibold text-[10px] mb-1.5">
                        {member.role}
                      </p>
                      <ul className="space-y-0.5">
                        {member.details.map((detail, idx) => (
                          <li key={idx} className="text-[9px] text-gray-300 leading-tight">
                            • {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Impact Flywheel Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-4">The Impact Flywheel</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Planetary health and financial health become one continuous equation.
              </p>
            </motion.div>

            {/* Impact Flywheel Cards - Planet, People, Profit */}
            <div className="grid md:grid-cols-3 gap-8">

              {/* PLANET Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-t-4 border-t-emerald-500"
              >
                <h4 className="text-2xl font-bold mb-6 text-emerald-600">PLANET</h4>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">-</span>
                    <span><strong className="text-gray-900">Permanence:</strong> Legally binding protection of vital ecosystems, forever.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">-</span>
                    <span><strong className="text-gray-900">Active Stewardship:</strong> Perpetual trust fund pays for conservation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1">-</span>
                    <span><strong className="text-gray-900">Verifiable Health:</strong> Token value tied to measurable ecological gains.</span>
                  </li>
                </ul>
              </motion.div>

              {/* PEOPLE Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-t-4 border-t-blue-500"
              >
                <h4 className="text-2xl font-bold mb-6 text-blue-600">PEOPLE</h4>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">-</span>
                    <span><strong className="text-gray-900">Upfront Capital:</strong> Direct share of token proceeds empowers communities.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">-</span>
                    <span><strong className="text-gray-900">Long-Term Prosperity:</strong> Permanent, high-value jobs as stewards.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">-</span>
                    <span><strong className="text-gray-900">Community Governance:</strong> Token treasury gives locals an economic stake.</span>
                  </li>
                </ul>
              </motion.div>

              {/* PROFIT Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-t-4 border-t-amber-500"
              >
                <h4 className="text-2xl font-bold mb-6 text-amber-600">PROFIT</h4>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">-</span>
                    <span><strong className="text-gray-900">Aligned Incentives:</strong> Thriving planet as the most powerful financial asset.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">-</span>
                    <span><strong className="text-gray-900">Systemic Change:</strong> Building infrastructure for a CoExIStic economy.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">-</span>
                    <span><strong className="text-gray-900">New Benchmark:</strong> Market price for verifiable planetary health.</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 8: PARTNERS
            Infinite scroll partner logos carousel
            ========================================== */}
        <InfiniteScrollPartners />

        {/* ==========================================
            SECTION 9: FOOTER
            Contact link and navigation
            ========================================== */}
        <Footer />
      </div>

      {/* ============================================
          PHI MODAL
          Triggered by CTA buttons throughout the page
          Handles "Get your Natural Capital Asset Value" flow
          ============================================ */}
      <PHIModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* ============================================
          SIGNUP MODAL
          Triggered by "Sign Up NOW" button in Solutions section
          Handles user registration with Google auth
          ============================================ */}
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />
    </div>
  );
};

export default SinglePage;
