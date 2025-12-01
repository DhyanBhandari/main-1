import { useEffect, useState } from "react";
import { MapPin, Layers, Navigation } from "lucide-react";

const MapView = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("map");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const locations = [
    { x: 25, y: 30, label: "Sensor Hub Alpha" },
    { x: 60, y: 45, label: "Sensor Hub Beta" },
    { x: 40, y: 70, label: "Sensor Hub Gamma" },
  ];

  return (
    <section id="map" className="py-32 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Earth Intelligence Map
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Geo-spatial visualization of project boundaries and sensor networks
          </p>
        </div>

        <div className={`relative bg-card-deep rounded-3xl overflow-hidden shadow-float transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`} style={{ height: '600px' }}>
          {/* Map Background with Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
              style={{
                backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

          {/* Project Boundary */}
          <svg className="absolute inset-0 w-full h-full">
            <path
              d="M 100 150 Q 300 100, 500 180 T 900 200 L 850 450 Q 600 520, 300 480 T 150 400 Z"
              fill="hsl(var(--primary) / 0.1)"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              className="animate-pulse-glow"
            />
          </svg>

          {/* Sensor Locations */}
          {locations.map((loc, index) => (
            <div
              key={index}
              className={`absolute transition-all duration-1000 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                transitionDelay: `${index * 200 + 500}ms`,
              }}
            >
              <div className="relative group cursor-pointer">
                {/* Ping Animation */}
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                
                {/* Pin */}
                <div className="relative bg-primary rounded-full p-3 shadow-float">
                  <MapPin className="w-6 h-6 text-primary-foreground" />
                </div>

                {/* Label */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  <div className="glass-card text-foreground px-4 py-2 rounded-xl text-sm font-medium shadow-premium">
                    {loc.label}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-6 left-6 glass-card rounded-2xl p-6 shadow-premium">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-primary" />
                <span className="text-sm font-light text-foreground">NDVI Layers</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-light text-foreground">Sensor Hubs</span>
              </div>
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-primary" />
                <span className="text-sm font-light text-foreground">Boundaries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapView;
