import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, BarChart3, Globe, CheckCircle, ArrowRight, Building2, Briefcase, FileCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ContractFlowSimple } from "@/components/ContractExplainer";

const CorporatesInvestors = () => {
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
            <div className="text-green-300 font-semibold mb-4 text-lg uppercase tracking-wider">For Corporations & Investors</div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Invest in the Ultimate Infrastructure: <span className="text-green-300">A Living Planet</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed max-w-3xl">
              Access high-integrity, data-driven ecological assets to meet net-zero and nature-positive goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-[#0D2821] hover:bg-green-100 text-lg px-8 py-6 rounded-full">
                <Link to="/projects/current" className="flex items-center gap-2">
                  Browse Available Assets <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com">Book a Portfolio Consultation</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What are EPAs */}
      <section className="py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Ecological Performance Assets (EPAs)</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pre-vetted portfolios of future ecological credits (carbon, biodiversity, water) from our partnered landscapes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: BarChart3,
                title: "Carbon Credits",
                description: "Verified carbon sequestration from reforestation, agroforestry, and ecosystem restoration projects."
              },
              {
                icon: Globe,
                title: "Biodiversity Units",
                description: "Measurable biodiversity improvements tracked through AI-powered species monitoring and habitat assessment."
              },
              {
                icon: TrendingUp,
                title: "Water Credits",
                description: "Watershed services including water filtration, aquifer recharge, and flood mitigation benefits."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white">
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

          {/* Key Differentiator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#0D2821] to-[#065f46] rounded-3xl p-8 md:p-12 text-white text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Key Differentiator</h3>
            <p className="text-xl opacity-90">
              "Backed by real-time remote sensing verification, not just paperwork."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Insured Integrity Guarantee */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Shield className="h-4 w-4" />
                INSURED INTEGRITY
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0D2821]">
                Insured Integrity Guarantee
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Our partnerships with leading insurers protect your investment against reversal or non-delivery of credits. This is your trust signal.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Protection against credit reversal",
                  "Non-delivery insurance coverage",
                  "Third-party verified permanence",
                  "Transparent risk assessment"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Swiss Re", type: "Insurance Partner" },
                { label: "Howden", type: "Insurance Partner" },
                { label: "ISSB", type: "Standard Aligned" },
                { label: "TNFD", type: "Framework Compliant" }
              ].map((partner, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="text-2xl font-bold text-[#0D2821] mb-2">{partner.label}</div>
                  <div className="text-sm text-gray-500">{partner.type}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Custom Portfolio Builder */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Custom Portfolio Builder</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Input your footprint, get tailored EPA portfolio recommendations optimized for your sustainability goals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white shadow-xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-10 bg-gray-50">
                    <h3 className="text-2xl font-bold mb-6 text-[#0D2821]">Your Input</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Company Location", placeholder: "e.g., Mumbai, India" },
                        { label: "Industry Sector", placeholder: "e.g., Manufacturing" },
                        { label: "Carbon Footprint", placeholder: "e.g., 10,000 tons CO2e" },
                        { label: "Sustainability Targets", placeholder: "e.g., Net Zero by 2030" }
                      ].map((field, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-400 text-sm">
                            {field.placeholder}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-8 md:p-10 bg-[#0D2821] text-white">
                    <h3 className="text-2xl font-bold mb-6">Recommended Portfolio</h3>
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm text-green-300 mb-1">Primary Recommendation</div>
                        <div className="font-semibold">Mangrove Restoration Portfolio</div>
                        <div className="text-sm opacity-80 mt-1">Maximum community co-benefit alignment</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm text-green-300 mb-1">Coverage</div>
                        <div className="font-semibold">10,000+ tons CO2e annually</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-sm text-green-300 mb-1">Co-benefits</div>
                        <div className="font-semibold">Biodiversity + Water + Community</div>
                      </div>
                    </div>
                    <Button className="w-full mt-6 bg-white text-[#0D2821] hover:bg-green-100">
                      <a href="mailto:connect@erthaloka.com">Get Full Recommendation</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Impact Dashboard Preview */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Impact Transparency Dashboard</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See your specific hectare of land, its real-time ecological metrics, and community stories.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Live Hectares", value: "2,450", unit: "ha tracked" },
              { label: "Carbon Secured", value: "45,230", unit: "tons CO2e" },
              { label: "PHI Score", value: "78", unit: "avg health" },
              { label: "Communities", value: "12", unit: "benefiting" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-[#0D2821] mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.unit}</div>
                    <div className="text-sm font-medium text-gray-700 mt-2">{stat.label}</div>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Aligned with Global Standards</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our EPAs meet the most rigorous international sustainability frameworks.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "ISSB", full: "International Sustainability Standards Board" },
              { name: "TNFD", full: "Taskforce on Nature-related Financial Disclosures" },
              { name: "SBTN", full: "Science Based Targets Network" },
              { name: "India GCP", full: "Green Credit Programme" }
            ].map((standard, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <FileCheck className="h-6 w-6 text-[#0D2821]" />
                    </div>
                    <div className="text-xl font-bold text-[#0D2821] mb-2">{standard.name}</div>
                    <div className="text-sm text-gray-500">{standard.full}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contract Framework */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our three-contract framework ensures transparency and trust at every step.
            </p>
          </motion.div>
          <ContractFlowSimple className="mb-8" />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-gray-600 max-w-2xl mx-auto">
              Through our <span className="font-semibold text-purple-600">Forward Purchase Agreement (FPA)</span>,
              you pre-commit to purchasing verified Ecological Performance Certificates (EPCs),
              securing your supply while supporting landowner conservation efforts.
            </p>
          </motion.div>
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
              Ready to build your nature-positive portfolio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join leading organizations in the transition to a natural economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#0D2821] hover:bg-green-100 text-lg px-8 py-6 rounded-full">
                <Link to="/projects/current" className="flex items-center gap-2">
                  Browse Available Assets <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com">Book a Consultation</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CorporatesInvestors;
