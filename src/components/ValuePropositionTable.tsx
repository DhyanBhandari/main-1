import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

interface ValueRow {
  aspect: string;
  without: string;
  with: string;
}

interface ValuePropositionTableProps {
  title?: string;
  subtitle?: string;
  rows: ValueRow[];
  className?: string;
}

export const ValuePropositionTable = ({
  title = "The ErthaLoka Advantage",
  subtitle = "See how partnering with us transforms your outcomes",
  rows,
  className = "",
}: ValuePropositionTableProps) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
      >
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
          <div className="p-4 md:p-6 font-semibold text-gray-700 text-sm md:text-base">
            Aspect
          </div>
          <div className="p-4 md:p-6 font-semibold text-red-600 text-sm md:text-base flex items-center gap-2 bg-red-50/50">
            <X className="w-4 h-4" />
            Without ErthaLoka
          </div>
          <div className="p-4 md:p-6 font-semibold text-green-600 text-sm md:text-base flex items-center gap-2 bg-green-50/50">
            <Check className="w-4 h-4" />
            With ErthaLoka
          </div>
        </div>

        {/* Table Body */}
        {rows.map((row, index) => (
          <motion.div
            key={row.aspect}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className={`grid grid-cols-3 ${
              index !== rows.length - 1 ? "border-b border-gray-100" : ""
            } hover:bg-gray-50/50 transition-colors`}
          >
            <div className="p-4 md:p-6 font-medium text-gray-900 text-sm md:text-base">
              {row.aspect}
            </div>
            <div className="p-4 md:p-6 text-gray-600 text-sm md:text-base bg-red-50/30">
              {row.without}
            </div>
            <div className="p-4 md:p-6 text-gray-800 text-sm md:text-base bg-green-50/30 font-medium">
              {row.with}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom CTA hint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          Ready to transform your outcomes?
          <ArrowRight className="w-4 h-4" />
        </p>
      </motion.div>
    </div>
  );
};

// Pre-configured tables for different audiences
export const LandownerValueTable = () => (
  <ValuePropositionTable
    title="Why Partner with ErthaLoka?"
    subtitle="Transform your land from an expense into a revenue-generating asset"
    rows={[
      {
        aspect: "Income Source",
        without: "Dependent on crop yields and market prices",
        with: "Diversified income from ecosystem services",
      },
      {
        aspect: "Revenue Timing",
        without: "Seasonal, unpredictable payments",
        with: "Steady monthly income, guaranteed minimums",
      },
      {
        aspect: "Land Valuation",
        without: "Based only on agricultural productivity",
        with: "Premium valuation including natural capital",
      },
      {
        aspect: "Risk Management",
        without: "Fully exposed to climate and market risks",
        with: "Insured and hedged through our platform",
      },
      {
        aspect: "Technical Support",
        without: "Self-managed with limited resources",
        with: "Full support with AI-powered recommendations",
      },
      {
        aspect: "Market Access",
        without: "Local markets, limited buyers",
        with: "Global corporate buyers, premium prices",
      },
    ]}
  />
);

export const CorporateValueTable = () => (
  <ValuePropositionTable
    title="Traditional Credits vs EPAs"
    subtitle="See why Ecological Performance Assets deliver superior value"
    rows={[
      {
        aspect: "Verification",
        without: "Annual third-party audits",
        with: "Real-time satellite + IoT verification",
      },
      {
        aspect: "Transparency",
        without: "Periodic reports, opaque methodology",
        with: "Live dashboard, blockchain-verified data",
      },
      {
        aspect: "Risk Profile",
        without: "Reversal risk, no insurance",
        with: "Insured integrity guarantee",
      },
      {
        aspect: "Additionality",
        without: "Difficult to prove and verify",
        with: "PHI baseline + continuous measurement",
      },
      {
        aspect: "Co-benefits",
        without: "Often excluded or unverified",
        with: "All 5 pillars measured and reported",
      },
      {
        aspect: "Compliance",
        without: "May not meet emerging standards",
        with: "ISSB, TNFD, SBTN aligned",
      },
    ]}
  />
);

export const FinancialInstitutionValueTable = () => (
  <ValuePropositionTable
    title="Legacy Data vs Earth Sense API"
    subtitle="Upgrade your environmental risk assessment capabilities"
    rows={[
      {
        aspect: "Data Freshness",
        without: "Annual or quarterly updates",
        with: "Real-time streaming data",
      },
      {
        aspect: "Coverage",
        without: "Limited to surveyed areas",
        with: "Global coverage, any coordinate",
      },
      {
        aspect: "Granularity",
        without: "Country or region level",
        with: "Parcel-level precision",
      },
      {
        aspect: "Integration",
        without: "Manual data import required",
        with: "RESTful API, instant integration",
      },
      {
        aspect: "Verification",
        without: "Self-reported, unverified",
        with: "Multi-source, blockchain-verified",
      },
      {
        aspect: "Cost Structure",
        without: "Expensive, per-report pricing",
        with: "Scalable API subscription",
      },
    ]}
  />
);

export default ValuePropositionTable;
