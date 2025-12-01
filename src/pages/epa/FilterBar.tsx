import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedAssetType: string;
  onAssetTypeChange: (value: string) => void;
  selectedTier: string;
  onTierChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedCategory,
  onCategoryChange,
  selectedAssetType,
  onAssetTypeChange,
  selectedTier,
  onTierChange,
  sortBy,
  onSortChange,
}: FilterBarProps) => {
  const selectClass = "filter-select appearance-none pr-10 cursor-pointer relative";
  
  return (
    <motion.div 
      className="panel-premium p-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by project name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none transition-colors"
          />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Region filter */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Regions</option>
              <option value="asia">Asia Pacific</option>
              <option value="americas">Americas</option>
              <option value="africa">Africa</option>
              <option value="europe">Europe</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          
          {/* Category filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Categories</option>
              <option value="conservation">Conservation</option>
              <option value="reforestation">Reforestation</option>
              <option value="agriculture">Agriculture</option>
              <option value="urban">Urban Green</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          
          {/* Asset Type filter */}
          <div className="relative">
            <select
              value={selectedAssetType}
              onChange={(e) => onAssetTypeChange(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Asset Types</option>
              <option value="land">Land</option>
              <option value="forest">Forest</option>
              <option value="wetland">Wetland</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          
          {/* Tier filter */}
          <div className="relative">
            <select
              value={selectedTier}
              onChange={(e) => onTierChange(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Tiers</option>
              <option value="premium">Premium</option>
              <option value="standard">Standard</option>
              <option value="starter">Starter</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={selectClass}
            >
              <option value="return">Highest Return</option>
              <option value="progress">Most Progress</option>
              <option value="newest">Newest First</option>
              <option value="health">Best Health</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          
          {/* Advanced filters toggle */}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;
