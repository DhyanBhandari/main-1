import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-30">
        <img 
          src={heroBackground} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Icon */}
          <div className="flex justify-center mb-8 animate-float">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <Activity className="w-12 h-12 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-hero md:text-display font-bold text-foreground mb-6 tracking-tight">
            Datanomics Engine
          </h1>

          {/* Subheading */}
          <p className="text-2xl md:text-4xl font-semibold text-foreground mb-4 max-w-4xl mx-auto leading-tight">
            Real-time Planetary Intelligence Engine.
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Environmental data, impact analytics, and project health unified in a single intelligence layer.
          </p>

          {/* Animated Line */}
          <div className="mt-16 flex justify-center">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse-glow rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
