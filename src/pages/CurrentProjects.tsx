

import HeroSection from "./epa/HeroSection";
import StatPanels from "./epa/StatPanels";
import AcreageGrid from "./epa/AcreageGrid";
import ProjectCatalog from "./epa/ProjectCatalog";
import Header  from "@/components/Header";
import Footer from "@/components/Footer";

const CurrentProjects = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <StatPanels />
      <AcreageGrid />
      <ProjectCatalog />
    
      
      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </main>
  );
};

export default CurrentProjects;
