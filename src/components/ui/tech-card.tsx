import React from "react";
import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedVisualization } from "./AnimatedVisualization";

interface TechCardProps {
    title: string;
    description: string;
    icon?: React.ElementType;
    image?: string;
    href: string;
    className?: string;
    delay?: number;
    children?: React.ReactNode;
    buttonText?: string;
    hideButton?: boolean;
    animationStage?: "source" | "diligence" | "track";
}

export const TechCard = ({
    title,
    description,
    icon: Icon,
    image,
    href,
    className,
    delay = 0,
    children,
    buttonText = "Explore",
    hideButton = false,
    animationStage,
}: TechCardProps) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const rotateX = useTransform(mouseY, [0, 400], [2, -2]);
    const rotateY = useTransform(mouseX, [0, 400], [-2, 2]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={cn(
                "group relative h-full rounded-3xl border border-green-500/30 bg-[#0D2821] backdrop-blur-[2px]",
                "transition-all duration-500 ease-out",
                // Enhanced Aceternity-style hover effects
                "hover:border-green-500/50",
                "hover:shadow-[0_20px_70px_-15px_rgba(22,101,52,0.2)]",
                "hover:-translate-y-2",
                className
            )}
            onMouseMove={handleMouseMove}
        >
            <Link to={href} className="flex flex-col h-full">
                {/* Spotlight Overlay */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(22, 101, 52, 0.1),
                transparent 80%
              )
            `,
                    }}
                />

                {/* Gradient Mesh Background (Aceternity-style) */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-teal-50/50 rounded-3xl" />
                </div>

                {/* Animation Section */}
                {animationStage && (
                    <div className="relative h-64 w-full overflow-hidden rounded-t-3xl bg-[#0a1f1a]">
                        <AnimatedVisualization stage={animationStage} />
                        {/* Gradient overlay for smooth transition to content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D2821]/80 to-transparent pointer-events-none" />
                    </div>
                )}

                {/* Image Section (Optional - only if no animation) */}
                {!animationStage && image && (
                    <div className="relative h-120 w-full overflow-hidden rounded-t-3xl">
                        <img
                            src={image}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-grow flex-col p-8">
                    {Icon && (
                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 text-green-700 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <Icon className="h-6 w-6" />
                        </div>
                    )}

                    <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
                    {description && (
                        <p className="mb-6 text-sm leading-relaxed text-gray-300 flex-grow">
                            {description}
                        </p>
                    )}

                    {!hideButton && (
                        <div className="mt-auto flex items-center text-green-400 font-medium text-sm group-hover:text-green-300 transition-colors">
                            {buttonText} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    )}
                </div>
            </Link>

            {/* Data Badges and other children content */}
            {children}
        </motion.div>
    );
};
