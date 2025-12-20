import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Database, ShieldCheck, TrendingUp, Play, Sprout, Building2, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Globe from "@/components/Globe";
import measureImg from "@/assets/measure-3d.png";
import verifyImg from "@/assets/verify-3d.png";
import valueImg from "@/assets/value-3d.png";
import connectImg from "@/assets/connect-3d.png";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

import { TechCard } from "@/components/ui/tech-card";
import Featured_05 from "@/components/globe-feature-section";
import NaturalCapitalSection from "@/components/NaturalCapitalSection";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

import { PartnersCarousel } from "@/components/PartnersCarousel";
import { InfiniteScrollPartners } from "@/components/InfiniteScrollPartners";
import ImpactTicker from "@/components/ImpactTicker";
import AudienceCard from "@/components/AudienceCard";

const HomePage = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-green-100 selection:text-green-900 font-sans">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DottedGlowBackground
          className="absolute inset-0 w-full h-full"
          gap={15}
          radius={2}
          color="#a1a1aa"
          glowColor="#021a10ff"
          opacity={0.2}
          speedMin={0.3}
          speedMax={1.6}
          speedScale={1}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <div className="relative h-auto min-h-[100vh] pb-8 pt-32 lg:pt-40 w-full overflow-hidden flex items-center justify-center">
          <div className="container relative z-10 px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">


                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-xxl font-bold tracking-tighter text-gray-900 mb-8 leading-[0.95]"
                >
                  The Operating System for the{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D2821] to-[#065f46]">
                  Natural Economy
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg sm:text-xl md:text-2xl text-black max-w-xl mx-auto lg:mx-0 mb-12 font-light leading-relaxed font-sans"
                >
                  Where Preservation is More Profitable Than Destruction. Building the infrastructure for the next economy.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
                >
                  <Button asChild size="lg" className="h-14 px-10 rounded-full bg-[#0D2821] hover:bg-[#065f46] text-white shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-lg font-medium">
                    <Link to="/landowners">For Landowners</Link>
                  </Button>
                  <Button asChild size="lg" className="h-14 px-10 rounded-full bg-transparent border-2 border-[#0D2821] text-[#0D2821] hover:bg-[#0D2821] hover:text-white shadow-none hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-lg font-medium">
                    <Link to="/corporates-investors">For Buyers</Link>
                  </Button>
                </motion.div>
              </div>

              {/* Globe */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center"
              >
                <Globe className="w-full h-full" scrollYProgress={scrollYProgress} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Impact Ticker */}
        <ImpactTicker />

        {/* Audience Cards Section */}
        <section className="py-20 relative">
          <div className="container px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-6">
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D2821] to-[#065f46]">Everyone</span> in the Natural Economy
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're providing ecosystem services or investing in them, we have solutions for you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AudienceCard
                title="Landowners & Developers"
                subtitle="Supply Side"
                description="Turn your land into a high-yield asset. Generate new, reliable income from ecosystem services your healthy land already provides."
                href="/landowners"
                icon={Sprout}
                delay={0.1}
              />
              <AudienceCard
                title="Corporates & Investors"
                subtitle="Demand Side"
                description="Access high-integrity, data-driven ecological assets to meet net-zero and nature-positive goals with real-time verification."
                href="/corporates-investors"
                icon={Building2}
                delay={0.2}
              />
              <AudienceCard
                title="Financial Institutions"
                subtitle="Accelerators"
                description="Future-proof your financial products with planetary data. Integrate natural capital metrics into lending and risk models."
                href="/financial-institutions"
                icon={Landmark}
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Process Section (How It Works) */}
        <section className="py-16 bg-white relative">
          <div className="container px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our technology platform powers the entire lifecycle of ecological assets.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TechCard
                title="DMRV"
                description="AI, Remote Sensing & IoT capture real-time ecosystem intelligence with digital MRV."
                delay={0.1}
                animationStage="source"
                href="/measure"
              />
              <TechCard
                title="NCA"
                description="Natural Capital Accounting transforms ecosystem data into verified financial assets."
                delay={0.2}
                animationStage="diligence"
                href="/verify"
              />
              <TechCard
                title="BLOCKCHAIN"
                description="Immutable ledger technology ensures transparent, tamper-proof data integrity."
                delay={0.3}
                animationStage="track"
                href="/blockchain"
              />
            </div>
          </div>
        </section>

        {/* Technology Showcase Section */}
        {/* /Technology Carousel */}
        <PartnersCarousel />

        {/* Platform Features (Natural Capital Section) */}
        <NaturalCapitalSection />

        {/* Partners Section */}
        <InfiniteScrollPartners />

        {/* CTA Section with Globe */}
        <div className="container px-4 mx-auto py-24">
          <Featured_05 />
        </div>

       

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
