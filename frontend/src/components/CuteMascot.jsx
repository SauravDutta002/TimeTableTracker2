import React from "react";

export default function CuteMascot({ type, color }) {
  return (
    <div
      className="relative flex items-center justify-center animate-float transition-all duration-500 mix-blend-multiply"
      style={{ filter: `drop-shadow(0px 4px 8px ${color}30)` }}
    >
      <img 
        src="/mascot.png" 
        alt="Ghibli Mascot" 
        className="w-[75px] h-[75px] object-contain"
      />
    </div>
  );
}
