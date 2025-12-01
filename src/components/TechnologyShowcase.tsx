import { motion } from "framer-motion";
import { useState } from "react";
import { PartnerFormModal } from "@/components/PartnerFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Satellite, Database, Lock } from "lucide-react";
import Header from "@/components/Header";
import dataVizBg from "@/assets/data-viz-bg.jpg";
import { TechCard } from "@/components/ui/tech-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { WavyBackground } from "@/components/ui/wavy-background";
import Footer from "@/components/Footer";
import Featured_05 from "@/components/globe-feature-section";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

const Technology = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />

      <WavyBackground className="max-w-7xl mx-auto pb-40" backgroundFill="white" colors={["#22c55e", "#16a34a", "#4ade80", "#86efac", "#bbf7d0"]}>
        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 rounded-full bg-green-50 border border-green-100 shadow-sm">
              <span className="text-sm font-bold tracking-widest text-green-700 uppercase">
                PARTNER
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-gray-900 leading-[1.1]">
              Building a Modern, Scalable Technology for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r #0D2821">
                Planet Preservation
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-5xl mx-auto font-medium leading-relaxed">
              Developing the technologies required to create a future where high-integrity, transparent Verified Data can scale at the speed our planet demands.
            </p>

            <ScrollIndicator />
          </motion.div>
        </div>
      </WavyBackground>

      <section className="relative py-32 bg-zinc-50 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-dot-green-200 bg-dot [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
        </div>
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-6">Our Technology Stack</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Combining AI, satellite imagery, IoT sensors, and blockchain to power natural capital markets.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Satellite, title: "Satellite & Remote Sensing", description: "", href: "/technology" },
              { icon: Cpu, title: "Machine Learning & AI", description: "", href: "/technology" },
              { icon: Database, title: "IoT & Ground Sensors", description: "", href: "/technology" },
              { icon: Lock, title: "Blockchain & Security", description: "", href: "/technology" },
            ].map((item, idx) => (
              <TechCard key={item.title} icon={item.icon} title={item.title} description={item.description} href={item.href} delay={idx * 0.1} hideButton={true} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-800 text-white">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">
              "Now is the time to act to protect our planet before it's too late."
            </h2>

          </motion.div>
        </div>
      </section>
      <div className="container px-4 mx-auto py-24">
        <Featured_05 />
      </div>
      <Footer />
      <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Technology;
