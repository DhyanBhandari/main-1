import { motion } from "framer-motion";
import { WavyBackground } from "@/components/ui/wavy-background";

const HeroSection = () => {
  return (
    <WavyBackground
      containerClassName="min-h-[90vh]"
      className="max-w-5xl mx-auto px-6 text-center"
      backgroundFill="white"
      colors={["#22c55e", "#16a34a", "#4ade80", "#86efac", "#bbf7d0"]}
      waveOpacity={0.3}
      blur={10}
      speed="fast"
    >
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Eyebrow text */}
          <motion.p 
            className="text-sm font-medium tracking-[0.3em] uppercase text-primary/60 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Introducing
          </motion.p>
          
          {/* Main headline */}
          <motion.h1 
            className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <span className="block">Erthaloka</span>
            <span className="block text-gradient">Protected Assets</span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            The world's first liquid ownership model for pristine ecosystems
          </motion.p>
          
          {/* CTA buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mt-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {/* <button className="btn-premium font-display text-base">
              Explore Projects
            </button> */}
            {/* <button className="px-6 py-3 rounded-xl font-display text-base font-medium border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elegant">
              Learn More
            </button> */}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        {/* <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/20 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary/40"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div> */}
      </div>
    </WavyBackground>
  );
};

export default HeroSection;
