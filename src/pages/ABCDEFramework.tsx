import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";


import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { WavyBackground } from "@/components/ui/wavy-background";
import Footer from "@/components/Footer";
import Featured_05 from "@/components/globe-feature-section";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

const ABCDEFramework = () => {


  return (
    <div className="min-h-screen">
      <Header />

      <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="white" colors={["#22c55e", "#16a34a", "#4ade80", "#86efac", "#bbf7d0"]}>
        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 rounded-full bg-green-50 border border-green-100 shadow-sm">
              <span className="text-sm font-bold tracking-widest text-green-700 uppercase">
                VALUE
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-gray-900 leading-[1.1]">
              Quantifying Planetary Health To <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r #0D2821">
                Value Natural Capital
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              ErthaLoka's Proprietary measures ecosystem performance across five dimensions to create the Planetary Health Index (PHI).
            </p>

            <ScrollIndicator />
          </motion.div>
        </div>
      </WavyBackground>



      {/* PHI Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-6">
              Planetary Health Index (PHI)
            </h2>
            <p className="text-2xl mb-8 opacity-90">
              We don't just protect nature — we price its performance.
            </p>
            <p className="text-lg mb-12 opacity-80">
              The PHI aggregates all five Proprietary dimensions into a single, comprehensive metric that represents the overall health and value of an ecosystem. This standardized index enables investors and stakeholders to compare natural capital assets, track performance over time, and make informed decisions based on verifiable planetary health data.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
              <a href="mailto:connect@erthaloka.com">Request a Demo <ArrowRight className="ml-2 h-5 w-5" /></a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works with Sticky Scroll */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-primary">
              From Measurement to Monetization
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The Proprietary transforms raw ecosystem data into financial assets through a systematic process.
            </p>
          </motion.div>

          <StickyScroll
            content={[
              {
                title: "1. Data Collection",
                description:
                  "Gather multi-source ecosystem data from satellites, IoT sensors, and ground verification. We collect over 50 data points per hectare to ensure a comprehensive baseline.",
                content: (
                  <div className="h-full w-full bg-[linear-gradient(to_bottom_right,#06b6d4,#10b981)] flex items-center justify-center text-white">
                    <div className="text-6xl font-bold">1</div>
                  </div>
                ),
              },
              {
                title: "2. Data Analysis",
                description:
                  "Real-time insights across all aspects of planetary health — collecting, monitoring, analysing, and valuing ecosystems. Our proprietary algorithms score each dimension comprehensively.",
                content: (
                  <div className="h-full w-full bg-[linear-gradient(to_bottom_right,#f97316,#eab308)] flex items-center justify-center text-white">
                    <div className="text-6xl font-bold">2</div>
                  </div>
                ),
              },
              {
                title: "3. PHI Calculation",
                description:
                  "Generate the Planetary Health Index (PHI). This single score (0-100) represents the ecological integrity and performance of the asset.",
                content: (
                  <div className="h-full w-full bg-[linear-gradient(to_bottom_right,#ec4899,#6366f1)] flex items-center justify-center text-white">
                    <div className="text-6xl font-bold">3</div>
                  </div>
                ),
              },
              {
                title: "4. Asset Creation",
                description:
                  "Issue Digital Natural Capital Assets based on the PHI. These assets are minted on the blockchain, ensuring transparency, immutability, and traceability.",
                content: (
                  <div className="h-full w-full bg-[linear-gradient(to_bottom_right,#3b82f6,#8b5cf6)] flex items-center justify-center text-white">
                    <div className="text-6xl font-bold">4</div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>
      <div className="container px-4 mx-auto py-24">
        <Featured_05 />
      </div>
      <Footer />
    </div>
  );
};

export default ABCDEFramework;
