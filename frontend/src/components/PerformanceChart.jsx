import { useState, useEffect } from 'react';

const GRADE_MAPPING = {
  'O': 100,
  'A+': 95,
  'A': 90,
  'B+': 85,
  'B': 80,
  'C+': 75,
  'C': 70,
  'D': 60,
  'E': 0,
  'F': 0,
};

function getSubjectInitials(name) {
  const cleanName = name.replace(/\(.*?\)/g, '').trim();
  const words = cleanName.split(/[\s-]+/).filter(w => w.length > 0 && w.toLowerCase() !== 'and');
  
  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }
  return words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function createSlice(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
}

export default function PerformanceChart({ sessionData }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredSubject, setHoveredSubject] = useState(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [sessionData]);

  if (!sessionData || sessionData.length === 0) return null;

  const chartData = sessionData.map((subject, idx) => {
    const { name, marks } = subject;
    let percentage = 0;
    
    const isGradeOnly = marks.length === 1 && marks[0].element.toLowerCase().includes('grade');
    
    if (isGradeOnly) {
      const grade = marks[0].obtained.toUpperCase().trim();
      percentage = GRADE_MAPPING[grade] || 0;
    } else {
      let totalMax = 0;
      let totalObtained = 0;
      
      marks.forEach((m) => {
        const max = parseFloat(m.total);
        const obt = parseFloat(m.obtained);
        if (!isNaN(max) && !isNaN(obt)) {
          totalMax += max;
          totalObtained += obt;
        }
      });
      
      if (totalMax > 0) {
        percentage = (totalObtained / totalMax) * 100;
      }
    }

    let fillColor = '#10b981'; // emerald-500
    
    if (percentage < 75) {
      fillColor = '#f43f5e'; // rose-500
    } else if (percentage < 90) {
      fillColor = '#fbbf24'; // amber-400
    }

    return {
      id: idx,
      name,
      shortName: getSubjectInitials(name),
      percentage,
      fillColor
    };
  });

  const N = chartData.length;
  const angleStep = 360 / N;
  const MAX_RADIUS = 80;
  const cx = 120;
  const cy = 120;

  return (
    <div className="animate-fade-up glass-card rounded-[32px] p-6 mb-4 flex flex-col items-center relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-serif italic font-semibold text-xl text-emerald-950/90 tracking-wide">
          Performance Radar
        </h3>
        <div className="flex gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
        </div>
      </div>
      
      <div className="relative w-[240px] h-[240px] z-10">
        <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-sm overflow-visible">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.45)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.15)" />
            </radialGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background polygonal guide rings */}
          {[1, 0.75, 0.5, 0.25].map((scale, i) => (
            <polygon
              key={`grid-${i}`}
              points={chartData.map((d, j) => {
                const angle = j * angleStep;
                const pos = polarToCartesian(cx, cy, MAX_RADIUS * scale, angle);
                return `${pos.x},${pos.y}`;
              }).join(" ")}
              fill="none"
              stroke="rgba(6, 78, 59, 0.12)"
              strokeWidth={scale === 1 ? "1.5" : "1"}
              strokeDasharray={scale < 1 ? "4 4" : "none"}
              className="transition-all duration-700 ease-out"
            />
          ))}

          {/* Spokes (Axes) */}
          {chartData.map((d, i) => {
            const angle = i * angleStep;
            const endPos = polarToCartesian(cx, cy, MAX_RADIUS, angle);
            return (
              <line 
                key={`spoke-${i}`} 
                x1={cx} 
                y1={cy} 
                x2={endPos.x} 
                y2={endPos.y} 
                stroke="rgba(6, 78, 59, 0.1)" 
                strokeWidth="1" 
              />
            );
          })}

          {/* Radar Polygon */}
          <polygon
            points={chartData.map((d, i) => {
              const angle = i * angleStep;
              const targetRadius = (Math.max(d.percentage, 0) / 100) * MAX_RADIUS;
              const radius = mounted ? targetRadius : 0;
              const pos = polarToCartesian(cx, cy, radius, angle);
              return `${pos.x},${pos.y}`;
            }).join(" ")}
            fill="url(#radarFill)"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#radarGlow)"
            className="transition-all duration-1000 ease-out origin-center"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Data Points & Labels */}
          {chartData.map((d, i) => {
            const angle = i * angleStep;
            
            const targetRadius = (Math.max(d.percentage, 0) / 100) * MAX_RADIUS;
            const radius = mounted ? targetRadius : 0;
            const pos = polarToCartesian(cx, cy, radius, angle);
            
            const labelPos = polarToCartesian(cx, cy, MAX_RADIUS + 24, angle);
            const isLeft = labelPos.x < cx - 5;
            const isRight = labelPos.x > cx + 5;
            let anchor = "middle";
            if (isLeft) anchor = "end";
            if (isRight) anchor = "start";

            const isHovered = hoveredSubject?.id === d.id;
            const pointRadius = isHovered ? "5" : "3.5";

            return (
              <g 
                key={`point-${d.id}`} 
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredSubject(d)}
                onMouseLeave={() => setHoveredSubject(null)}
                onTouchStart={() => setHoveredSubject(d)}
              >
                {/* Data Point Container for larger hover target */}
                <circle cx={pos.x} cy={pos.y} r="16" fill="transparent" />
                
                {/* Actual Data Point */}
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r={pointRadius} 
                  fill={isHovered ? "#059669" : d.fillColor} 
                  stroke="#fff"
                  strokeWidth="1.5"
                  className="transition-all duration-300 ease-out"
                />
                
                {/* The Subject Label */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className={`text-[10.5px] font-bold transition-all duration-300 ${isHovered ? 'fill-emerald-800 scale-110 font-black' : 'fill-emerald-950/60'}`}
                  style={{ opacity: mounted ? 1 : 0, transformOrigin: `${labelPos.x}px ${labelPos.y}px` }}
                >
                  {d.shortName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Tooltip / Score display */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${hoveredSubject ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="flex flex-col items-center justify-center bg-white/95 backdrop-blur-md rounded-full w-[76px] h-[76px] shadow-[0_8px_20px_rgba(16,185,129,0.15)] border border-emerald-100/50">
            <span className="text-[10px] font-bold text-emerald-950/50 leading-tight mb-0.5 px-2 text-center truncate w-full">
              {hoveredSubject?.shortName}
            </span>
            <span className="text-xl font-black text-emerald-950 leading-tight tracking-tight">
              {hoveredSubject?.percentage.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-emerald-950/60 w-full z-10">
        <div className="flex items-center gap-1.5 transition-colors hover:text-emerald-950">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-sm border border-black/5"></span>
          <span>≥ 90%</span>
        </div>
        <div className="flex items-center gap-1.5 transition-colors hover:text-emerald-950">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-sm border border-black/5"></span>
          <span>≥ 75%</span>
        </div>
        <div className="flex items-center gap-1.5 transition-colors hover:text-emerald-950">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shadow-sm border border-black/5"></span>
          <span>&lt; 75%</span>
        </div>
      </div>
    </div>
  );
}
