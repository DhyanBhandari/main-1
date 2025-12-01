import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import verifyImg from "@/assets/verify.jpg";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TechCard } from "@/components/ui/tech-card";
import Footer from "@/components/Footer";
import Featured_05 from "@/components/globe-feature-section";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

const Verify = () => {
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
                VERIFY
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-gray-900 leading-[1.1]">
              Transparency & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r #0D2821">
                Trust
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              The Datanomics Engine ensures data integrity and transparency, creating a trusted foundation for natural capital markets.
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
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-6">The Datanomics Engine</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Validate & secure data with blockchain-backed verification and transparent audit trails.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Shield,
                title: "Data Integrity",
                description: "Every data point is validated against multiple sources and verified before being recorded.",
                href: "/verify"
              },
              {
                icon: Lock,
                title: "Blockchain Security",
                description: "Immutable ledger ensures complete transparency and prevents tampering with verified data.",
                href: "/verify"
              },
              {
                icon: CheckCircle,
                title: "Audit Trail",
                description: "Complete provenance tracking from collection through verification to asset creation.",
                href: "/verify"
              }
            ].map((feature, index) => (
              <TechCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} href={feature.href} delay={index * 0.1} />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900">Building Trust Through Verification</h2>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Multi-layer verification validates data accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Blockchain immutability prevents retroactive changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Real-time audit capabilities for all stakeholders</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Automated compliance with emerging standards</span>
                </li>
              </ul>

              <Button asChild size="lg" className="h-14 px-8 rounded-full bg-green-800 hover:bg-green-900 text-white shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-lg font-medium">
                <Link to="/abcde-framework">See How We Value Assets <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img src={verifyImg} alt="Verification Process" className="rounded-2xl border border-green-100 shadow-[0_20px_70px_-15px_rgba(22,101,52,0.25)]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">
              Trust is the foundation of natural capital markets
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Our verification infrastructure ensures every asset is backed by transparent, immutable data.
            </p>
            <Button size="lg" className="bg-white text-green-900 hover:bg-white/90 text-lg px-8 py-6">
              <a href="mailto:connect@erthaloka.com">Learn More</a>
            </Button>
          </motion.div>
        </div>
      </section>
      <div className="container px-4 mx-auto py-24">
        <Featured_05 />
      </div>
      <Footer />
    </div>
  );
};

export default Verify;
