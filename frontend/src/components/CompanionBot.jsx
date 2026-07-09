import React from "react";

const HappyEye = ({ color }) => (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mt-0.5">
    <path d="M1 5 Q5 0 9 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NormalEye = ({ color }) => (
  <div
    className="h-[6px] w-[5px] rounded-full"
    style={{
      backgroundColor: color,
      animation: "blink 4s infinite",
    }}
  />
);

const FocusedEye = ({ color }) => (
  <div className="h-[3px] w-[8px] rounded-full" style={{ backgroundColor: color }} />
);

const ScanningEye = ({ color }) => (
  <div
    className="h-[5px] w-[5px] rounded-full"
    style={{
      backgroundColor: color,
      animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
    }}
  />
);

export default function CompanionBot({ type, color }) {
  const isClass = type === "class";
  const isLab = type === "lab";
  const isLunch = type === "lunch";
  const isFree = type === "off" || type === "free";

  return (
    <div
      className="relative flex flex-col items-center justify-center animate-float drop-shadow-2xl transition-all duration-500"
      style={{ filter: `drop-shadow(0px 8px 16px ${color}50)` }}
    >
      {/* Antenna */}
      <div className="relative mb-0.5 h-2.5 w-[2px] rounded-full bg-white/30">
        <div
          className="absolute -left-[2px] -top-1.5 h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>

      {/* Glass Head */}
      <div className="relative flex h-11 w-14 items-center justify-center overflow-hidden rounded-[18px] border border-white/20 bg-gradient-to-b from-white/20 to-white/5 shadow-inner backdrop-blur-md">
        {/* Face Screen */}
        <div className="relative flex h-6 w-10 items-center justify-center overflow-hidden rounded-[10px] bg-black/80 shadow-inner">
          {/* Eyes Container - looks around */}
          <div
            className="flex items-center justify-center gap-1.5"
            style={{ animation: "lookAround 8s ease-in-out infinite" }}
          >
            {isClass && (
              <>
                <FocusedEye color={color} />
                <FocusedEye color={color} />
              </>
            )}
            {isLab && (
              <>
                <ScanningEye color={color} />
                <ScanningEye color={color} />
              </>
            )}
            {isLunch && (
              <>
                <HappyEye color={color} />
                <HappyEye color={color} />
              </>
            )}
            {isFree && (
              <>
                <NormalEye color={color} />
                <NormalEye color={color} />
              </>
            )}
          </div>

          {/* Holographic Scanline */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-50"
            style={{ animation: "scan 2.5s linear infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
