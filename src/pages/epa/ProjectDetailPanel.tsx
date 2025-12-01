import { motion, AnimatePresence } from "framer-motion";
import { X, TreePine, Wind, Droplets, Heart, TrendingUp, MapPin } from "lucide-react";
import { Project } from "./ProjectCard";

interface ProjectDetailPanelProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectDetailPanel = ({ project, isOpen, onClose }: ProjectDetailPanelProps) => {
  if (!project) return null;

  // Donut chart segments data
  const chartData = [
    { label: "Operations", value: 35, color: "hsl(154, 96%, 10%)" },
    { label: "Development", value: 25, color: "hsl(154, 60%, 25%)" },
    { label: "Reserve", value: 20, color: "hsl(154, 40%, 40%)" },
    { label: "Distribution", value: 20, color: "hsl(150, 20%, 60%)" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors z-10"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
            
            {/* Hero image */}
            <div className="relative h-72">
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              
              {/* Status and region */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <span className={`badge-status mb-2 inline-block ${project.status === 'active' ? 'badge-active' : 'badge-planning'}`}>
                    {project.status}
                  </span>
                  <h2 className="font-display text-3xl font-bold text-foreground">
                    {project.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{project.country}</span>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              {/* Key metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="panel-premium p-4 text-center">
                  <TreePine className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-foreground">{project.treesCount}</p>
                  <p className="text-xs text-muted-foreground">Trees Planted</p>
                </div>
                <div className="panel-premium p-4 text-center">
                  <Wind className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-foreground">{project.co2Captured}</p>
                  <p className="text-xs text-muted-foreground">CO₂ Captured</p>
                </div>
                <div className="panel-premium p-4 text-center">
                  <Droplets className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-foreground">{project.waterSaved}</p>
                  <p className="text-xs text-muted-foreground">Water Saved</p>
                </div>
                <div className="panel-premium p-4 text-center">
                  <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-foreground">{project.health}%</p>
                  <p className="text-xs text-muted-foreground">Health Score</p>
                </div>
              </div>
              
              {/* Financial overview */}
              <div className="mb-10">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Financial Overview
                </h3>
                
                <div className="panel-premium p-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Donut chart */}
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {chartData.reduce((acc, segment, index) => {
                          const offset = acc.offset;
                          const circumference = 2 * Math.PI * 35;
                          const segmentLength = (segment.value / 100) * circumference;
                          
                          acc.elements.push(
                            <circle
                              key={segment.label}
                              cx="50"
                              cy="50"
                              r="35"
                              fill="none"
                              stroke={segment.color}
                              strokeWidth="12"
                              strokeDasharray={`${segmentLength} ${circumference}`}
                              strokeDashoffset={-offset}
                              className="transition-all duration-500"
                            />
                          );
                          
                          acc.offset += segmentLength;
                          return acc;
                        }, { elements: [] as JSX.Element[], offset: 0 }).elements}
                      </svg>
                      
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display text-2xl font-bold text-foreground">{project.returnRate}</span>
                        <span className="text-xs text-muted-foreground">Est. Return</span>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {chartData.map((segment) => (
                        <div key={segment.label} className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: segment.color }}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{segment.value}%</p>
                            <p className="text-xs text-muted-foreground">{segment.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Project story */}
              <div className="mb-10">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Project Story
                </h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="leading-relaxed">
                    This conservation project represents a groundbreaking approach to ecosystem protection 
                    and sustainable land management. Through innovative nature-based solutions, we're 
                    restoring critical habitats while generating measurable environmental and financial returns.
                  </p>
                  <p className="leading-relaxed mt-4">
                    Local communities are at the heart of this initiative, with training programs and 
                    employment opportunities creating lasting economic benefits. The project employs 
                    cutting-edge monitoring systems to track biodiversity, carbon sequestration, and 
                    water quality improvements in real-time.
                  </p>
                </div>
              </div>
              
              {/* Progress section */}
              <div className="mb-10">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Implementation Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Overall Progress</span>
                      <span className="text-sm font-semibold text-foreground">{project.progress}%</span>
                    </div>
                    <div className="progress-premium h-3">
                      <div 
                        className="progress-premium-fill"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA buttons */}
              <div className="flex gap-4">
                <button className="btn-premium flex-1 font-display">
                  Invest Now
                </button>
                <button className="flex-1 px-6 py-3 rounded-xl font-display font-medium border border-border hover:border-primary/30 transition-all duration-300">
                  Download Report
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailPanel;
