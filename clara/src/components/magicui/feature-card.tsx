import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        "group relative overflow-hidden rounded-lg bg-gray-950/50 p-4 border border-gray-800/50 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30",
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-all duration-300">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-semibold text-white group-hover:text-blue-200 transition-colors duration-300">{title}</h3>
      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 line-clamp-3">{description}</p>
      
      {/* Shine effect on hover */}
      <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-300/10 to-transparent rounded-lg blur-sm" />
      </div>
      
      {/* Bottom line accent */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-blue-300 group-hover:w-full transition-all duration-700 ease-out"></div>
    </motion.div>
  );
}; 