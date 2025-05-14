"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface InteractiveGridPatternProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The number of points in the grid pattern. */
  count?: number;
  /** The duration of the point animations. */
  pointDuration?: number;
  /** The color of the grid lines, defaults to current text color. */
  lineColor?: string;
  /** The color of the points, defaults to current text color. */
  pointColor?: string;
  /** The size of the points. */
  pointSize?: number;
  /** Whether the component should listen to cursor movement. */
  interactive?: boolean;
  /** The influence distance of the cursor on points. */
  cursorEffect?: number;
}

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
};

export function InteractiveGridPattern({
  className,
  count = 25,
  pointDuration = 2000,
  lineColor = "currentColor",
  pointColor = "currentColor",
  pointSize = 1.5,
  interactive = true,
  cursorEffect = 150,
  ...props
}: InteractiveGridPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState<Array<{ x: number; y: number; delay: number }>>([]);

  // Update dimensions and generate points
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });

      const cols = Math.max(5, Math.floor(Math.sqrt(count * (rect.width / rect.height))));
      const rows = Math.max(5, Math.floor(Math.sqrt(count * (rect.height / rect.width))));
      
      const xStep = rect.width / cols;
      const yStep = rect.height / rows;
      
      const newPoints = [];
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          newPoints.push({
            x: i * xStep,
            y: j * yStep,
            delay: Math.random() * 1000,
          });
        }
      }

      setPoints(newPoints);
    }

    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden text-slate-800/10 dark:text-slate-200/10", className)}
      {...props}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        {/* Grid lines */}
        {points.map((point, pointIndex) => {
          // We create a line for each point to its neighbors
          return points
            .filter((neighbor, neighborIndex) => {
              // Only draw lines to neighbors that are close enough but not the same point
              if (pointIndex === neighborIndex) return false;
              
              const dx = point.x - neighbor.x;
              const dy = point.y - neighbor.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Only connect to close neighbors (typically just horizontally and vertically)
              return distance < Math.max(dimensions.width, dimensions.height) / 10;
            })
            .map((neighbor, lineIndex) => (
              <line
                key={`${pointIndex}-${lineIndex}`}
                x1={point.x}
                y1={point.y}
                x2={neighbor.x}
                y2={neighbor.y}
                stroke={lineColor}
                strokeWidth="0.5"
                strokeOpacity="0.15"
              />
            ));
        })}
        
        {/* Grid points */}
        {points.map((point, index) => {
          let x = point.x;
          let y = point.y;
          
          // If interactive, apply cursor influence
          if (interactive && mousePosition) {
            const dx = mousePosition.x - (containerRef.current?.getBoundingClientRect().left || 0) - point.x;
            const dy = mousePosition.y - (containerRef.current?.getBoundingClientRect().top || 0) - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < cursorEffect) {
              const intensity = (cursorEffect - distance) / cursorEffect;
              x += dx * intensity * 0.2;
              y += dy * intensity * 0.2;
            }
          }
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={pointSize}
              fill={pointColor}
              opacity="0.4"
              className="animate-pulse"
              style={{
                animationDuration: `${pointDuration}ms`,
                animationDelay: `${point.delay}ms`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
} 