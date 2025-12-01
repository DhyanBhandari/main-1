import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Satellite, Cpu, Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import measureImg from "@/assets/measure.jpg";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TechCard } from "@/components/ui/tech-card";
import Footer from "@/components/Footer";
import Featured_05 from "@/components/globe-feature-section";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

const Measure = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section with Wavy Background */}
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
                MEASURE
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-gray-900 leading-[1.1]">
              Real-time Ecosystem <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r #0D2821">
                Intelligence
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              Our platform leverages AI, satellite imagery, and ground-based IoT sensors to capture ecosystem performance with unprecedented precision and scale.
            </p>

            <ScrollIndicator />
          </motion.div>
        </div>
      </WavyBackground>

      <section className="relative py-32 bg-zinc-50 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-dot-green-200 bg-dot [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="container px-4 mx-auto relative z-10"
        >
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-6">
              What makes Measurement <span className="text-green-600">unique?</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Comprehensive ecosystem data with technology validated across millions of hectares.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Satellite,
                title: "Satellite Intelligence",
                description: "High-resolution satellite imagery from Landsat and Sentinel continuously monitors ecosystem health and land use.",
                href: "/technology"
              },
              {
                icon: Cpu,
                title: "AI-Powered Analysis",
                description: "Machine learning identifies patterns, predicts trends, and quantifies ecosystem performance with precision.",
                href: "/technology"
              },
              {
                icon: Activity,
                title: "IoT Sensors",
                description: "Ground sensors capture real-time data on soil, air, water systems, and biodiversity metrics.",
                href: "/technology"
              }
            ].map((feature, index) => (
              <TechCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Technology Deep Dive */}
      <section className="py-32 bg-white relative">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img src={measureImg} alt="Measurement Technology" className="rounded-2xl border border-green-100 shadow-[0_20px_70px_-15px_rgba(34,197,94,0.25)]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900">
                Collect & Analyze Ecosystem Data
              </h2>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Multi-Source Integration</h3>
                  <p className="text-gray-600">Combine satellite imagery, IoT sensors, and AI analysis for a complete picture of ecosystem health.</p>
                </div>

                <div className="border-l-4 border-teal-500 pl-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Real-Time Monitoring</h3>
                  <p className="text-gray-600">Continuous data streams provide up-to-the-minute insights into ecosystem changes and trends.</p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Scalable Infrastructure</h3>
                  <p className="text-gray-600">Technology validated across millions of hectares, ready to scale to any ecosystem globally.</p>
                </div>
              </div>

              <Button asChild size="lg" className="h-14 px-8 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-lg font-medium">
                <Link to="/technology">Explore Our Technology <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container px-4 mx-auto py-24">
        <Featured_05 />
      </div>

      <Footer />
    </div>
  );
};

export default Measure;
