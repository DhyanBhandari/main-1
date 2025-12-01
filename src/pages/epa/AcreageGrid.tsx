import { motion } from "framer-motion";
import { Sprout, Wheat, TreePine } from "lucide-react";

const acreageData = [
  {
    acres: 160,
    title: "Vetiver Deployment",
    icon: Sprout,
    points: [
      "Erosion control and soil stabilization",
      "Engineered nature-based solutions at commercial scale"
    ],
    highlight: "Primary"
  },
  {
    acres: 100,
    title: "Regenerative Agriculture",
    icon: Wheat,
    points: [
      "Chemical-free farming rebuilding soil health",
      "Sequestering carbon and restoring biodiversity"
    ],
    highlight: "Active"
  },
  {
    acres: 40,
    title: "Urban Forest",
    icon: TreePine,
    points: [
      "Improving air quality and reducing heat",
      "Critical green infrastructure in dense metro areas"
    ],
    highlight: "Growing"
  }
];

const AcreageGrid = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            EPA Acreage Breakdown
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Strategically allocated land for maximum environmental impact
          </p>
        </motion.div>
        
        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {acreageData.map((item, index) => (
            <motion.div
              key={item.acres}
              className="acreage-card group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {/* Highlight badge */}
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/70">
                  {item.highlight}
                </span>
              </div>
              
              {/* Icon */}
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                  <item.icon className="w-7 h-7 text-white/80" />
                </div>
              </div>
              
              {/* Acres */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-display text-5xl font-bold text-white tracking-tight">
                  {item.acres}
                </span>
                <span className="text-lg text-white/60 font-medium">
                  Acres
                </span>
              </div>
              
              {/* Title */}
              <h3 className="font-display text-xl text-white font-semibold mb-5">
                {item.title}
              </h3>
              
              {/* Separator */}
              <div className="w-12 h-px bg-white/10 mb-5" />
              
              {/* Points */}
              <ul className="space-y-3">
                {item.points.map((point, pointIndex) => (
                  <li 
                    key={pointIndex}
                    className="flex items-start gap-3 text-sm text-white/60 leading-relaxed"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/40 mt-2 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              
              {/* Hover glow */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, hsla(154, 60%, 50%, 0.05) 0%, transparent 70%)'
                }}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Total bar */}
        <motion.div 
          className="mt-12 panel-premium p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-sm text-muted-foreground font-medium">Total Protected Area</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-3xl font-bold text-foreground">300</span>
                <span className="text-lg text-muted-foreground">Acres</span>
              </div>
            </div>
            
            {/* Progress visualization */}
            <div className="flex-1 max-w-md">
              <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-secondary">
                <div className="h-full bg-primary rounded-l-full" style={{ width: '53.3%' }} />
                <div className="h-full bg-primary/70" style={{ width: '33.3%' }} />
                <div className="h-full bg-primary/40 rounded-r-full" style={{ width: '13.4%' }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Vetiver (160)</span>
                <span>Agriculture (100)</span>
                <span>Urban (40)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AcreageGrid;
