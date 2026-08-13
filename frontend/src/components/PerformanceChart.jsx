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
  const MAX_RADIUS = 75;
  const cx = 120;
  const cy = 120;

  return (
    <div className="animate-fade-up rounded-[24px] bg-gradient-to-b from-white/60 to-white/30 p-5 ring-1 ring-emerald-900/5 shadow-sm backdrop-blur-md mb-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-emerald-950 leading-snug">
          Performance Overview
        </h3>
      </div>
      
      <div className="relative w-[240px] h-[240px]">
        <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-sm">
          {/* Background guide rings */}
          <circle cx={cx} cy={cy} r={MAX_RADIUS} fill="none" stroke="rgba(6, 78, 59, 0.08)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={MAX_RADIUS * 0.75} fill="none" stroke="rgba(6, 78, 59, 0.05)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx={cx} cy={cy} r={MAX_RADIUS * 0.5} fill="none" stroke="rgba(6, 78, 59, 0.05)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx={cx} cy={cy} r={MAX_RADIUS * 0.25} fill="none" stroke="rgba(6, 78, 59, 0.05)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Spokes (Axes) */}
          {chartData.map((d, i) => {
            const angle = i * angleStep;
            const endPos = polarToCartesian(cx, cy, MAX_RADIUS, angle);
            return (
              <line key={`spoke-${i}`} x1={cx} y1={cy} x2={endPos.x} y2={endPos.y} stroke="rgba(6, 78, 59, 0.08)" strokeWidth="1" />
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
            fill="rgba(16, 185, 129, 0.2)"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinejoin="round"
            className="transition-all duration-1000 ease-out origin-center"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Data Points & Labels */}
          {chartData.map((d, i) => {
            const angle = i * angleStep;
            
            const targetRadius = (Math.max(d.percentage, 0) / 100) * MAX_RADIUS;
            const radius = mounted ? targetRadius : 0;
            const pos = polarToCartesian(cx, cy, radius, angle);
            
            const labelPos = polarToCartesian(cx, cy, MAX_RADIUS + 18, angle);
            const isLeft = labelPos.x < cx - 5;
            const isRight = labelPos.x > cx + 5;
            let anchor = "middle";
            if (isLeft) anchor = "end";
            if (isRight) anchor = "start";

            return (
              <g key={`point-${d.id}`} className="group cursor-default">
                {/* Data Point */}
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r="3.5" 
                  fill={d.fillColor} 
                  className="transition-all duration-1000 ease-out group-hover:r-[5px] group-hover:fill-emerald-600"
                />
                
                {/* The Subject Label */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className="text-[9px] font-bold fill-emerald-950/60 transition-all duration-500"
                  style={{ opacity: mounted ? 1 : 0 }}
                >
                  {d.shortName}
                </text>

                {/* Percentage Tooltip overlay */}
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[12px] font-black fill-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-white"
                >
                  {d.percentage.toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-[10px] font-bold text-emerald-950/60 w-full">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>≥ 90%</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span>≥ 75%</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span>&lt; 75%</span>
      </div>
    </div>
  );
}
