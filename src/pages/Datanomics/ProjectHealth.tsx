import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const ProjectHealth = () => {
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

    const section = document.getElementById("health");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const projects = [
    { 
      name: "Northern Sector", 
      status: "healthy", 
      canopy: "87%", 
      growth: "+12.3%",
      anomalies: 0,
      x: 20,
      y: 25
    },
    { 
      name: "Eastern Zone", 
      status: "warning", 
      canopy: "72%", 
      growth: "+8.1%",
      anomalies: 2,
      x: 70,
      y: 35
    },
    { 
      name: "Southern Plains", 
      status: "healthy", 
      canopy: "91%", 
      growth: "+15.7%",
      anomalies: 0,
      x: 40,
      y: 70
    },
    { 
      name: "Western Valley", 
      status: "critical", 
      canopy: "58%", 
      growth: "-2.3%",
      anomalies: 5,
      x: 15,
      y: 60
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'status-healthy';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return 'status-healthy';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle2;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      default: return CheckCircle2;
    }
  };

  return (
    <section id="health" className="py-32 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Project Health Matrix
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Real-time health monitoring across all project sectors
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Health Map */}
          <div className={`relative bg-card-deep rounded-3xl overflow-hidden shadow-float transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`} style={{ height: '500px' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" 
                style={{
                  backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }}
              />
            </div>

            {projects.map((project, index) => {
              const StatusIcon = getStatusIcon(project.status);
              const colorClass = getStatusColor(project.status);
              
              return (
                <div
                  key={index}
                  className={`absolute group cursor-pointer transition-all duration-1000 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{
                    left: `${project.x}%`,
                    top: `${project.y}%`,
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  {/* Status Indicator */}
                  <div className={`relative p-4 bg-${colorClass}/20 rounded-full border-2 border-${colorClass} shadow-float`}>
                    <StatusIcon className={`w-6 h-6 text-${colorClass}`} />
                  </div>

                  {/* Info Card */}
                  <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-10">
                    <div className="glass-card rounded-2xl p-6 shadow-float min-w-[280px]">
                      <h4 className="font-bold text-foreground mb-4 text-lg">{project.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-light">Canopy Cover</span>
                          <span className="font-medium text-foreground">{project.canopy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-light">Growth Rate</span>
                          <span className="font-medium text-foreground">{project.growth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-light">Anomalies</span>
                          <span className="font-medium text-foreground">{project.anomalies}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status List */}
          <div className="space-y-4">
            {projects.map((project, index) => {
              const StatusIcon = getStatusIcon(project.status);
              const colorClass = getStatusColor(project.status);
              
              return (
                <div
                  key={index}
                  className={`glass-card rounded-2xl p-6 hover-lift shadow-premium transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-${colorClass}/20`}>
                      <StatusIcon className={`w-6 h-6 text-${colorClass}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-3 text-lg">{project.name}</h4>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground font-light mb-1">Canopy</div>
                          <div className="font-semibold text-foreground">{project.canopy}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-light mb-1">Growth</div>
                          <div className="font-semibold text-foreground">{project.growth}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-light mb-1">Issues</div>
                          <div className="font-semibold text-foreground">{project.anomalies}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectHealth;
