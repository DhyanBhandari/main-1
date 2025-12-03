"use client";

import { useEffect, useState } from "react";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

import partner1 from "@/assets/partners/rvs.jpeg";
import partner2 from "@/assets/partners/partner2.svg";
import partner3 from "@/assets/partners/partner3.svg";
import partner4 from "@/assets/partners/partner4.svg";
import partner5 from "@/assets/partners/partner5.svg";
import partner6 from "@/assets/partners/partner6.svg";

const PARTNERS_DATA = [
    { name: "River Venture Studio", role: "Innovation Hub - Singapore", logo: partner1 },
    { name: "AIC-PECF", role: "Atal Incubation Centre", logo: partner2 },
    { name: "T-Hub", role: "Ecosystem Partner", logo: partner3 },
    { name: "EICF", role: "European Indian Cooperation Forum", logo: partner4 },
    { name: "Pondy Friends", role: "Community Partner", logo: partner5 },
    { name: "Annapradokshana Charitable Trust", role: "Partner", logo: partner6 },
];

export function InfiniteScrollPartners() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        const intervalId = setInterval(() => {
            if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
                setCurrent(0);
                api.scrollTo(0);
            } else {
                api.scrollNext();
                setCurrent(current + 1);
            }
        }, 2000); // Slower interval for better readability

        return () => clearInterval(intervalId);
    }, [api, current]);

    return (
        <div className="w-full py-20 lg:py-40 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="flex flex-col gap-10">
                    <h2 className="text-xl md:text-3xl md:text-7xl tracking-tighter lg:max-w-xxl font-regular text-center text-primary">
                        Partners & Collaborators
                    </h2>
                    <Carousel setApi={setApi} className="w-full">
                        <CarouselContent>
                            {PARTNERS_DATA.map((partner, index) => (
                                <CarouselItem className="basis-1/2 md:basis-1/4 lg:basis-1/6" key={index}>
                                    <div className="flex flex-col gap-2 rounded-full aspect-square bg-muted items-center justify-center p-6 border border-border/50 hover:border-primary/50 transition-colors">
                                        <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain rounded-full" />
                                        <span className="text-xs font-medium text-muted-foreground text-center mt-2 sr-only">{partner.name}</span>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
            </div>
        </div>
    );
}
