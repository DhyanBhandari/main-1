import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import teamImg from "@/assets/connect-3d.png";
import planetImg from "@/assets/planet-impact.jpg";
import { TeamCarousel } from "@/components/TeamCarousel";
import { InfiniteScrollPartners } from "@/components/InfiniteScrollPartners";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100 selection:text-green-900">
      {/* Fixed Background */}
      {/* <div className="fixed inset-0 z-0 pointer-events-none">
        <DottedGlowBackground
          className="absolute inset-0 w-full h-full"
          gap={15}
          radius={2}
          color="#a1a1aa"
          glowColor="#10b981"
          opacity={0.2}
          speedMin={0.3}
          speedMax={1.6}
          speedScale={1}
        />
      </div> */}

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
       {/* <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
          {/* Animated Background for Hero - kept for Glass effect but blended */}
          <div className="bg-img-[url('/planet__.png')]" />

          <div className="container px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="glass-card-hero max-w-5xl mx-auto p-8 md:p-16 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text bg-#0D2821">
                  World's First Planetary Asset Preservation Company 
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <p className="text-2xl md:text-3xl mb-8 font-light text-foreground/80">
                  Where People, Planet & Purpose Thrive Together
                </p>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Join us in building the first economy that grows by healing. We are redefining value by anchoring it to the health of our world.
                </p>
              </motion.div>
            </motion.div>
          </div>
        { /* </section> */} 

        {/* Mission Section */}
        <section className="py-24 relative">
          <div className="container px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Glass Frame Effect */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                  <img
                    src={planetImg}
                    alt="Our Impact"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="font-mono text-sm text-primary-glow">EST. 2024</p>
                    <p className="font-bold text-lg">Planetary Regeneration</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Mission</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-primary to-blue-500 rounded-full" />
                </div>

                <blockquote className="text-2xl font-light italic text-foreground/90 border-l-4 border-primary pl-6 py-2">
                  "We make preservation more profitable than destruction."
                </blockquote>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  ErthaLoka is building the infrastructure to turn planetary health into the world's most valuable asset class. We're creating a future where protecting nature is not just the right thing to do—it's the most economically rational choice.
                </p>

                <div className="flex gap-4 pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold text-primary">100%</span>
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">Commitment</span>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold text-blue-500">Global</span>
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">Impact</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Impact Flywheel */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">The Impact Flywheel</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Planetary health and financial health become one continuous equation.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* PLANET Prism */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="glass-prism rounded-2xl p-8 relative overflow-hidden group border-t-4 border-t-emerald-500"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-foreground group-hover:text-emerald-500 transition-colors">PLANET</h3>
                <ul className="space-y-4 text-muted-foreground relative z-10">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">Permanence:</strong> Legally binding protection of vital ecosystems, forever.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">Active Stewardship:</strong> Perpetual trust fund pays for conservation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">Verifiable Health:</strong> Token value tied to measurable ecological gains.</span>
                  </li>
                </ul>
              </motion.div>

              {/* PEOPLE Prism */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-prism rounded-2xl p-8 relative overflow-hidden group border-t-4 border-t-blue-500"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-foreground group-hover:text-blue-500 transition-colors">PEOPLE</h3>
                <ul className="space-y-4 text-muted-foreground relative z-10">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">Upfront Capital:</strong> Direct share of token proceeds empowers communities.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">Long-Term Prosperity:</strong> Permanent, high-value jobs as stewards.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">Community Governance:</strong> Token treasury gives locals an economic stake.</span>
                  </li>
                </ul>
              </motion.div>

              {/* PROFIT Prism */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-prism rounded-2xl p-8 relative overflow-hidden group border-t-4 border-t-amber-500"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-foreground group-hover:text-amber-500 transition-colors">PROFIT</h3>
                <ul className="space-y-4 text-muted-foreground relative z-10">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">Aligned Incentives:</strong> Thriving planet as the most powerful financial asset.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">Systemic Change:</strong> Building infrastructure for a CoExIStic economy.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1 text-lg">•</span>
                    <span><strong className="text-foreground">New Benchmark:</strong> Market price for verifiable planetary health.</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Advisory Board & Team */}
        <TeamCarousel />

        {/* Incubators */}
        <InfiniteScrollPartners />

        <Footer />
      </div>
    </div>
  );
};

export default About;
