import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Link as LinkIcon, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TechCard } from "@/components/ui/tech-card";
import Footer from "@/components/Footer";
import Featured_05 from "@/components/globe-feature-section";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

const BPOP = () => {
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
            <h1 className="text-5xl md:text-7xl font-bold mb-8 pb-4 tracking-tight text-gray-900 leading-[1.1]">
              Blockchain Proof of&nbsp;
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D2821] to-[#023030]">
                Preservation
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              Immutable, transparent records of planetary health on the blockchain. Every ecosystem metric, verified and permanent.
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
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-6">The B-POP Protocol</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Secure, verifiable, and permanent records of ecosystem preservation on distributed ledger technology.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Shield,
                title: "Immutable Records",
                description: "Every preservation action is permanently recorded on the blockchain, creating an unalterable audit trail.",
                href: "/bpop"
              },
              {
                icon: Lock,
                title: "Cryptographic Security",
                description: "Advanced encryption ensures data integrity and prevents tampering with preservation records.",
                href: "/bpop"
              },
              {
                icon: LinkIcon,
                title: "Decentralized Verification",
                description: "Multiple nodes validate preservation claims, eliminating single points of failure.",
                href: "/bpop"
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
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900">How B-POP Works</h2>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Ecosystem data captured and verified through PHI metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Data hashed and recorded on immutable blockchain ledger</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Smart contracts automate verification and token issuance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Stakeholders can verify claims through public blockchain explorer</span>
                </li>
              </ul>

              <Button asChild size="lg" className="h-14 px-8 rounded-full bg-green-800 hover:bg-green-900 text-white shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-lg font-medium">
                <Link to="/getthereport">Generate PHI Report <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border border-green-200"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-800 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Proof of Preservation</h3>
                    <p className="text-sm text-gray-600">Blockchain-verified ecosystem health</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/80 rounded-lg p-4 border border-green-100">
                    <p className="text-sm font-mono text-gray-700 break-all">0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</p>
                    <p className="text-xs text-gray-500 mt-2">Transaction Hash</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/80 rounded-lg p-4 border border-green-100">
                      <p className="text-2xl font-bold text-green-800">847</p>
                      <p className="text-xs text-gray-500">Hectares Verified</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 border border-green-100">
                      <p className="text-2xl font-bold text-green-800">12,450</p>
                      <p className="text-xs text-gray-500">Carbon Tonnes</p>
                    </div>
                  </div>
                </div>
              </div>
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
              Transparent. Immutable. Verifiable.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              B-POP creates permanent proof that preservation happened, enabling trust in natural capital markets.
            </p>
            <Button size="lg" className="bg-white text-green-900 hover:bg-white/90 text-lg px-8 py-6">
              <a href="mailto:connect@erthaloka.com">Partner With Us</a>
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

export default BPOP;
