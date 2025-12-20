import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle, ArrowRight, Database, Link2, FileCheck, Blocks } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TechCard } from "@/components/ui/tech-card";
import Footer from "@/components/Footer";
import Featured_05 from "@/components/globe-feature-section";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

const Blockchain = () => {
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
              Immutable&nbsp;&nbsp;
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D2821] to-[#023030]">
              & Transparent
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              Blockchain technology ensures every ecological asset is backed by tamper-proof, verifiable data that builds lasting trust.
            </p>

            <ScrollIndicator />
          </motion.div>
        </div>
      </WavyBackground>

      {/* How Blockchain Powers Our Platform */}
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
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-6">The Trust Layer</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Blockchain serves as the immutable foundation for all ecological performance data.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Blocks,
                title: "Immutable Records",
                description: "Once data is recorded on the blockchain, it cannot be altered, ensuring permanent transparency.",
                href: "/blockchain"
              },
              {
                icon: Link2,
                title: "Chain of Custody",
                description: "Track every data point from collection to verification to asset creation with complete provenance.",
                href: "/blockchain"
              },
              {
                icon: FileCheck,
                title: "Smart Contracts",
                description: "Automated verification and settlement ensure consistent, trustless execution of agreements.",
                href: "/blockchain"
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
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900">Why Blockchain Matters</h2>
              <p className="text-lg text-gray-600">
                In natural capital markets, trust is everything. Blockchain technology eliminates the need for blind faith by providing cryptographic proof of every claim.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Cryptographic hashing prevents data manipulation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Distributed ledger eliminates single points of failure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Timestamped records provide irrefutable audit trails</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-800 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Public verifiability builds stakeholder confidence</span>
                </li>
              </ul>

              <Button asChild size="lg" className="h-14 px-8 rounded-full bg-green-800 hover:bg-green-900 text-white shadow-[0_0_20px_-5px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_-5px_rgba(22,163,74,0.6)] hover:scale-105 transition-all duration-300 text-lg font-medium">
                <Link to="/technology">Explore Our Tech Stack <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-900 rounded-3xl p-8 text-white"
            >
              <div className="flex items-center gap-2 mb-6 text-gray-400">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-sm">Blockchain Transaction</span>
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto font-mono">
{`{
  "txHash": "0x7f9e8d...",
  "timestamp": "2024-12-20T10:30:00Z",
  "type": "EPA_VERIFICATION",
  "data": {
    "projectId": "PROJ-2024-001",
    "phiScore": 78,
    "carbonStock": {
      "value": 145.2,
      "unit": "Mg/ha"
    },
    "verifier": "ErthaLoka Oracle",
    "signature": "0x3a4b5c..."
  },
  "status": "CONFIRMED",
  "blockNumber": 18547892
}`}
              </pre>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-6">Blockchain Applications</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">How we leverage distributed ledger technology across our platform.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Database,
                title: "Data Anchoring",
                description: "Sensor readings and satellite data are hashed and anchored to the blockchain."
              },
              {
                icon: Shield,
                title: "EPC Issuance",
                description: "Ecological Performance Certificates are minted as verifiable on-chain assets."
              },
              {
                icon: Lock,
                title: "Credit Registry",
                description: "All EPA transactions are recorded in an immutable public registry."
              },
              {
                icon: FileCheck,
                title: "Compliance Proof",
                description: "Generate instant compliance reports backed by blockchain evidence."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-green-800" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
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
              Building the infrastructure for trustless natural capital markets
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Every ecological claim is backed by cryptographic proof, ensuring integrity at scale.
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

export default Blockchain;
