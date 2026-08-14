import { useState } from 'react';

export default function AttendanceCard({ subject, index, targetPercent, fullRecords, isLoadingFull }) {
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
        
        {/* Recent 5 classes indicator dots */}
        {fullRecords && fullRecords.length > 0 && (
          <div className="flex flex-col gap-1.5 shrink-0 ml-3 justify-center">
            {fullRecords.slice(0, 5).map((rec, i) => {
              const isPresent = rec.AttendanceCode === 'P' || rec.IsPresent || (rec.Status && rec.Status.toLowerCase().includes('present')) || false;
              
              // Fade opacity for older classes (i=0 is latest)
              const opacities = ['opacity-100', 'opacity-80', 'opacity-60', 'opacity-40', 'opacity-25'];
              const opacityClass = opacities[i] || 'opacity-20';
              
              return (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-[4px] shadow-sm transition-all duration-300
                    ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'} 
                    ${opacityClass}
                    ${i === 0 ? `ring-2 ring-offset-1 ${isPresent ? 'ring-emerald-500/40' : 'ring-rose-500/40'} scale-110` : ''}
                  `} 
                  title={`${isPresent ? 'Present' : 'Absent'} on ${rec.AttDate || rec.AttendanceDate || rec.Date || 'Unknown Date'} ${i === 0 ? '(Latest)' : ''}`}
                />
              );
            })}
          </div>
        )}
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

            {/* Day-wise records */}
            <div className="mt-2">
              <span className="text-xs font-semibold text-emerald-950/80 block mb-3">Recent Classes</span>
              
              {isLoadingFull ? (
                <div className="flex justify-center py-4">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : fullRecords && fullRecords.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {fullRecords.map((rec, i) => {
                    const dateStr = rec.AttDate || rec.AttendanceDate || rec.Date || 'Unknown Date';
                    const isPresent = rec.AttendanceCode === 'P' || rec.IsPresent || (rec.Status && rec.Status.toLowerCase().includes('present')) || false;
                    
                    return (
                      <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/50 border border-white/40 shadow-sm">
                        <span className="text-xs font-medium text-emerald-950/80">{dateStr}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isPresent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-xs text-emerald-950/50 font-medium">No recent classes recorded.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
