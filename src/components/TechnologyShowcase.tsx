import { motion } from "framer-motion";
import { useState } from "react";
import { PartnerFormModal } from "@/components/PartnerFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  Cpu,
  Calculator,
  Shield,
  FileCheck,
  Users,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Download,
  Database,
  Lock
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Featured_05 from "@/components/globe-feature-section";
import { Link } from "react-router-dom";

const Technology = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 4-Layer Tech Stack
  const techStack = [
    {
      layer: 1,
      name: "Earth Sense",
      subtitle: "Data Collection",
      description: "AI-powered remote sensing, LiDAR, and IoT sensors capture real-time ecosystem data across all project sites.",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
      features: ["Remote sensing (10m resolution)", "LiDAR terrain mapping", "IoT ground sensors", "Spectral analysis (NDVI, EVI)"]
    },
    {
      layer: 2,
      name: "Digital Twin",
      subtitle: "Processing",
      description: "Machine learning models process raw data into ecosystem health metrics and predictive insights.",
      icon: Cpu,
      color: "from-purple-500 to-pink-500",
      features: ["ML-powered analysis", "5 pillar health assessment", "Temporal change detection", "Anomaly detection"]
    },
    {
      layer: 3,
      name: "Financial Engine",
      subtitle: "Valuation",
      description: "Proprietary PPA framework converts ecological performance into verifiable, tradeable asset values.",
      icon: Calculator,
      color: "from-green-500 to-emerald-500",
      features: ["PPA score calculation", "ESV (Ecosystem Service Value)", "Carbon credit quantification", "Risk-adjusted pricing"]
    },
    {
      layer: 4,
      name: "Impact Oracle",
      subtitle: "Verification",
      description: "Blockchain-backed verification ensures immutable proof of ecological performance and credit issuance.",
      icon: Shield,
      color: "from-orange-500 to-amber-500",
      features: ["Immutable audit trail", "EPC certificate issuance", "Third-party verification", "Transparent registry"]
    }
  ];

  // Compliance Standards
  const standards = [
    { name: "ISSB", full: "International Sustainability Standards Board" },
    { name: "TNFD", full: "Taskforce on Nature-related Financial Disclosures" },
    { name: "SBTN", full: "Science Based Targets Network" },
    { name: "India GCP", full: "Green Credit Programme" },
    { name: "TCFD", full: "Task Force on Climate-related Financial Disclosures" },
    { name: "GRI", full: "Global Reporting Initiative" }
  ];

  // Quick Links to Technology Pages
  const quickLinks = [
    { name: "PPA Framework", description: "Planetary Performance Assessment methodology", href: "/abcde-framework" },
    { name: "Measure", description: "Data collection process", href: "/measure" },
    { name: "Verify", description: "Verification protocols", href: "/verify" },
    { name: "EPA Registry", description: "Browse ecological assets", href: "/projects/current" }
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-[#0D2821] via-[#0D2821] to-[#065f46] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Shield className="h-4 w-4" />
              TECHNOLOGY & INTEGRITY
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Trust Built on <span className="text-green-300">Transparency</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto">
              Our technology platform delivers bank-grade integrity for every ecological asset. See exactly how we measure, verify, and value the planet's health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#0D2821] hover:bg-green-100 text-lg px-8 py-6 rounded-full">
                <a href="#methodology" className="flex items-center gap-2">
                  View Methodology <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <Link to="/projects/current" className="flex items-center gap-2">
                  Live Dashboard <ExternalLink className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4-Layer Tech Stack */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">The Technology Stack</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four integrated layers power every ecological asset from data collection to verified credits.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((layer, index) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white overflow-hidden group">
                  <CardContent className="p-0">
                    {/* Layer number bar */}
                    <div className={`h-2 bg-gradient-to-r ${layer.color}`}></div>

                    <div className="p-6">
                      {/* Layer number */}
                      <div className="text-xs font-bold text-gray-400 mb-2">LAYER {layer.layer}</div>

                      {/* Icon */}
                      <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-r ${layer.color} flex items-center justify-center`}>
                        <layer.icon className="h-7 w-7 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-[#0D2821] mb-1">{layer.name}</h3>
                      <div className="text-sm text-gray-500 mb-3">{layer.subtitle}</div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4">{layer.description}</p>

                      {/* Features */}
                      <ul className="space-y-2">
                        {layer.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Connection arrows (visual only) */}
          <div className="hidden lg:flex justify-center items-center gap-4 mt-8">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex items-center">
                <div className="w-24 h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <ArrowRight className="h-5 w-5 text-gray-400 -ml-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Public Dashboard */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Globe className="h-4 w-4" />
                LIVE DATA
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0D2821]">
                Public Impact Dashboard
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Real, public-facing data from all projects. See aggregated metrics updated in real-time - our most powerful trust signal.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Total hectares under management",
                  "Tons of CO₂e secured across all projects",
                  "Water recharge volume tracked",
                  "Partner communities and landowners"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="bg-[#0D2821] hover:bg-[#065f46] text-white text-lg px-8 py-6 rounded-full">
                <Link to="/projects/current" className="flex items-center gap-2">
                  View Live Dashboard <ExternalLink className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#0D2821] rounded-3xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  Aggregated Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Hectares", value: "4,203", unit: "ha" },
                    { label: "Carbon", value: "152K", unit: "tCO₂e" },
                    { label: "Partners", value: "28", unit: "active" },
                    { label: "Countries", value: "3", unit: "regions" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-green-300 text-sm">{stat.unit}</div>
                      <div className="text-xs text-white/60 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Methodology Library */}
      <section id="methodology" className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Methodology Library</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Publicly accessible documentation of our scientific methodologies, reviewed by independent experts.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Carbon Measurement", desc: "Soil carbon, above-ground biomass, and sequestration protocols" },
              { title: "Biodiversity Assessment", desc: "Species richness, habitat quality, and ecosystem integrity metrics" },
              { title: "Water Services", desc: "Watershed protection, aquifer recharge, and water quality measurement" }
            ].map((doc, index) => (
              <motion.div
                key={doc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mb-4 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <FileCheck className="h-6 w-6 text-gray-600 group-hover:text-green-700 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0D2821] mb-2">{doc.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{doc.desc}</p>
                    <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Standards */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Compliance & Governance</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our assets align with emerging global standards for sustainability and nature-related disclosures.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {standards.map((standard, index) => (
              <motion.div
                key={standard.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="text-lg font-bold text-[#0D2821]">{standard.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{standard.full}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links to Sub-pages */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Explore Our Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deep dive into each component of our platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={link.href}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-[#0D2821] to-[#065f46] text-white group cursor-pointer">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{link.name}</h3>
                      <p className="text-green-200 text-sm mb-4">{link.description}</p>
                      <div className="flex items-center gap-2 text-white font-medium">
                        <span>Explore</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Board Placeholder */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Advisory Board</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Guided by renowned ecologists, economists, and former regulators who ensure our methodologies meet the highest standards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { role: "Ecology Expert", org: "Research Institution" },
              { role: "Climate Economist", org: "Policy Think Tank" },
              { role: "Former Regulator", org: "Environmental Agency" },
              { role: "Tech Advisor", org: "Climate Tech" }
            ].map((advisor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="font-bold text-[#0D2821] mb-1">{advisor.role}</div>
                    <div className="text-sm text-gray-500">{advisor.org}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0D2821] via-[#0D2821] to-[#065f46] text-white">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to see our technology in action?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Schedule a demo to see how we measure, verify, and value ecological assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#0D2821] hover:bg-green-100 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com" className="flex items-center gap-2">
                  Schedule a Demo <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <Link to="/projects/current" className="flex items-center gap-2">
                  View Live Projects <ExternalLink className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Technology;
