import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FileCheck, Building2, TrendingUp, CheckCircle, ArrowRight, Code, Shield, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const FinancialInstitutions = () => {
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
            className="max-w-4xl"
          >
            <div className="text-green-300 font-semibold mb-4 text-lg uppercase tracking-wider">For Financial Institutions</div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Future-Proof Your Financial Products with <span className="text-green-300">Planetary Data</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed max-w-3xl">
              Integrate real-time natural capital metrics into your lending, investment, and risk models.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-[#0D2821] hover:bg-green-100 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com" className="flex items-center gap-2">
                  Download FI Integration Whitepaper <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com">Schedule a Tech Demo</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Earth Sense API */}
      <section className="py-20">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Code className="h-4 w-4" />
                API & DATA FEEDS
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0D2821]">
                Earth Sense API
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Integrate ecological health scores of a borrower's collateral (e.g., farmland mortgage) directly into your risk assessment systems.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time ecosystem health scores (0-100)",
                  "Carbon stock and sequestration data",
                  "Biodiversity and land cover metrics",
                  "Climate risk indicators",
                  "RESTful API with comprehensive documentation"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="bg-[#0D2821] hover:bg-[#065f46] text-white text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com" className="flex items-center gap-2">
                  Request API Access <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-900 rounded-3xl p-6 text-white font-mono text-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2">Earth Sense API Response</span>
                </div>
                <pre className="text-green-400 overflow-x-auto">
{`{
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "phi_score": 78,
  "carbon_stock": {
    "value": 145.2,
    "unit": "Mg/ha"
  },
  "pillars": {
    "atmospheric": 72,
    "biodiversity": 78,
    "carbon": 85,
    "degradation": 70,
    "ecosystem": 75
  },
  "data_quality": 0.92,
  "risk_grade": "A"
}`}
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Green Loan Verification */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Green Loan & Bond Verification Suite</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A turnkey service to set KPIs, monitor, and verify impact for Sustainability-Linked Loans (SLLs) and Green Bonds.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileCheck,
                title: "Deal Structuring",
                description: "Define measurable KPIs tied to ecological outcomes that satisfy regulatory requirements."
              },
              {
                icon: BarChart3,
                title: "Continuous Monitoring",
                description: "Real-time tracking of project performance against sustainability targets."
              },
              {
                icon: Shield,
                title: "Automated Reporting",
                description: "Generate compliant impact reports for investors, regulators, and stakeholders."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-2xl flex items-center justify-center">
                      <feature.icon className="h-8 w-8 text-[#0D2821]" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#0D2821]">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-xl text-gray-600 italic">
              "From deal structuring to automated reporting."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Co-Branded Financial Products */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Co-Branded Financial Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Co-create innovative financial products with ErthaLoka's technology backbone.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Regenerative Agri-Loan",
                example: "AU Bank-ErthaLoka",
                description: "Green loans for farmers transitioning to regenerative practices, with ecological performance tracking built in."
              },
              {
                title: "Nature-Vested Savings Account",
                example: "DBS-ErthaLoka",
                description: "Savings products where interest bonuses are tied to verified ecosystem improvements."
              }
            ].map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 bg-white border-0">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center gap-2 bg-[#0D2821] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                      <Building2 className="h-4 w-4" />
                      {product.example}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#0D2821]">{product.title}</h3>
                    <p className="text-gray-600">{product.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Climate Risk Analytics */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="bg-[#0D2821] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Risk Analytics Dashboard</h3>
                <div className="space-y-4">
                  {[
                    { label: "Physical Climate Risk", score: "Low", color: "bg-green-500" },
                    { label: "Transition Risk", score: "Medium", color: "bg-yellow-500" },
                    { label: "Nature Dependency", score: "High", color: "bg-orange-500" },
                    { label: "Ecosystem Resilience", score: "Strong", color: "bg-green-500" }
                  ].map((metric, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-white/20 last:border-0">
                      <span className="text-green-300">{metric.label}</span>
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${metric.color}`}></span>
                        <span className="font-semibold">{metric.score}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <TrendingUp className="h-4 w-4" />
                CLIMATE RISK
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0D2821]">
                Climate Risk Analytics
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Forward-looking analytics on physical climate and nature risk for specific geographies or asset portfolios.
              </p>
              <ul className="space-y-4">
                {[
                  "Portfolio-level nature risk assessment",
                  "Geography-specific climate projections",
                  "Stranded asset identification",
                  "TCFD and TNFD aligned reporting"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integration Architecture */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Integration Architecture</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technology seamlessly integrates with your existing systems.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: "Earth Sense", desc: "Data Collection", icon: Database },
                { name: "Digital Twin", desc: "Processing", icon: Code },
                { name: "Financial Engine", desc: "Valuation", icon: TrendingUp },
                { name: "Impact Oracle", desc: "Verification", icon: Shield }
              ].map((layer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-white h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 mx-auto mb-4 bg-[#0D2821] rounded-xl flex items-center justify-center">
                        <layer.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-lg font-bold text-[#0D2821] mb-1">{layer.name}</div>
                      <div className="text-sm text-gray-500">{layer.desc}</div>
                    </CardContent>
                  </Card>
                  {index < 3 && (
                    <div className="hidden md:flex justify-center py-2">
                      <ArrowRight className="h-5 w-5 text-gray-400 rotate-0 md:rotate-0" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
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
              Ready to integrate planetary data into your products?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join forward-thinking financial institutions building the infrastructure for the natural economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#0D2821] hover:bg-green-100 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com" className="flex items-center gap-2">
                  Download FI Whitepaper <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com">Schedule a Tech Demo</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FinancialInstitutions;
