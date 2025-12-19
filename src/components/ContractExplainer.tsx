import { motion } from "framer-motion";
import {
  FileText,
  Award,
  Handshake,
  ArrowRight,
  ArrowDown,
  Users,
  Building2,
  ShieldCheck,
  Sprout,
  BadgeCheck,
  Banknote
} from "lucide-react";

interface Contract {
  id: string;
  name: string;
  fullName: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  parties: string[];
  purpose: string;
  keyTerms: string[];
}

const contracts: Contract[] = [
  {
    id: "lsa",
    name: "LSA",
    fullName: "Land Stewardship Agreement",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    parties: ["Landowner", "ErthaLoka"],
    purpose: "Grants ErthaLoka the rights to measure, verify, and monetize ecosystem services from the land",
    keyTerms: [
      "10-20 year commitment",
      "Minimum payment guarantees",
      "Stewardship requirements",
      "Revenue sharing terms",
    ],
  },
  {
    id: "epc",
    name: "EPC",
    fullName: "Ecological Performance Certificate",
    icon: Award,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    parties: ["Impact Oracle", "Registry"],
    purpose: "The verified, tradeable unit representing measured ecological performance",
    keyTerms: [
      "PHI score verified",
      "Blockchain-anchored",
      "Unique serial number",
      "Retirement tracking",
    ],
  },
  {
    id: "fpa",
    name: "FPA",
    fullName: "Forward Purchase Agreement",
    icon: Handshake,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    parties: ["Corporate Buyer", "ErthaLoka"],
    purpose: "Pre-commits buyer to purchase future EPCs at agreed prices",
    keyTerms: [
      "Volume commitments",
      "Price lock-in",
      "Delivery schedule",
      "Quality guarantees",
    ],
  },
];

// Main ContractExplainer Component
export const ContractExplainer = ({ className = "" }: { className?: string }) => {
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
          The Three Pillars of Trust
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Our contract framework ensures transparency, accountability, and value for all stakeholders
        </p>
      </motion.div>

      {/* Contract Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {contracts.map((contract, index) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className={`relative p-6 rounded-2xl border-2 ${contract.borderColor} ${contract.bgColor} hover:shadow-lg transition-shadow`}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl ${contract.bgColor} border ${contract.borderColor} flex items-center justify-center mb-4`}>
              <contract.icon className={`w-6 h-6 ${contract.color}`} />
            </div>

            {/* Name */}
            <div className="mb-3">
              <span className={`text-2xl font-bold ${contract.color}`}>{contract.name}</span>
              <p className="text-sm text-gray-600 mt-1">{contract.fullName}</p>
            </div>

            {/* Parties */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{contract.parties.join(" & ")}</span>
            </div>

            {/* Purpose */}
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              {contract.purpose}
            </p>

            {/* Key Terms */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Terms</p>
              <ul className="space-y-1">
                {contract.keyTerms.map((term) => (
                  <li key={term} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-1.5 h-1.5 rounded-full ${contract.color.replace('text-', 'bg-')}`} />
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Flow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
      >
        <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
          How the Contracts Work Together
        </h4>

        {/* Desktop Flow */}
        <div className="hidden md:flex items-center justify-center gap-4">
          {/* Landowner */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
              <Sprout className="w-8 h-8 text-blue-600" />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">Landowner</span>
          </div>

          <ArrowRight className="w-6 h-6 text-gray-400" />

          {/* LSA */}
          <div className="px-4 py-2 bg-blue-100 border border-blue-200 rounded-lg">
            <span className="text-sm font-bold text-blue-600">LSA</span>
          </div>

          <ArrowRight className="w-6 h-6 text-gray-400" />

          {/* ErthaLoka */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">ErthaLoka</span>
          </div>

          <ArrowRight className="w-6 h-6 text-gray-400" />

          {/* EPC */}
          <div className="px-4 py-2 bg-green-100 border border-green-200 rounded-lg">
            <span className="text-sm font-bold text-green-600">EPC</span>
          </div>

          <ArrowRight className="w-6 h-6 text-gray-400" />

          {/* FPA */}
          <div className="px-4 py-2 bg-purple-100 border border-purple-200 rounded-lg">
            <span className="text-sm font-bold text-purple-600">FPA</span>
          </div>

          <ArrowRight className="w-6 h-6 text-gray-400" />

          {/* Corporate */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">Corporate</span>
          </div>
        </div>

        {/* Mobile Flow */}
        <div className="md:hidden flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Sprout className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium">Landowner</span>
          </div>
          <ArrowDown className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-blue-100 border border-blue-200 rounded-lg">
            <span className="text-sm font-bold text-blue-600">LSA</span>
          </div>
          <ArrowDown className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">ErthaLoka</span>
          </div>
          <ArrowDown className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-green-100 border border-green-200 rounded-lg">
            <span className="text-sm font-bold text-green-600">EPC</span>
          </div>
          <ArrowDown className="w-5 h-5 text-gray-400" />
          <div className="px-4 py-2 bg-purple-100 border border-purple-200 rounded-lg">
            <span className="text-sm font-bold text-purple-600">FPA</span>
          </div>
          <ArrowDown className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Corporate Buyer</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Verified on blockchain</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">Insured guarantees</span>
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">Revenue flows back to landowners</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Simplified version for embedding in pages
export const ContractFlowSimple = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 ${className}`}>
      {contracts.map((contract, index) => (
        <motion.div
          key={contract.id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex items-center gap-4"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${contract.bgColor} border ${contract.borderColor}`}>
            <contract.icon className={`w-5 h-5 ${contract.color}`} />
            <div>
              <span className={`font-bold ${contract.color}`}>{contract.name}</span>
              <p className="text-xs text-gray-500">{contract.fullName}</p>
            </div>
          </div>
          {index < contracts.length - 1 && (
            <ArrowRight className="hidden md:block w-5 h-5 text-gray-300" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Individual contract card for detailed pages
export const ContractCard = ({ contractId }: { contractId: "lsa" | "epc" | "fpa" }) => {
  const contract = contracts.find(c => c.id === contractId);
  if (!contract) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-2xl border-2 ${contract.borderColor} ${contract.bgColor}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl ${contract.bgColor} border ${contract.borderColor} flex items-center justify-center`}>
          <contract.icon className={`w-6 h-6 ${contract.color}`} />
        </div>
        <div>
          <span className={`text-xl font-bold ${contract.color}`}>{contract.name}</span>
          <p className="text-sm text-gray-600">{contract.fullName}</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4">{contract.purpose}</p>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="w-4 h-4" />
        <span>{contract.parties.join(" & ")}</span>
      </div>
    </motion.div>
  );
};

export default ContractExplainer;
