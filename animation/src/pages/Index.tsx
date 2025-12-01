import { StageCard } from "@/components/StageCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-lidar bg-clip-text text-transparent animate-fade-in">
            Data Flow Visualization
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Watch as data transforms and grows through each stage of the pipeline
          </p>
        </div>

        {/* Three Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <StageCard
            stage="source"
            title="Source"
            description="Initial data collection phase with foundational metrics"
          />
          
          <StageCard
            stage="diligence"
            title="Diligence"
            description="Validation and enrichment of data with increased detail"
          />
          
          <StageCard
            stage="track"
            title="Track"
            description="Complete monitoring with comprehensive insights"
          />
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center space-y-4 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
            <span className="text-sm text-muted-foreground">
              Powered by LiDAR-inspired visualization
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
