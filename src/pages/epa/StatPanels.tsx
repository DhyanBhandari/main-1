import { motion } from "framer-motion";
import { Leaf, Users } from "lucide-react";

const stats = [
  {
    value: "300",
    unit: "Acres",
    label: "Under Management",
    description: "Protected ecosystems across multiple regions",
    icon: Leaf,
  },
  {
    value: "300+",
    unit: "",
    label: "Community Members",
    description: "Active stakeholders in conservation",
    icon: Users,
  },
];

const StatPanels = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stat-panel group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white/70" />
                </div>
              </div>
              
              {/* Value */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-6xl md:text-7xl font-semibold text-white tracking-tight">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-2xl text-white/70 font-medium">
                    {stat.unit}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <h3 className="font-display text-xl text-white/90 font-medium mb-3">
                {stat.label}
              </h3>
              
              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed">
                {stat.description}
              </p>
              
              {/* Subtle shine effect */}
              <div 
                className="absolute top-0 right-0 w-1/2 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsla(0, 0%, 100%, 0.02) 100%)'
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatPanels;
