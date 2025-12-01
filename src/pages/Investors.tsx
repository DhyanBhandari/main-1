import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, PieChart, BarChart3, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import dataVizBg from "@/assets/data-viz-bg.jpg";

const Investors = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={dataVizBg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>
        <div className="container relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl text-white"
          >
            <div className="text-accent font-semibold mb-4 text-lg">FOR INVESTORS</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Turn Natural Capital Into Measurable Assets
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Invest in the future where natural capital powers the global economy with measurable, verifiable returns.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-muted">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-primary">Why ErthaLoka for Investors?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access a new asset class with measurable impact and financial returns.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Appreciating Assets",
                description: "Natural Capital Assets increase in value as ecosystem health improves, creating predictable returns tied to planetary performance."
              },
              {
                icon: PieChart,
                title: "Portfolio Diversification",
                description: "Add uncorrelated natural capital assets to your portfolio, backed by real land and measurable ecological performance."
              },
              {
                icon: BarChart3,
                title: "Transparent Performance",
                description: "Real-time monitoring and blockchain-verified data provide complete transparency into asset performance and impact."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <feature.icon className="h-16 w-16 mx-auto mb-6 text-accent" />
                    <h3 className="text-2xl font-bold mb-4 text-primary">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-primary">The Market Opportunity</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A massive, validated market demand with regulatory tailwinds and technological maturation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="text-center bg-gradient-hero text-white">
                <CardContent className="p-8">
                  <div className="text-6xl font-bold mb-4">$44T</div>
                  <h3 className="text-2xl font-bold mb-2">Total Addressable Market</h3>
                  <p className="opacity-90">Global GDP dependent on nature (WEF)</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center bg-accent text-accent-foreground">
                <CardContent className="p-8">
                  <div className="text-6xl font-bold mb-4">$711B</div>
                  <h3 className="text-2xl font-bold mb-2">Serviceable Market</h3>
                  <p className="opacity-90">Annual conservation financing gap (UNEP)</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="text-center bg-secondary text-secondary-foreground">
                <CardContent className="p-8">
                  <div className="text-6xl font-bold mb-4">$7.1B</div>
                  <h3 className="text-2xl font-bold mb-2">Near-Term Target</h3>
                  <p className="opacity-90">1% market share (18-36 months)</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-muted p-8 rounded-lg"
          >
            <h3 className="text-2xl font-bold mb-4 text-primary">Market Drivers</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-lg mb-2 text-primary">Regulatory Momentum</h4>
                <p className="text-muted-foreground">190 countries committed to 30x30 targets. IFRS sustainability standards mandate corporate nature-related disclosures.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2 text-primary">ESG Demand</h4>
                <p className="text-muted-foreground">ESG assets projected to exceed $33 trillion by 2026, with acute shortage of high-integrity investment opportunities.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Investment Benefits */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-8 text-center">Investment Highlights</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Financial Returns</h3>
                <ul className="space-y-2 opacity-90">
                  <li>• Asset-backed tokens with real land value</li>
                  <li>• Revenue from primary issuance and AUM fees</li>
                  <li>• Secondary market liquidity and royalties</li>
                  <li>• Appreciation tied to ecosystem health</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Impact Alignment</h3>
                <ul className="space-y-2 opacity-90">
                  <li>• Direct environmental impact measurement</li>
                  <li>• Community wealth creation</li>
                  <li>• Permanent ecosystem protection</li>
                  <li>• Carbon sequestration at scale</li>
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                <a href="mailto:connect@erthaloka.com">Request Investment Deck <ArrowRight className="ml-2 h-5 w-5" /></a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Investors;
