import { FaHeart } from "react-icons/fa6";
import { minutesToLabel, durationLabel } from "../utils/schedule.js";

export default function MeetupCard({ block, isToday, dayLabel }) {
  if (!block) {
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#EAE6DF] to-[#DCD8CF] p-5 ring-1 ring-emerald-900/5">
        <p className="text-[15px] font-medium text-emerald-900/70">
          No overlapping free time {isToday ? "left today" : `on ${dayLabel}`}.
        </p>
        <p className="mt-1 text-[13px] text-emerald-900/50">Try checking another day.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFC2A5] to-[#FFA89F] p-5 shadow-xl shadow-[#FFC2A5]/30 ring-1 ring-emerald-900/5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-60" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/50" />
          <span className="absolute inline-flex h-11 w-11 rounded-full bg-white/40" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white">
            <FaHeart className="h-3.5 w-3.5 text-[#FF9187]" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-amber-950/80">
            {block.isLunch ? "Lunch overlap" : isToday ? "You're both free" : `Free on ${dayLabel}`}
          </p>
          <p className="truncate text-[22px] font-semibold leading-tight text-amber-950">
            {minutesToLabel(block.start)} – {minutesToLabel(block.end)}
          </p>
          <p className="text-[13px] text-amber-950/75">{durationLabel(block.duration)} · go meet up</p>
        </div>
      </div>
    </div>
  );
}
