import Hero from "../pages/Datanomics/Hero";
import SensorMetrics from "../pages/Datanomics/SensorMetrics";
import ImpactDashboard from "../pages/Datanomics/ImpactDashboard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Data = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <SensorMetrics />
      <ImpactDashboard />
      <Footer />
    </main>
  );
};

export default Data;
