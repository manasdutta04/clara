import React, { useState } from "react";
import confetti from "canvas-confetti";

interface CoolModeProps {
  children: React.ReactNode;
}

export function CoolMode({ children }: CoolModeProps) {
  const [coolMode, setCoolMode] = useState(false);

  const handleClick = () => {
    setCoolMode(true);
    
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9999";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);

    const myConfetti = confetti.create(canvas, {
      resize: true,
    });

    myConfetti({
      particleCount: 150,
      spread: 160,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      canvas.remove();
      setCoolMode(false);
    }, 3000);
  };

  return (
    <div className="inline-block" onClick={handleClick}>
      {children}
    </div>
  );
} 