import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Award, Globe, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Corporates = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-hero text-white">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="text-accent font-semibold mb-4 text-lg">FOR CORPORATES</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Verifiable ESG Impact at Scale
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Turn sustainability commitments into measurable, transparent natural capital assets that stakeholders can trust.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Corporate Benefits */}
      <section className="py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-primary  px-4 inline-block">Why Leading Companies Choose ErthaLoka</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet regulatory requirements while creating real environmental impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Regulatory Compliance",
                description: "Meet IFRS Sustainability Standards and mandatory nature-related disclosures with verified, transparent data that satisfies auditors and regulators."
              },
              {
                icon: Award,
                title: "Credible ESG Reporting",
                description: "Replace vague sustainability claims with blockchain-verified natural capital assets and real-time impact metrics that stakeholders trust."
              },
              {
                icon: Globe,
                title: "Brand Differentiation",
                description: "Stand out with authentic climate action backed by measurable ecosystem improvements and transparent performance tracking."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-elevated transition-all duration-300 bg-[#0d2821]">
                  <CardContent className="p-8 text-center">
                    <feature.icon className="h-16 w-16 mx-auto mb-6 text-accent" />
                    <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                    <p className="text-muted-foreground text-white">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-muted">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-primary">Corporate Use Cases</h2>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                title: "Carbon Offset Portfolios",
                description: "Build verified carbon credit portfolios backed by measurable ecosystem improvements and transparent monitoring."
              },
              {
                title: "Supply Chain Sustainability",
                description: "Demonstrate sustainable sourcing practices with natural capital assets tied to your supply chain ecosystems."
              },
              {
                title: "Nature-Positive Operations",
                description: "Offset operational impacts with verified ecosystem restoration and protection programs."
              },
              {
                title: "Employee & Customer Engagement",
                description: "Connect stakeholders to real conservation projects with transparent impact tracking and reporting."
              }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-primary">{useCase.title}</h3>
                    <p className="text-lg text-muted-foreground">{useCase.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
              Ready to transform your sustainability strategy?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Partner with ErthaLoka to create verifiable, transparent natural capital assets.
            </p>
            <Button size="lg" className="bg-[#0d2821] text-white hover:bg-black/90 text-lg px-8 py-6">
              <a href="mailto:connect@erthaloka.com">Schedule a Consultation </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Corporates;
