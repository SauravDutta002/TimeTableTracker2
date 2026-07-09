import React from "react";

export default function CuteMascot({ type, color }) {
  return (
    <div
      className="relative flex items-center justify-center animate-float transition-all duration-500"
      style={{ filter: `drop-shadow(0px 8px 16px ${color}70)` }}
    >
      <img 
        src="/snoopy.png" 
        alt="Snoopy Mascot" 
        className="w-[65px] h-[65px] object-contain"
        onError={(e) => { 
          // Fallback to a web Snoopy image if the local file isn't found
          e.target.src = "https://upload.wikimedia.org/wikipedia/en/5/53/Snoopy_Peanuts.png"; 
        }}
      />
    </div>
  );
}
