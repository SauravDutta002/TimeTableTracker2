import { PERIODS } from "../data/timetable.js";
import { minutesToLabel, timeToMinutes, STATUS_META, getSubjectName } from "../utils/schedule.js";

const TYPE_BAR = {
  class: "bg-rose-400",
  lab: "bg-purple-400",
  lunch: "bg-amber-400",
  free: "bg-emerald-400",
};

export default function ScheduleList({ person, day, isToday, nowMin }) {
  const daySchedule = person.schedule[day];

  if (!daySchedule) {
    return (
      <div className="rounded-[24px] bg-white/40 p-6 text-center text-emerald-950/50">
        No college on {day}
      </div>
    );
  }

  const rows = PERIODS.map((period, i) => ({ period, slot: daySchedule[i], i })).filter(
    (r) => r.slot
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-[24px] bg-white/40 p-6 text-center text-emerald-950/50">
        No college on {day}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ period, slot, i }) => {
        const start = timeToMinutes(period.start);
        const end = timeToMinutes(period.end);
        const isCurrent = isToday && nowMin >= start && nowMin < end;
        const meta = STATUS_META[slot.type];

        return (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${
              isCurrent ? "bg-white/80 ring-1 ring-emerald-900/10 shadow-sm" : "bg-white/40"
            }`}
          >
            <div className={`h-9 w-1 shrink-0 rounded-full ${TYPE_BAR[slot.type]}`} />
            <div className="w-[64px] shrink-0 text-[12px] leading-tight text-emerald-950/50">
              {minutesToLabel(start)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-emerald-950">{getSubjectName(slot.subject)}</p>
              <p className="truncate text-[12px] text-emerald-950/60">
                {slot.faculty
                  ? `${slot.faculty}${slot.room ? ` · ${slot.room}` : ""}`
                  : slot.room || meta.label}
                {slot.type === "lab" ? " · Lab" : ""}
              </p>
            </div>
            {isCurrent && (
              <span className="shrink-0 rounded-full bg-rose-400/20 px-2 py-1 text-[10px] font-semibold text-rose-300">
                NOW
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
