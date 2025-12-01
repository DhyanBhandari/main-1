import { Card } from "@/components/ui/card";
import { AnimatedVisualization } from "./AnimatedVisualization";

interface StageCardProps {
  stage: "source" | "diligence" | "track";
  title: string;
  description: string;
}

export const StageCard = ({ stage, title, description }: StageCardProps) => {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-lidar bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4">{description}</p>
      </div>
      
      <div className="h-64 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent pointer-events-none z-10" />
        <AnimatedVisualization stage={stage} />
      </div>
    </Card>
  );
};
