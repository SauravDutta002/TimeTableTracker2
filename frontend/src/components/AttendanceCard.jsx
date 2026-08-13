import { useState } from 'react';

export default function AttendanceCard({ subject, index, targetPercent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [simulatedMisses, setSimulatedMisses] = useState(0);

  const realPercentage = parseFloat(subject.TotalPercentage) || 0;
  const delivered = parseInt(subject.Total_Delv) || 0;
  const attended = parseInt(subject.Total_Attd) || 0;

  // Simulated Math
  const simulatedDelivered = delivered + simulatedMisses;
  const percentage = simulatedDelivered > 0 
    ? ((attended / simulatedDelivered) * 100) 
    : realPercentage;
    
  const displayPercentage = percentage.toFixed(1);

  // SVG circular progress
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let strokeClass = 'stroke-emerald-500';
  
  if (percentage < 75) {
    colorClass = 'text-rose-500';
    strokeClass = 'stroke-rose-500';
  } else if (percentage < 90) {
    colorClass = 'text-amber-500';
    strokeClass = 'stroke-amber-500';
  }

  const delay = Math.min(index, 5) * 100;

  // Prediction Math
  let predictionMessage = "";
  let predictionSubtext = "";
  
  if (percentage >= targetPercent) {
    // How many more can I miss?
    const extraMisses = Math.floor((attended * 100 - targetPercent * simulatedDelivered) / targetPercent);
    if (extraMisses > 0) {
      predictionMessage = `You can safely skip ${extraMisses} more class${extraMisses > 1 ? 'es' : ''}.`;
    } else {
      predictionMessage = `You are exactly on track for ${targetPercent}%.`;
      predictionSubtext = "Don't miss the next one!";
    }
  } else {
    // How many must I attend?
    if (targetPercent === 100) {
      predictionMessage = "You can't reach 100% anymore.";
    } else {
      const required = Math.ceil((targetPercent * simulatedDelivered - 100 * attended) / (100 - targetPercent));
      predictionMessage = `You need to attend ${required} consecutive class${required > 1 ? 'es' : ''}.`;
      predictionSubtext = `To reach ${targetPercent}%`;
    }
  }

  return (
    <div 
      className={`animate-fade-up rounded-[24px] bg-gradient-to-b from-white/60 to-white/30 ring-1 ring-emerald-900/5 shadow-sm backdrop-blur-md overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-white/80' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="relative shrink-0 flex items-center justify-center h-14 w-14">
          <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
            <circle 
              className="stroke-emerald-900/10 fill-none" 
              cx="28" cy="28" r={radius} strokeWidth="4" 
            />
            <circle
              className={`fill-none transition-all duration-1000 ease-out ${strokeClass}`}
              cx="28"
              cy="28"
              r={radius}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className={`text-[11px] font-bold ${colorClass}`}>{displayPercentage}%</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="truncate font-semibold text-sm text-emerald-950 mb-1" title={subject.Title}>
            {subject.Title}
          </h3>
          <div className="flex items-center gap-3 text-[11px] font-medium text-emerald-950/60 mb-2">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-900/20" />
              {simulatedDelivered} delivered
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
              {attended} attended
            </span>
          </div>
          
          <div className="inline-flex flex-col rounded-lg bg-gradient-to-r from-emerald-900/5 to-transparent py-1 px-2 border-l-2 border-emerald-500">
            <p className="text-[11px] font-semibold text-emerald-950 leading-tight">
              {predictionMessage}
            </p>
            {predictionSubtext && (
              <p className="text-[9px] font-medium text-emerald-950/60 mt-0.5">
                {predictionSubtext}
              </p>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 animate-fade-up">
          <div className="h-px w-full bg-emerald-900/10 mb-4" />
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-950/80">Simulate Missed Classes</span>
              <div className="flex items-center gap-3 bg-emerald-900/5 rounded-full px-2 py-1 ring-1 ring-emerald-900/10">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSimulatedMisses(Math.max(0, simulatedMisses - 1)); }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-emerald-950 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50"
                  disabled={simulatedMisses === 0}
                >
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center">{simulatedMisses}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSimulatedMisses(simulatedMisses + 1); }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-emerald-950 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
