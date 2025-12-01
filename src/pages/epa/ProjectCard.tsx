import { motion } from "framer-motion";
import { TreePine, Droplets, Wind, Heart } from "lucide-react";

export interface Project {
  id: string;
  name: string;
  image: string;
  status: "active" | "planning";
  region: string;
  country: string;
  co2Captured: string;
  treesCount: string;
  waterSaved: string;
  health: number;
  progress: number;
  category: string;
  tier: string;
  returnRate: string;
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  return (
    <motion.div
      className="project-card cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={`badge-status ${project.status === 'active' ? 'badge-active' : 'badge-planning'}`}>
            {project.status}
          </span>
        </div>
        
        {/* Region tag */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md text-white">
            {project.region}
          </span>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Country */}
        <div className="absolute bottom-4 left-4">
          <span className="text-white/90 text-sm font-medium">{project.country}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4 line-clamp-1">
          {project.name}
        </h3>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <Wind className="w-4 h-4 text-primary/70" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CO₂ Captured</p>
              <p className="text-sm font-semibold text-foreground">{project.co2Captured}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <TreePine className="w-4 h-4 text-primary/70" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trees</p>
              <p className="text-sm font-semibold text-foreground">{project.treesCount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-primary/70" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Water Saved</p>
              <p className="text-sm font-semibold text-foreground">{project.waterSaved}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary/70" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Health</p>
              <p className="text-sm font-semibold text-foreground">{project.health}%</p>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Project Progress</span>
            <span className="text-xs font-semibold text-foreground">{project.progress}%</span>
          </div>
          <div className="progress-premium">
            <div 
              className="progress-premium-fill"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default ProjectCard;
