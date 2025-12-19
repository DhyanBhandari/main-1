import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, TrendingUp, Shield, Users, CheckCircle, ArrowRight, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ContractCard } from "@/components/ContractExplainer";

const Landowners = () => {
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
            <div className="text-green-300 font-semibold mb-4 text-lg uppercase tracking-wider">For Landowners & Project Developers</div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Turn Your Land into a <span className="text-green-300">High-Yield Asset</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed max-w-3xl">
              Generate new, reliable income from the ecosystem services your healthy land already provides. Join the Nature-Vested Partnership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-[#0D2821] hover:bg-green-100 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com">Get Your Free Land Valuation</a>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com">Apply for Partnership</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Nature-Vested Partnership */}
      <section className="py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">The Nature-Vested Partnership</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A full-service program that transforms your land into a dual-income asset.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Upfront Financing",
                description: "We provide capital to help you transition to regenerative practices with no out-of-pocket costs."
              },
              {
                icon: Leaf,
                title: "Scientific Planning",
                description: "Our experts design a customized land management plan optimized for ecological credit generation."
              },
              {
                icon: Shield,
                title: "Continuous Monitoring",
                description: "AI-powered satellite and IoT monitoring tracks your land's health and credit potential 24/7."
              },
              {
                icon: Users,
                title: "Revenue Sharing",
                description: "Earn from two streams: your sustainable produce PLUS verified ecological credits."
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
        </div>
      </section>

      {/* Value Proposition Table */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Why Partner with ErthaLoka?</h2>
            <p className="text-xl text-gray-600">See the difference in outcomes.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-gray-100 px-6 py-4 text-left text-lg font-bold text-gray-700"></th>
                    <th className="bg-gray-100 px-6 py-4 text-center text-lg font-bold text-gray-500">Without ErthaLoka</th>
                    <th className="bg-[#0D2821] px-6 py-4 text-center text-lg font-bold text-white">With ErthaLoka</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { category: "Revenue", without: "Single stream (e.g., crops)", with: "Dual stream (crops + credits)" },
                    { category: "Risk", without: "Market/Climate volatility", with: "Pre-sold credits provide buffer" },
                    { category: "Support", without: "Limited agri-extension", with: "Full tech & science team" },
                    { category: "Proof", without: "Hard to demonstrate", with: "Verifiable data for premiums" }
                  ].map((row, index) => (
                    <tr key={row.category} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-5 font-semibold text-[#0D2821]">{row.category}</td>
                      <td className="px-6 py-5 text-center text-gray-500">{row.without}</td>
                      <td className="px-6 py-5 text-center text-[#0D2821] font-medium bg-green-50">
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          {row.with}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The LSA Contract */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <FileText className="h-4 w-4" />
                YOUR CONTRACT
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0D2821]">
                The Land Stewardship Agreement
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Our simple, transparent contract that grants ErthaLoka the rights to measure, verify, and monetize the ecosystem services your land provides while you retain full ownership.
              </p>
              <ul className="space-y-4">
                {[
                  "10-20 year partnership term with flexibility",
                  "Minimum payment guarantees every quarter",
                  "Clear stewardship guidelines and support",
                  "Revenue sharing on all verified credits"
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
            >
              <ContractCard contractId="lsa" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Free Land Assessment */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#0D2821]">
                Free Land Health Assessment
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Submit your land details and receive a preliminary AI-generated report on its carbon, biodiversity, and water potential. No commitment required.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Carbon sequestration potential analysis",
                  "Biodiversity assessment and opportunities",
                  "Water resource and watershed benefits",
                  "Estimated credit generation forecast"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="bg-[#0D2821] hover:bg-[#065f46] text-white text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com" className="flex items-center gap-2">
                  Request Free Assessment <ArrowRight className="h-5 w-5" />
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
              <div className="bg-[#0D2821] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">What We Assess</h3>
                <div className="space-y-4">
                  {[
                    { label: "Carbon Stock", value: "Mg/ha potential" },
                    { label: "Biodiversity Index", value: "Species richness score" },
                    { label: "Water Services", value: "Watershed contribution" },
                    { label: "PHI Score", value: "0-100 ecosystem health" }
                  ].map((metric, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-white/20 last:border-0">
                      <span className="text-green-300">{metric.label}</span>
                      <span className="font-semibold">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Project Developer Toolkit */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="text-green-600 font-semibold mb-4 text-sm uppercase tracking-wider">For NGOs & Enterprises</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0D2821]">Project Developer Toolkit</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              White-label version of our monitoring and verification dashboard to scale your own projects with bank-grade integrity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Monitoring Dashboard",
                description: "Real-time satellite and IoT data visualization for all your project sites."
              },
              {
                title: "Verification Engine",
                description: "Automated credit verification with transparent audit trails."
              },
              {
                title: "Reporting Suite",
                description: "Generate compliant reports for funders, regulators, and stakeholders."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#0D2821] to-[#065f46]">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-green-200">{feature.description}</p>
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
              Ready to unlock your land's full potential?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join the landowners who are earning more while healing the planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#0D2821] hover:bg-green-100 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com">Get Your Free Land Valuation</a>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <a href="mailto:connect@erthaloka.com">Apply for Partnership</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landowners;
