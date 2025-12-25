/**
 * NaturalCapitalSection.tsx - Natural Capital Value Section
 *
 * Two-column layout:
 * - Left: Title, description, and timeline features
 * - Right: Three visible cards side by side with stacking effect
 *
 * Matches the zinc dotted background of other sections.
 *
 * @author ErthaLoka Dev Team
 */

import { motion } from "framer-motion";
import { Database, ShieldCheck, TrendingUp } from "lucide-react";
import measureImg from "@/assets/new/Measure-NAC.png";
import verifyImg from "@/assets/new/Verify-dinac.png";
import valueImg from "@/assets/new/value-dinac.png";

// Card data for Measure, Verify, Value
const processCards = [
    {
        id: "measure",
        step: 1,
        title: "MEASURE",
        description: "Capture ecosystem data using AI, IoT sensors, and remote sensing.",
        image: measureImg,
        bgColor: "bg-amber-500",
    },
    {
        id: "verify",
        step: 2,
        title: "VERIFY",
        description: "Ensure data integrity and transparency with blockchain.",
        image: verifyImg,
        bgColor: "bg-teal-700",
    },
    {
        id: "value",
        step: 3,
        title: "VALUE",
        description: "Transform verified performance into investable assets.",
        image: valueImg,
        bgColor: "bg-teal-900",
    },
];

// Timeline features data
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
        title: "Global Value",
        description:
            "Verified ecosystem performance becomes an investable asset with appreciating Natural Capital Value.",
        icon: TrendingUp,
    },
];

const NaturalCapitalSection = () => {
    return (
        <section className="py-20 relative">
            <div className="container px-6 mx-auto">
                {/* Two Column Layout - Equal Height */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-stretch">

                    {/* LEFT COLUMN - Title, Description & Timeline */}
                    <div className="space-y-8 flex flex-col">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-6 leading-[1.1]">
                                Natural Capital Value
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Each verified ecosystem becomes a measurable, investable asset. We transform environmental data into financial value.
                            </p>
                        </motion.div>

                        {/* Timeline Features */}
                        <div className="relative pl-8 flex-grow">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200">
                                <motion.div
                                    className="w-full bg-green-500"
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
                                        <div className="absolute -left-8 top-1 w-6 h-6 rounded-full border-2 border-green-500 bg-white flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Three Cards Side by Side with Stacking Effect */}
                    <div className="relative flex items-center justify-center">
                        <div className="flex gap-2 sm:gap-3 w-full justify-center">
                            {processCards.map((card, index) => {
                                // Slight vertical offset for stacking effect
                                const topOffset = index * 12;

                                return (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, y: 50, x: -30 }}
                                        whileInView={{ opacity: 1, y: 0, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.15,
                                            ease: "easeOut"
                                        }}
                                        className={`relative ${card.bgColor} rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col w-[130px] sm:w-[150px] lg:w-[170px]`}
                                        style={{
                                            marginTop: `${topOffset}px`,
                                            height: '450px',
                                        }}
                                    >
                                        {/* Step Badge - Top Left Corner */}
                                        <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-900 font-bold text-base shadow-lg z-10">
                                            {card.step}
                                        </div>

                                        {/* Card Image - 75% of card */}
                                        <div className="relative h-[75%] overflow-hidden">
                                            <img
                                                src={card.image}
                                                alt={card.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                        </div>

                                        {/* Card Content - 25% of card */}
                                        <div className="h-[25%] p-3 sm:p-4 flex flex-col justify-start text-white">
                                            {/* Title */}
                                            <h3 className="text-base sm:text-lg font-bold tracking-wide mb-2">
                                                {card.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-[11px] sm:text-xs text-white/90 leading-relaxed">
                                                {card.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NaturalCapitalSection;
