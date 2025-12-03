// DNAC or Di-NCA PAGE IN HOMEPAGE
import { motion } from "framer-motion";
import { Database, ShieldCheck, TrendingUp } from "lucide-react";
import measureImg from "@/assets/measure.png";
import verifyImg from "@/assets/verify.png";
import valueImg from "@/assets/value.png";

// Flow steps data
const flowSteps = [
    {
        id: "measure",
        title: "MEASURE",
        subtitle: "Real-time Intelligence",
        image: measureImg,
    },
    {
        id: "verify",
        title: "VERIFY",
        subtitle: "Trusted Data Integrity",
        image: verifyImg,
    },
    {
        id: "value",
        title: "VALUE",
        subtitle: "Financial Value",
        image: valueImg,
    },
];

const features = [
    {
        title: "Real-time Intelligence",
        description:
            "AI, IoT sensors, and remote sensing data work together to capture comprehensive ecosystem data in real-time.",
        icon: Database,
    },
    {
        title: "Trusted Verification",
        description:
            "The Technology ensures complete data integrity and transparency, creating a trusted foundation.",
        icon: ShieldCheck,
    },
    {
        title: "Global Impact",
        description:
            "Verified ecosystem performance becomes an appreciating Digital Natural Capital Asset.",
        icon: TrendingUp,
    },
];

const NaturalCapitalSection = () => {
    return (
        <section className="py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="container px-4 mx-auto">
                <div className="relative bg-[#0D2821] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border p-6 sm:p-8 md:p-12 lg:p-16 overflow-hidden shadow-2xl">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-3xl opacity-60" />
                        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-3xl opacity-60" />
                    </div>

                    <div className="relative z-10">
                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                            {/* LEFT COLUMN - Title, Description & Timeline */}
                            <div className="space-y-6">
                                {/* Header */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.1]">
                                        Digital Natural Capital Assets
                                    </h2>
                                    <p className="text-base sm:text-lg text-gray-200 font-normal leading-relaxed">
                                        Each verified ecosystem becomes a measurable, appreciating asset. We transform environmental data into financial value.
                                    </p>
                                </motion.div>

                                {/* Timeline Features */}
                                <div className="relative pl-8">
                                    {/* Vertical Timeline Line */}
                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/20">
                                        <motion.div
                                            className="w-full bg-green-400"
                                            initial={{ height: "0%" }}
                                            whileInView={{ height: "100%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                        />
                                    </div>

                                    {/* Feature Items */}
                                    <div className="space-y-8">
                                        {features.map((feature, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                                                className="relative"
                                            >
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full border-2 border-white/40 bg-[#0D2821] flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white/60" />
                                                </div>

                                                {/* Content */}
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-2">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-300 leading-relaxed">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN - Staircase Images */}
                            <div className="relative flex flex-col gap-3 lg:gap-4">
                                {flowSteps.map((step, index) => {
                                    // Staircase offset: each card moves more to the right
                                    const leftOffset = index * 20; // 0px, 20px, 40px

                                    return (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, x: 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: index * 0.2 }}
                                            className="relative group"
                                            style={{ marginLeft: `${leftOffset}px` }}
                                        >
                                            {/* Image Container - Smaller size */}
                                            <div className="relative rounded-xl overflow-hidden shadow-lg border border-white/10 w-full max-w-[280px] lg:max-w-[320px] aspect-[16/10]">
                                                <img
                                                    src={step.image}
                                                    alt={step.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                />
                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                                {/* Text Overlay */}
                                                <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-20">
                                                    <p className="text-[10px] sm:text-xs font-bold text-green-400 tracking-wider uppercase drop-shadow-lg mb-0.5">
                                                        {step.title}
                                                    </p>
                                                    <p className="text-xs sm:text-sm font-semibold text-white drop-shadow-lg">
                                                        {step.subtitle}
                                                    </p>
                                                </div>

                                                {/* Step Number Badge */}
                                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NaturalCapitalSection;
