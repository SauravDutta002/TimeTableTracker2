import { DAYS } from "../data/timetable.js";
import { getMutualFreeBlocks, minutesToLabel, durationLabel } from "../utils/schedule.js";

export default function TogetherView({ you, friend, todayKey, nowMin }) {
  return (
    <div className="flex flex-col gap-4">
      {DAYS.map((day, index) => {
        const blocks = getMutualFreeBlocks(you, friend, day);
        const isToday = day === todayKey;
        const visibleBlocks = isToday ? blocks.filter((b) => b.end > nowMin) : blocks;

        return (
          <div
            key={day}
            className={`group relative overflow-hidden rounded-[28px] p-5 transition-all duration-300 animate-fade-up ${
              isToday
                ? "bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-emerald-900/10 scale-[1.02]"
                : "bg-white/40 hover:bg-white/60 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-white/60 hover:-translate-y-0.5"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {isToday && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-transparent" />
            )}
            
            <div className="relative z-10">
              <div className="mb-3.5 flex items-center justify-between">
                <span className={`text-[16px] font-bold tracking-tight ${isToday ? "text-emerald-950" : "text-emerald-900/70"}`}>
                  {day}
                </span>
                {isToday && (
                  <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-black tracking-wider text-rose-500 uppercase shadow-sm ring-1 ring-rose-200/50">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                    </span>
                    TODAY
                  </span>
                )}
              </div>

              {visibleBlocks.length === 0 ? (
                <p className="text-[14px] font-medium text-emerald-900/40">
                  {isToday ? "No free time left together today" : "No overlapping free time"}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {visibleBlocks.map((b, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[13px] font-bold shadow-sm transition-transform hover:-translate-y-0.5 cursor-default ${
                        b.isLunch
                          ? "bg-amber-100/80 text-amber-800 ring-1 ring-amber-200/60 hover:bg-amber-100"
                          : "bg-emerald-100/80 text-emerald-800 ring-1 ring-emerald-200/60 hover:bg-emerald-100"
                      }`}
                    >
                      <span>
                        {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
                      </span>
                      <span className="flex items-center gap-1.5 opacity-60">
                        <span className="h-1 w-1 rounded-full bg-current" />
                        {durationLabel(b.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
