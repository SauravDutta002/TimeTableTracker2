import Swoosh from "./Swoosh.jsx";
import CuteMascot from "./CuteMascot.jsx";
import { minutesToLabel, countdownLabel, STATUS_META, getSubjectName } from "../utils/schedule.js";

export default function HeroStatus({ status, isToday, dayLabel, showMascot }) {
  const meta = STATUS_META[status.type] ?? STATUS_META.off;
  const isBusy = status.type === "class" || status.type === "lab";

  const headline = isBusy ? getSubjectName(status.subject) : meta.label;
  const subtitleParts = [];
  if (isBusy && status.faculty) subtitleParts.push(`By ${status.faculty}`);
  if (status.room) subtitleParts.push(status.room);
  if (status.start != null && status.end != null) {
    subtitleParts.push(`${minutesToLabel(status.start)} – ${minutesToLabel(status.end)}`);
  }
  if (status.type === "off" && status.label && status.secondsToStart == null) {
    subtitleParts.push(status.label);
  }

  return (
    <div className="px-1 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/50">
          {isToday ? "Right now" : dayLabel}
        </span>
        {isToday && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
            </span>
            LIVE
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="mt-1 truncate text-[34px] font-semibold leading-tight tracking-tight text-white">
            {headline}
          </h1>

          <p className="mt-0.5 text-[15px] text-white/55">
            {status.type === "off" && status.secondsToStart != null ? (
              <span className="tabular-nums">
                {subtitleParts.length > 0 && `${subtitleParts.join(" · ")} · `}
                {status.label} · starts in {countdownLabel(status.secondsToStart)}
              </span>
            ) : (
              <>
                {subtitleParts.length > 0 ? subtitleParts.join(" · ") : meta.label}
                {isToday && isBusy && status.secondsLeft != null && (
                  <span className="tabular-nums text-white/40"> · {countdownLabel(status.secondsLeft)} left</span>
                )}
              </>
            )}
          </p>
        </div>

        {showMascot && (
          <div className="shrink-0 pl-3">
            <CuteMascot type={status.type} color={meta.color} />
          </div>
        )}
      </div>

      <div className="mt-3">
        <Swoosh progress={status.progress ?? (isBusy ? 0 : 1)} color={meta.color} />
      </div>
    </div>
  );
}
