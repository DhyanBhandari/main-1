import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface AudienceCardProps {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: React.ElementType;
  delay?: number;
}

const AudienceCard = ({
  title,
  subtitle,
  description,
  href,
  icon: Icon,
  delay = 0
}: AudienceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <Link to={href}>
        <Card className="group h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden">
          <CardContent className="p-0">
            {/* Top gradient bar */}
            <div className="h-2 bg-gradient-to-r from-[#0D2821] to-[#065f46]"></div>

            <div className="p-8">
              {/* Icon */}
              <div className="w-14 h-14 mb-6 rounded-2xl bg-green-100 flex items-center justify-center group-hover:bg-[#0D2821] transition-colors duration-300">
                <Icon className="h-7 w-7 text-[#0D2821] group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Subtitle label */}
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">
                {subtitle}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-[#0D2821] mb-3 group-hover:text-[#065f46] transition-colors duration-300">
                {title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {description}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-[#0D2821] font-semibold group-hover:text-[#065f46] transition-colors duration-300">
                <span>Learn More</span>
                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default AudienceCard;
