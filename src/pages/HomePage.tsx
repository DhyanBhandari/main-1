import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Database, ShieldCheck, TrendingUp, Play } from "lucide-react";
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
                  className="text-4xl sm:text-4xl md:text-4xl lg:text-xl font-bold tracking-tighter text-gray-900 mb-8 leading-[0.9]"
                >
                  Making Preservation 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D2821] to-[#065f46]">
                  Profitable
                  </span> <br /> 
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg sm:text-xl md:text-2xl text-black max-w-xl mx-auto lg:mx-0 mb-12 font-light leading-relaxed font-sans"
                >
                  We turn the planet's health into its most valuable asset. Join the first economy that grows by healing.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
                >
                  <Button asChild size="lg" className="h-14 px-12 rounded-full bg-[#0D2821] hover:bg-[#065f46] text-white shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-lg font-medium">
                    <Link to="/Data">Explore</Link>
                  </Button>
                  <Button asChild size="lg" className="h-14 px-12 rounded-full bg-[#0D2821] hover:bg-[#065f46] text-white shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-lg font-medium">
                    <Link to="/technology">Partner</Link>
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

        {/* Solution Section (Tech Cards) */}
        <section className="py-16 relative">
          <div className="container px-6 mx-auto">
            <div className="text-center mb-24">
              {/* <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-6">
                <span className="text-green-800">MVP</span> 
              </h2> */}
              {/* <p className="text-xl text-gray-500 max-w-2xl mx-auto font-sans leading-relaxed">
                Diagnosing the planet's health through advanced technology and financial innovation.
              </p> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TechCard
                title="MEASURE"
                description="AI, Satellite & IoT capture real-time ecosystem intelligence."
                //icon={Database}
                delay={0.1}
                animationStage="source"
                href="/measure"
              />
              <TechCard
                title="VERIFY"
                description="Datanomics ensures transparent, immutable data integrity."
               //icon={ShieldCheck}
                delay={0.2}
                animationStage="diligence"
                href="/verify"
              />
              <TechCard
                title="VALUE"
                description="Proprietary quantifies ecological performance."
                //icon={TrendingUp}
                delay={0.3}
                animationStage="track"
                href="/abcde-framework"
              />
            </div>
            {/* <TechCard
              title="PARTNER"
              description="Marketplace links investors, communities & corporates."
              icon={Leaf}
              delay={0.4}
              image={connectImg}
              href="/technology"
              buttonText="Partner Us"
            /> */}
          </div>
        </section>

        {/* Technology Showcase Section */}
        {/* /Technology Carousel */}
        <PartnersCarousel />

        {/* Platform Features (Natural Capital Section) */}
        <NaturalCapitalSection />


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
