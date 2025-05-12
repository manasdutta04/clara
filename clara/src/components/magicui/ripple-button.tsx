"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./ripple.css";

interface RippleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  key: number;
}

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  rippleDuration?: number;
  rippleSize?: number;
  children: React.ReactNode;
  className?: string;
}

export function RippleButton({
  rippleColor = "#fff",
  rippleDuration = 1000,
  rippleSize = 100,
  children,
  className,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<RippleProps[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [rippleId, setRippleId] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add a new ripple
    const newRipple = {
      x,
      y,
      size: rippleSize,
      color: rippleColor,
      key: rippleId,
    };

    setRipples([...ripples, newRipple]);
    setRippleId(rippleId + 1);

    // Remove the ripple after animation completes
    setTimeout(() => {
      setRipples((prevRipples) =>
        prevRipples.filter((r) => r.key !== newRipple.key)
      );
    }, rippleDuration);

    // Call the original onClick if it exists
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.key}
          style={{
            position: "absolute",
            top: ripple.y - ripple.size / 2,
            left: ripple.x - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: ripple.color,
            borderRadius: "50%",
            opacity: 0.6,
            transform: "scale(0)",
            animation: `ripple ${rippleDuration}ms linear`,
          }}
        />
      ))}
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
} 