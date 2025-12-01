
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ProjectCard, { Project } from "./ProjectCard";
import FilterBar from "./FilterBar";
import ProjectDetailPanel from "./ProjectDetailPanel";

// Sample project data
const projectsData: Project[] = [
  {
    id: "1",
    name: "vettiver Deployement",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80",
    status: "active",
    region: "Tamil nadu",
    country: "India",
    co2Captured: "12.4K tons",
    treesCount: "45,000",
    waterSaved: "2.1M gal",
    health: 94,
    progress: 78,
    category: "conservation",
    tier: "premium",
    returnRate: "8.2%"
  },
  {
    id: "2",
    name: "Urban Forest",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
    status: "active",
    region: "Asia Pacific",
    country: "Indonesia",
    co2Captured: "8.7K tons",
    treesCount: "32,000",
    waterSaved: "1.5M gal",
    health: 89,
    progress: 65,
    category: "reforestation",
    tier: "premium",
    returnRate: "7.8%"
  },
  {
    id: "3",
    name: "Chemical-free Farming",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
    status: "active",
    region: "Africa",
    country: "Kenya",
    co2Captured: "6.2K tons",
    treesCount: "28,000",
    waterSaved: "980K gal",
    health: 91,
    progress: 82,
    category: "conservation",
    tier: "standard",
    returnRate: "6.5%"
  },
  // {
  //   id: "4",
  //   name: "Costa Rica Cloud Forest",
  //   image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  //   status: "planning",
  //   region: "Americas",
  //   country: "Costa Rica",
  //   co2Captured: "4.1K tons",
  //   treesCount: "18,500",
  //   waterSaved: "720K gal",
  //   health: 96,
  //   progress: 35,
  //   category: "conservation",
  //   tier: "premium",
  //   returnRate: "9.1%"
  // },
  // {
  //   id: "5",
  //   name: "Philippines Mangrove Belt",
  //   image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80",
  //   status: "active",
  //   region: "Asia Pacific",
  //   country: "Philippines",
  //   co2Captured: "5.8K tons",
  //   treesCount: "22,000",
  //   waterSaved: "1.2M gal",
  //   health: 87,
  //   progress: 71,
  //   category: "reforestation",
  //   tier: "standard",
  //   returnRate: "7.2%"
  // },
  // {
  //   id: "6",
  //   name: "Madagascar Biodiversity Zone",
  //   image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
  //   status: "active",
  //   region: "Africa",
  //   country: "Madagascar",
  //   co2Captured: "7.3K tons",
  //   treesCount: "35,000",
  //   waterSaved: "890K gal",
  //   health: 92,
  //   progress: 58,
  //   category: "conservation",
  //   tier: "premium",
  //   returnRate: "8.5%"
  // },
  // {
  //   id: "7",
  //   name: "Singapore Urban Canopy",
  //   image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  //   status: "active",
  //   region: "Asia Pacific",
  //   country: "Singapore",
  //   co2Captured: "2.1K tons",
  //   treesCount: "8,500",
  //   waterSaved: "340K gal",
  //   health: 98,
  //   progress: 92,
  //   category: "urban",
  //   tier: "starter",
  //   returnRate: "5.8%"
  // },
  // {
  //   id: "8",
  //   name: "Peru Andes Watershed",
  //   image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  //   status: "planning",
  //   region: "Americas",
  //   country: "Peru",
  //   co2Captured: "3.5K tons",
  //   treesCount: "15,000",
  //   waterSaved: "2.8M gal",
  //   health: 85,
  //   progress: 22,
  //   category: "agriculture",
  //   tier: "standard",
  //   returnRate: "6.9%"
  // },
];

const ProjectCatalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAssetType, setSelectedAssetType] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [sortBy, setSortBy] = useState("return");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    let filtered = projectsData.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "all" || project.region.toLowerCase().includes(selectedRegion);
      const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
      const matchesTier = selectedTier === "all" || project.tier === selectedTier;
      
      return matchesSearch && matchesRegion && matchesCategory && matchesTier;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "return":
          return parseFloat(b.returnRate) - parseFloat(a.returnRate);
        case "progress":
          return b.progress - a.progress;
        case "health":
          return b.health - a.health;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedRegion, selectedCategory, selectedAssetType, selectedTier, sortBy]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            EPA Project Catalog
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our portfolio of protected assets across the globe
          </p>
        </motion.div>

        {/* Filter bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedAssetType={selectedAssetType}
          onAssetTypeChange={setSelectedAssetType}
          selectedTier={selectedTier}
          onTierChange={setSelectedTier}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredProjects.length}</span> projects
          </p>
        </div>

        {/* Project grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <ProjectCard
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No projects match your criteria</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedRegion("all");
                setSelectedCategory("all");
                setSelectedTier("all");
              }}
              className="mt-4 text-primary font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Project detail panel */}
        <ProjectDetailPanel
          project={selectedProject}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
        />
      </div>
    </section>
  );
};

export default ProjectCatalog;
