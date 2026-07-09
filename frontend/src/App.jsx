import { useEffect, useMemo, useState } from "react";
import { DAYS, PEOPLE, PERIODS } from "./data/timetable.js";
import {
  getStatusAt,
  getMutualFreeBlocks,
  todayKey,
  nowMinutes,
  nowSeconds,
  timeToSeconds,
  minutesToLabel,
  durationLabel,
  countdownLabel,
  courseNumber,
  STATUS_META,
} from "./utils/schedule.js";

import DaySelector from "./components/DaySelector.jsx";
import HeroStatus from "./components/HeroStatus.jsx";
import StatCard from "./components/StatCard.jsx";
import RingProgress from "./components/RingProgress.jsx";
import MeetupCard from "./components/MeetupCard.jsx";
import PersonToggle from "./components/PersonToggle.jsx";
import ScheduleList from "./components/ScheduleList.jsx";
import TogetherView from "./components/TogetherView.jsx";
import BottomNav from "./components/BottomNav.jsx";
import InstallPrompt from "./components/InstallPrompt.jsx";
import OTPModal from "./components/OTPModal.jsx";
import { parvaazGreeting, simpleGreeting } from "./data/greetings.js";

const REAL_TODAY = todayKey();
const DEFAULT_DAY = DAYS.includes(REAL_TODAY) ? REAL_TODAY : "Mon";

function StatusRing({ status, id }) {
  const isBusy = status.type === "class" || status.type === "lab";
  return (
    <RingProgress progress={isBusy ? status.progress : 1} size={44} stroke={4} id={id}>
      <span className="text-[10px] font-semibold text-white">
        {isBusy ? `${Math.round(status.progress * 100)}%` : "🤝"}
      </span>
    </RingProgress>
  );
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(DEFAULT_DAY);
  const [activeTab, setActiveTab] = useState("today");
  const [hasIdentified, setHasIdentified] = useState(() => localStorage.getItem("user_identity") !== null);
  const [viewer, setViewer] = useState(() => localStorage.getItem("user_identity") || "you");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const realToday = todayKey(now);
  const isViewingToday = selectedDay === realToday;
  const nowMin = nowMinutes(now);
  const nowSec = nowSeconds(now);

  const previewSeconds = useMemo(() => {
    if (isViewingToday) return nowSec;
    const daySchedule = PEOPLE[viewer].schedule[selectedDay];
    const firstIdx = daySchedule ? daySchedule.findIndex(Boolean) : -1;
    return firstIdx === -1 ? timeToSeconds(PERIODS[0].start) : timeToSeconds(PERIODS[firstIdx].start);
  }, [isViewingToday, nowSec, selectedDay, viewer]);

  const primaryPerson = PEOPLE[viewer];
  const secondaryPerson = viewer === "you" ? PEOPLE.friend : PEOPLE.you;

  const primaryStatus = getStatusAt(primaryPerson, selectedDay, previewSeconds);
  const secondaryStatus = getStatusAt(secondaryPerson, selectedDay, previewSeconds);

  const mutualBlocks = useMemo(
    () => getMutualFreeBlocks(PEOPLE.you, PEOPLE.friend, selectedDay),
    [selectedDay]
  );

  const upcomingBlocks = isViewingToday
    ? mutualBlocks.filter((b) => b.end > nowMin)
    : mutualBlocks;

  const freeNowBlock = isViewingToday
    ? mutualBlocks.find((b) => nowMin >= b.start && nowMin < b.end)
    : null;

  const heroBlock = freeNowBlock ?? upcomingBlocks[0] ?? null;
  const totalFreeMinutes = upcomingBlocks.reduce((sum, b) => sum + b.duration, 0);
  const longestBlock = upcomingBlocks.reduce(
    (max, b) => (b.duration > (max?.duration ?? 0) ? b : max),
    null
  );

  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const { greeting, compliment } = viewer === "friend" ? parvaazGreeting(now) : simpleGreeting(now);

  return (
    <>
      {!hasIdentified && (
        <OTPModal
          onComplete={(identity) => {
            localStorage.setItem("user_identity", identity);
            setViewer(identity);
            setHasIdentified(true);
          }}
        />
      )}
      <div className="bg-ambient min-h-screen">
        <div className="safe-top mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-6">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[20px] font-semibold leading-snug tracking-tight text-white">
              {greeting}
            </h2>
            {compliment && (
              <p className="mt-0.5 text-[13px] font-medium leading-snug text-rose-300/80">{compliment}</p>
            )}
            <p className="mt-1.5 text-[12px] text-white/40">{dateLabel}</p>
          </div>
          <div className="flex shrink-0 -space-x-2">
            {Object.values(PEOPLE).map((p) => (
              <button
                key={p.id}
                onClick={() => setViewer(p.id)}
                className={`press flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-semibold text-white ring-2 bg-clip-padding transition-shadow ${p.gradient} ${
                  viewer === p.id ? "ring-white" : "ring-black"
                }`}
              >
                {p.initials}
              </button>
            ))}
          </div>
        </header>

        <InstallPrompt />

        <DaySelector selectedDay={selectedDay} todayKey={realToday} onSelect={setSelectedDay} />

        {activeTab === "today" && (
          <div key="today" className="animate-fade-up mt-5 flex flex-col gap-3">
            <div className="rounded-[28px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 ring-1 ring-white/[0.06]">
              <HeroStatus
                status={primaryStatus}
                isToday={isViewingToday}
                dayLabel={`${selectedDay} schedule`}
                showMascot={viewer === "friend"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                gradient={secondaryPerson.gradient}
                label={secondaryPerson.name}
                value={(STATUS_META[secondaryStatus.type] ?? STATUS_META.off).label}
                sub={
                  secondaryStatus.type === "class" || secondaryStatus.type === "lab" ? (
                    <span className="mt-0.5 inline-flex items-center rounded-lg bg-white/20 px-2 py-0.5 text-[20px] font-bold leading-none text-white">
                      {secondaryStatus.room ? secondaryStatus.room.replace("Block-", "") : courseNumber(secondaryStatus.subject)}
                    </span>
                  ) : secondaryStatus.secondsToStart ? (
                    <span className="tabular-nums">In {countdownLabel(secondaryStatus.secondsToStart)}</span>
                  ) : (
                    "Available"
                  )
                }
                right={<StatusRing status={secondaryStatus} id="secondary-ring" />}
              />

              <StatCard
                gradient={
                  freeNowBlock
                    ? "from-emerald-500 via-teal-500 to-emerald-600"
                    : "from-zinc-700 to-zinc-800"
                }
                label="Free To Meet"
                value={freeNowBlock ? "Yes" : "No"}
                sub={
                  freeNowBlock ? (
                    <span className="tabular-nums">
                      {countdownLabel(freeNowBlock.end * 60 - nowSec)} left
                    </span>
                  ) : heroBlock ? (
                    `Next at ${minutesToLabel(heroBlock.start)}`
                  ) : (
                    "Not today"
                  )
                }
              />

              <StatCard
                gradient="from-violet-500 via-purple-500 to-indigo-600"
                label="Free Windows"
                value={upcomingBlocks.length}
                unit={isViewingToday ? "left today" : "today"}
                sub={`${durationLabel(totalFreeMinutes)} total`}
              />

              <StatCard
                gradient="from-amber-500 via-orange-500 to-rose-500"
                label="Longest Window"
                value={longestBlock ? durationLabel(longestBlock.duration).split(" ")[0] : "–"}
                unit={longestBlock ? durationLabel(longestBlock.duration).split(" ")[1] : ""}
                sub={longestBlock ? `Starts ${minutesToLabel(longestBlock.start)}` : "None left"}
              />
            </div>

            <MeetupCard
              block={heroBlock}
              isToday={isViewingToday}
              dayLabel={selectedDay}
            />
          </div>
        )}

        {activeTab === "schedule" && (
          <div key="schedule" className="animate-fade-up mt-5 flex flex-col gap-3">
            <PersonToggle people={PEOPLE} active={viewer} onChange={setViewer} />
            <ScheduleList
              person={PEOPLE[viewer]}
              day={selectedDay}
              isToday={isViewingToday}
              nowMin={nowMin}
            />
          </div>
        )}

        {activeTab === "together" && (
          <div key="together" className="animate-fade-up mt-5">
            <TogetherView
              you={PEOPLE.you}
              friend={PEOPLE.friend}
              todayKey={realToday}
              nowMin={nowMin}
            />
          </div>
        )}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
    </>
  );
}
