import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const ScrollIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col items-center gap-2 mt-16"
        >
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                Scroll to learn more
            </span>
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="p-2 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 shadow-sm"
            >
                <ChevronDown className="w-5 h-5 text-green-600" />
            </motion.div>
        </motion.div>
    );
};
