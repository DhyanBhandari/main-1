"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, User, Star } from "lucide-react";
import mentorImage from "@/assets/partners/mentor.png";

interface TeamMember {
    name: string;
    role: string;
    img: string;
    featured?: boolean;
    description?: string;
    lines?: string[];
}

const teamMembers: TeamMember[] = [
    {
        name: "Dr. VIVEKA KALIDASAN, Ph.D",
        role: "Mentor/Advisor",
        img: mentorImage,
        description: "Founder & CEO | River Venture Studio Global",
        lines: [
            "Thought Leader in Industry 5.0/4.0",
            "Deeptech Venture Builder AI/ML",
            "MIT 35 Innovators Under 35",
            "SG Top 100 Women in Tech",
            "NUS Outstanding Young Alumni",
        ],
    },
    {
        name: "RAMACHANDRAN KP",
        role: "Founder @ ErthaLoka",
        img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80&auto=format&fit=crop",
        description: "Founder | Travellers Tribe & Learning Expedition",
        lines: [
            "Co‑Founder – Dream Holidays",
            "TOP 400 Ideas (2016) – IIMA",
            "TOP 50 Ideas (2016) – IIMC",
            "Pre‑Incubated (2018) – IIMB NSRCEL",
            "Ex‑Accenture, Tesco & C‑Cubed Solutions",
        ],
    },
    {
        name: "RAJARAJAN RATHINAVELU",
        role: "Advisor",
        img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&auto=format&fit=crop",
        description: "Founder & MD | Keyleer Automation Solutions UG",
        lines: [
            "Member of Board of Directors – Young Seed Educational Trust",
            "Europa–Universität Flensburg: Ph.D – Energy Planning",
            "Hochschule Flensburg: Masters – Wind Energy Engineering",
        ],
    },
    {
        name: "SURYA PRAKASH",
        role: "CTO @ ErthaLoka",
        img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&auto=format&fit=crop",
        description: "Blockchain | Design | Web-development",
        lines: [
            "B.Tech – Dayanand Sagar College of Engineering",
            "5+ years experience in Blockchain",
            "Cloud Infra | AR & VR | DevOps | AI",
        ],
    },
    {
        name: "ARUN PRAKASH AMBATHY",
        role: "Advisor",
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop",
        description: "Resource Person | Auroville Forest Group",
        lines: [
            "Special Forces Veteran – Indian Army",
            "Founder @ Ambathy Nature Research Foundation",
            "Spear Heading projects Ecological Planning & Assessments",
        ],
    },
    {
        name: "PRAVIN KUMAR",
        role: "Impact Officer",
        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80&auto=format&fit=crop",
        description: "Founder | Green Shadows",
        lines: [
            "MSW (Gold Medalist)",
            "Recipient of the Changemaker Award from TYCL",
            "50,000 native trees planted",
            "12 urban forest projects created",
        ],
    },
];

export function TeamCarousel() {
    const [activeIndex, setActiveIndex] = useState(2);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-rotate effect
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % teamMembers.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % teamMembers.length);
        setIsAutoPlaying(false);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
        setIsAutoPlaying(false);
    };

    const getCardStyle = (index: number) => {
        const total = teamMembers.length;
        // Calculate relative position accounting for wrap-around
        let relativePos = (index - activeIndex) % total;
        if (relativePos > total / 2) relativePos -= total;
        if (relativePos < -total / 2) relativePos += total;

        // Styles based on relative position
        if (relativePos === 0) {
            return {
                transform: "translateX(0) scale(1) rotateY(0deg)",
                opacity: 1,
                zIndex: 10,
                filter: "brightness(1)",
                boxShadow: "0 20px 60px rgba(16, 185, 129, 0.2)", // Emerald shadow
            };
        } else if (relativePos === 1) {
            return {
                transform: "translateX(180px) scale(0.9) rotateY(-10deg)",
                opacity: 0.8,
                zIndex: 5,
                filter: "brightness(0.75)",
            };
        } else if (relativePos === -1) {
            return {
                transform: "translateX(-180px) scale(0.9) rotateY(10deg)",
                opacity: 0.8,
                zIndex: 5,
                filter: "brightness(0.75)",
            };
        } else if (relativePos === 2) {
            return {
                transform: "translateX(360px) scale(0.85) rotateY(-20deg)",
                opacity: 0.5,
                zIndex: 2,
                filter: "brightness(0.6)",
            };
        } else if (relativePos === -2) {
            return {
                transform: "translateX(-360px) scale(0.85) rotateY(20deg)",
                opacity: 0.5,
                zIndex: 2,
                filter: "brightness(0.6)",
            };
        } else {
            // Back cards - keep them in the flow but hidden/behind
            return {
                transform: "translateX(0) scale(0.7) rotateY(0deg)",
                opacity: 0,
                zIndex: 0,
                filter: "brightness(0.5)",
            };
        }
    };

    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
            <div className="container px-4 mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20 uppercase tracking-wider mb-4">
                    <User className="w-3 h-3" />
                    Team
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Meet the Visionaries
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                    The humans behind the mission. Builders, dreamers, and stewards of the planet.
                </p>
            </div>

            <div className="relative h-[600px] flex items-center justify-center perspective-1000">
                {/* Navigation Buttons */}
                <button
                    onClick={handlePrev}
                    className="absolute left-4 md:left-10 z-30 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-all shadow-lg"
                    aria-label="Previous member"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute right-4 md:right-10 z-30 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-all shadow-lg"
                    aria-label="Next member"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Cards Container */}
                <div className="relative w-full max-w-md h-[500px] flex items-center justify-center perspective-[1200px]">
                    {teamMembers.map((member, index) => {
                        const style = getCardStyle(index);
                        const isActive = index === activeIndex;

                        return (
                            <motion.div
                                key={index}
                                className={`absolute w-80 h-[480px] rounded-3xl overflow-hidden bg-card border border-border/50 transition-all duration-500 ease-out ${isActive ? "ring-2 ring-primary/50" : ""
                                    }`}
                                initial={false}
                                animate={style}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                {/* Image */}
                                <div className="h-full w-full relative">
                                    <img
                                        src={member.img}
                                        alt={member.name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Featured Badge */}
                                    {member.featured && (
                                        <div className="absolute top-6 right-6">
                                            <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                                                <Star className="w-3 h-3 fill-current" />
                                                Featured
                                            </div>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs ring-1 ring-white/20 mb-3 text-white">
                                            <User className="w-3 h-3" />
                                            {member.role}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                                            {member.name}
                                        </h3>
                                        {member.description && (
                                            <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                                                {member.description}
                                            </p>
                                        )}
                                        {member.lines && (
                                            <div className="space-y-1">
                                                {member.lines.slice(0, 2).map((line, i) => (
                                                    <p key={i} className="text-xs text-gray-400 line-clamp-1">
                                                        • {line}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
