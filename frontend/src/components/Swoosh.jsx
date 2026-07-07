export default function Swoosh({ progress = 0, color = "#fb7185" }) {
  const clamped = Math.max(0, Math.min(1, progress));
  const pathLength = 100;

  return (
    <svg viewBox="0 0 300 40" className="h-10 w-full" preserveAspectRatio="none">
      <path
        d="M0 28 C 30 28, 40 8, 60 10 S 90 30, 110 26 S 140 4, 165 8 S 195 32, 220 24 S 260 6, 300 14"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={pathLength}
      />
      <path
        d="M0 28 C 30 28, 40 8, 60 10 S 90 30, 110 26 S 140 4, 165 8 S 195 32, 220 24 S 260 6, 300 14"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={pathLength}
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength - clamped * pathLength}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}
