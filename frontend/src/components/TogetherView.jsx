import { DAYS } from "../data/timetable.js";
import { getMutualFreeBlocks, minutesToLabel, durationLabel } from "../utils/schedule.js";

export default function TogetherView({ you, friend, todayKey, nowMin }) {
  return (
    <div className="flex flex-col gap-3">
      {DAYS.map((day) => {
        const blocks = getMutualFreeBlocks(you, friend, day);
        const isToday = day === todayKey;
        const visibleBlocks = isToday ? blocks.filter((b) => b.end > nowMin) : blocks;

        return (
          <div
            key={day}
            className={`rounded-[24px] p-4 ${
              isToday ? "bg-white/[0.08] ring-1 ring-white/15" : "bg-white/[0.04]"
            }`}
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-white">{day}</span>
              {isToday && (
                <span className="rounded-full bg-rose-400/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                  TODAY
                </span>
              )}
            </div>

            {visibleBlocks.length === 0 ? (
              <p className="text-[13px] text-white/35">
                {isToday ? "No free time left together today" : "No overlapping free time"}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {visibleBlocks.map((b, idx) => (
                  <span
                    key={idx}
                    className={`rounded-xl px-3 py-1.5 text-[12px] font-medium ${
                      b.isLunch
                        ? "bg-amber-400/15 text-amber-300"
                        : "bg-emerald-400/15 text-emerald-300"
                    }`}
                  >
                    {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
                    <span className="text-white/35"> · {durationLabel(b.duration)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
