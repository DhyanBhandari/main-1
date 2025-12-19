import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Leaf, Wind, Users, TrendingUp } from "lucide-react";

interface TickerMetric {
  label: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  prefix?: string;
  decimals?: number;
}

// Animated counter component
const AnimatedCounter = ({
  value,
  decimals = 0,
  prefix = "",
  duration = 2
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
    </span>
  );
};

const ImpactTicker = () => {
  // These would ideally come from API - using realistic static values for now
  const metrics: TickerMetric[] = [
    {
      label: "Hectares Protected",
      value: 4203,
      unit: "ha",
      icon: Leaf
    },
    {
      label: "Carbon Secured",
      value: 152000,
      unit: "tons CO₂e",
      icon: Wind
    },
    {
      label: "To Landowners",
      value: 1.2,
      unit: "M",
      prefix: "$",
      decimals: 1,
      icon: TrendingUp
    },
    {
      label: "Partner Communities",
      value: 28,
      unit: "partners",
      icon: Users
    }
  ];

  return (
    <section className="py-6 bg-[#0D2821] border-y border-green-900/30">
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 px-4 py-2"
            >
              <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center">
                <metric.icon className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <AnimatedCounter
                    value={metric.value}
                    decimals={metric.decimals || 0}
                    prefix={metric.prefix || ""}
                    duration={2.5}
                  />
                  <span className="text-green-400 text-lg ml-1">{metric.unit}</span>
                </div>
                <div className="text-xs text-green-300/70 uppercase tracking-wider">
                  {metric.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactTicker;
