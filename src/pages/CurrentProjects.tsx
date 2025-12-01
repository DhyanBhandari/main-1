

import HeroSection from "./EPA/HeroSection";
import StatPanels from "./EPA/StatPanels";
import AcreageGrid from "./EPA/AcreageGrid";
import ProjectCatalog from "./EPA/ProjectCatalog";
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
