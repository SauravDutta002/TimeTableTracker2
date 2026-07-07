import { DAYS } from "../data/timetable.js";

const SHORT = { Mon: "M", Tue: "T", Wed: "W", Thu: "T", Fri: "F", Sat: "S" };

export default function DaySelector({ selectedDay, todayKey, onSelect }) {
  return (
    <div className="flex items-center justify-between gap-1.5">
      {DAYS.map((day) => {
        const isSelected = day === selectedDay;
        const isToday = day === todayKey;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`press relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${
              isSelected
                ? "bg-white text-black shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
                : "bg-white/[0.06] text-white/50 hover:bg-white/10"
            }`}
          >
            {SHORT[day]}
            {isToday && !isSelected && (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
