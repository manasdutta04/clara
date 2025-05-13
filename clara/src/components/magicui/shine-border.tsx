import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  className?: string;
  shineColor?: string | string[];
  size?: number;
  interval?: number;
  duration?: number;
  borderWidth?: number;
  delay?: number;
  borderRadius?: number;
  as?: React.ElementType;
}

export function ShineBorder({
  className,
  shineColor = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  size = 500,
  interval = 4000,
  duration = 2000,
  borderWidth = 1,
  delay = 0,
  borderRadius = 12,
  as: Component = "div",
}: ShineBorderProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor];

  useEffect(() => {
    // Add a delay before starting the animation
    const timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        setPosition({ x, y });
      }, interval);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [interval, delay]);

  return (
    <Component
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      style={{ 
        borderRadius: borderRadius,
      }}
    >
      <div
        className="absolute inset-0 opacity-0"
        style={{
          borderRadius: borderRadius,
          border: `${borderWidth}px solid transparent`,
          background: `linear-gradient(135deg, ${colors.join(", ")}) border-box`,
          WebkitMask: `
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0)
          `,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: 1,
        }}
      />
      <div
        className="absolute"
        style={{
          top: `calc(${position.y}% - ${size / 2}px)`,
          left: `calc(${position.x}% - ${size / 2}px)`,
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(
            circle at center,
            ${colors[0]} 0%,
            transparent 70%
          )`,
          filter: "blur(60px)",
          borderRadius: "50%",
          opacity: 0.3,
          transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      />
    </Component>
  );
} 