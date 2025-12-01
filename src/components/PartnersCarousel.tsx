import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PHIModal } from "./PHIModal";

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  category: string;
}

const carouselData: CarouselItem[] = [
  {
    id: 1,
    title: "AI-Powered Ecosystem Analysis",
    description: "Leveraging machine learning to identify patterns and quantify ecosystem performance with unprecedented precision.",
    category: "Technology",
  },
  {
    id: 2,
    title: "Satellite Intelligence Platform",
    description: "High-resolution satellite imagery from Landsat and Sentinel continuously monitors ecosystem health across millions of hectares.",
    category: "Technology",
  },
  {
    id: 3,
    title: "Blockchain Data Verification",
    description: "Ensuring transparent, immutable data integrity through decentralized verification and smart contracts.",
    category: "Technology",
  },
  {
    id: 4,
    title: "IoT Sensor Networks",
    description: "Ground-based sensors capture real-time data on soil, water, air quality, and biodiversity metrics.",
    category: "Technology",
  },
  {
    id: 5,
    title: "Natural Capital Valuation",
    description: "Proprietary frameworks that quantify ecological performance and translate it into financial value.",
    category: "Innovation",
  },
];

export const PartnersCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % carouselData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % carouselData.length);
  };

  return (
    <section className="py-24   text-#0d2821">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-dot-white/20" />
      </div>

      <div className="container px-6 mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-#0d2821 mb-4"
          >
            Our Technology 
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-#0d2821"
          >
            Powering the future of Planet Preservation
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Carousel Container */}
          <div className="relative min-h-[320px] md:h-80 flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full"
              >
                <div className="bg-[#0d2821] backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
                  <div className="flex flex-col items-center text-center">
                    <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-green-400/20 border border-green-400/30 text-green-100 text-sm font-semibold">
                      {carouselData[currentIndex].category}
                    </span>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                      {carouselData[currentIndex].title}
                    </h3>

                    <p className="text-sm sm:text-base md:text-lg text-green-50 leading-relaxed max-w-2xl">
                      {carouselData[currentIndex].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-[90%] sm:w-[85%] md:w-[80%] mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-[#0d2821] shadow-inner text-white rounded-full text-xl sm:text-2xl md:text-3xl font-bold mb-12 transition-all duration-300 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center gap-2"
          >
            Get your Planetary Health Index <br />
            <Download className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 font-bold animate-pulse" />
            <div className="text-sm">
              <p>(Inguidelines with SEEA)</p>
              </div>
          </button>
        </div>
      </div>

      {/* PHI Modal */}
      <PHIModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};
