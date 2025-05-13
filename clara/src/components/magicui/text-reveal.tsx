"use client";

import React from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { ComponentPropsWithoutRef, FC, ReactNode, useRef } from "react";

import { cn } from "@/lib/utils";

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  // Get text content from children, handling both string and ReactNode
  let textContent = "";
  if (typeof children === "string") {
    textContent = children;
  } else if (React.isValidElement(children)) {
    // Extract text from the child element
    const childrenText = children.props.children;
    if (typeof childrenText === "string") {
      textContent = childrenText;
    } else {
      console.warn("TextReveal: Unable to extract text from children");
      textContent = ""; // Fallback
    }
  }

  const words = textContent.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0", className)}>
      <div
        className={
          "sticky top-1/2 -translate-y-1/2 mx-auto flex items-center justify-center bg-transparent px-4"
        }
      >
        <div
          className={
            "flex max-w-5xl flex-wrap items-center justify-center gap-2 text-center"
          }
        >
          {words.map((word, i) => {
            // More aggressive timing to make words appear sooner and faster
            const start = i / (words.length * 2.5);
            const end = start + 1 / (words.length * 1.5);
            
            // Use the style from the original children
            return (
              <Word 
                key={i} 
                progress={scrollYProgress} 
                range={[start, end]}
                className={typeof children !== "string" && React.isValidElement(children) 
                  ? children.props.className 
                  : ""}
              >
                {word}
              </Word>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
}

const Word: FC<WordProps> = ({ children, progress, range, className }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  const translateY = useTransform(progress, range, [20, 0]);
  const scale = useTransform(progress, range, [0.8, 1]);
  
  return (
    <span className="relative mx-1 lg:mx-1.5">
      <motion.span
        style={{ 
          opacity, 
          translateY,
          scale,
        }}
        className={cn("inline-block", className)}
      >
        {children}
      </motion.span>
    </span>
  );
};
