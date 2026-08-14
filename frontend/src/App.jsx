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
import Login from "./pages/Login.jsx";
import AttendanceCard from "./components/AttendanceCard.jsx";
import MarksCard from "./components/MarksCard.jsx";
import PerformanceChart from "./components/PerformanceChart.jsx";
import { parvaazGreeting, simpleGreeting } from "./data/greetings.js";
import useDataSync from "./hooks/useDataSync.js";
import { HiOutlineAdjustmentsHorizontal, HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi2';

const REAL_TODAY = todayKey();
const DEFAULT_DAY = DAYS.includes(REAL_TODAY) ? REAL_TODAY : "Mon";

function StatusRing({ status, id }) {
  const isBusy = status.type === "class" || status.type === "lab";
  return (
    <RingProgress progress={isBusy ? status.progress : 1} size={44} stroke={4} id={id}>
      <span className="text-[10px] font-semibold text-emerald-950">
        {isBusy ? `${Math.round(status.progress * 100)}%` : "🤝"}
      </span>
    </RingProgress>
  );
}

const BANNERS = ["/totoro_banner.png", "/noface_banner.png", "/totoro_sleeping.png"];

export default function App() {
  const [now, setNow] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(DEFAULT_DAY);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("active_tab") || "today");
  const [hasIdentified, setHasIdentified] = useState(() => localStorage.getItem("user_identity") !== null);
  const [viewer, setViewer] = useState(() => localStorage.getItem("user_identity") || "you");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [cuimsToken, setCuimsToken] = useState(() => localStorage.getItem("cuims_token") || null);
  const [cuimsData, setCuimsData] = useState(() => {
    const saved = localStorage.getItem("cuims_data");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeSession, setActiveSession] = useState(null);
  const [globalTarget, setGlobalTarget] = useState(() => Number(localStorage.getItem("global_target")) || 75);
  const [showFilter, setShowFilter] = useState(false);

  // Initialize active session when data loads
  useEffect(() => {
    if (cuimsData?.marks?.sessions?.length && !activeSession) {
      const current = cuimsData.marks.sessions.find(s => s.isCurrent);
      const withData = cuimsData.marks.sessions.filter(s => cuimsData.marks.data?.[s.value]?.length > 0);
      setActiveSession(withData?.[0]?.value || current?.value || cuimsData.marks.sessions[0].value);
    }
  }, [cuimsData, activeSession]);

  // Use the auto-sync hook
  useDataSync(cuimsToken, cuimsData, setCuimsData);

  const handleCuimsLogin = (token, data) => {
    localStorage.setItem("cuims_token", token);
    localStorage.setItem("cuims_data", JSON.stringify(data));
    setCuimsToken(token);
    setCuimsData(data);
    
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    localStorage.setItem("global_target", globalTarget.toString());
  }, [globalTarget]);

  const [loadingFullAttendance, setLoadingFullAttendance] = useState(false);

  useEffect(() => {
    localStorage.setItem("active_tab", activeTab);
    
    // Fetch full attendance when opening the attendance tab
    if (activeTab === "attendance" && cuimsToken && cuimsData && !cuimsData.attendance?.fullAttendance && !loadingFullAttendance) {
      setLoadingFullAttendance(true);
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/attendance/full`, {
        headers: { "x-session-token": cuimsToken }
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            setCuimsData(prev => ({
              ...prev,
              attendance: {
                ...prev.attendance,
                fullAttendance: res.data
              }
            }));
            localStorage.setItem("cuims_data", JSON.stringify({
              ...cuimsData,
              attendance: { ...cuimsData.attendance, fullAttendance: res.data }
            }));
          }
        })
        .finally(() => setLoadingFullAttendance(false));
    }
  }, [activeTab, cuimsToken, cuimsData, loadingFullAttendance]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    const bannerId = setInterval(() => setBannerIndex((prev) => (prev + 1) % BANNERS.length), 5000);
    return () => {
      clearInterval(id);
      clearInterval(bannerId);
    };
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
            <h2 className="text-[24px] font-serif font-bold leading-snug tracking-tight text-emerald-950">
              {greeting}
            </h2>
            {compliment && (
              <p className="mt-0.5 text-[13px] font-medium leading-snug text-emerald-800/80">{compliment}</p>
            )}
            <p className="mt-1.5 text-[12px] text-emerald-950/60 font-medium">{dateLabel}</p>
          </div>
          <div className="flex shrink-0 -space-x-2">
            {Object.values(PEOPLE).map((p) => (
              <button
                key={p.id}
                onClick={() => setViewer(p.id)}
                className={`press flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-semibold text-emerald-950 ring-2 bg-clip-padding transition-shadow ${p.gradient} ${
                  viewer === p.id ? "ring-emerald-900/50" : "ring-transparent"
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
            <div className="rounded-[28px] bg-gradient-to-b from-white/60 to-white/30 p-4 ring-1 ring-emerald-900/5 shadow-sm backdrop-blur-md overflow-hidden">
              <div className="relative -mx-4 -mt-4 mb-2 h-40 bg-[#F4F1EA]">
                {BANNERS.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt="Ghibli Banner"
                    className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-1000 ${
                      idx === bannerIndex ? "opacity-90" : "opacity-0"
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90" />
              </div>
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
                    <span className="mt-0.5 inline-flex items-center rounded-lg bg-emerald-900/10 px-2 py-0.5 text-[20px] font-bold leading-none text-emerald-950">
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
                    ? "from-[#C4D7B2] to-[#A0C49D]"
                    : "from-[#E5E0D8] to-[#D5D0C8]"
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
                gradient="from-[#E2D4E1] to-[#C9B9C7]"
                label="Free Windows"
                value={upcomingBlocks.length}
                unit={isViewingToday ? "left today" : "today"}
                sub={`${durationLabel(totalFreeMinutes)} total`}
              />

              <StatCard
                gradient="from-[#F2D7B4] to-[#E3BE92]"
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

        {activeTab === "attendance" && (
          <div key="attendance" className="animate-fade-up mt-5">
            {!cuimsToken ? (
              <Login onLoginSuccess={handleCuimsLogin} />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-sm font-semibold text-emerald-950/80 uppercase tracking-wider flex items-center gap-3">
                    {cuimsData?.profile?.name && cuimsData.profile.name !== 'Unknown' ? `${cuimsData.profile.name.split(' ')[0]}'s Attendance` : 'Your Attendance'}
                    <button 
                      onClick={() => setShowFilter(!showFilter)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm ${
                        showFilter ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30' : 'bg-emerald-900/10 text-emerald-900 hover:bg-emerald-900/20'
                      }`}
                    >
                      <HiOutlineAdjustmentsHorizontal className="w-3.5 h-3.5" />
                      Target: {globalTarget}%
                    </button>
                  </h3>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("cuims_token");
                      localStorage.removeItem("cuims_data");
                      setCuimsToken(null);
                      setCuimsData(null);
                    }}
                    className="text-xs font-medium text-emerald-700/60 hover:text-emerald-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>

                {showFilter && (
                  <div className="flex flex-col gap-3 bg-white/60 rounded-[20px] px-4 py-4 mb-1 ring-1 ring-emerald-900/10 shadow-sm backdrop-blur-md animate-fade-up">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-950/80">Adjust Minimum Target</span>
                      <div className="flex items-center gap-3 bg-white/80 rounded-full px-1 py-1 shadow-sm ring-1 ring-emerald-900/5">
                        <button 
                          onClick={() => setGlobalTarget(Math.max(50, globalTarget - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-emerald-100 active:bg-emerald-200 text-emerald-900 transition-colors"
                        >
                          <HiOutlineMinus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-emerald-950 w-9 text-center">{globalTarget}%</span>
                        <button 
                          onClick={() => setGlobalTarget(Math.min(100, globalTarget + 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-emerald-100 active:bg-emerald-200 text-emerald-900 transition-colors"
                        >
                          <HiOutlinePlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {Array.isArray(cuimsData?.attendance?.subjects) ? (
                  cuimsData.attendance.subjects.length > 0 ? (
                    cuimsData.attendance.subjects.map((subj, idx) => {
                      const fullRecord = cuimsData.attendance.fullAttendance?.find(f => f.title === subj.Title);
                      return (
                        <AttendanceCard 
                          key={subj.EncryptCode || idx} 
                          subject={subj} 
                          index={idx} 
                          targetPercent={globalTarget} 
                          fullRecords={fullRecord?.records || null}
                          isLoadingFull={loadingFullAttendance}
                        />
                      );
                    })
                  ) : (
                    <div className="animate-fade-up rounded-[24px] bg-gradient-to-b from-white/60 to-white/30 p-8 ring-1 ring-emerald-900/5 shadow-sm backdrop-blur-md flex flex-col items-center justify-center text-center">
                      <span className="text-4xl mb-2">📋</span>
                      <p className="text-sm text-emerald-950/60 font-medium">No attendance records found.</p>
                    </div>
                  )
                ) : (
                  <div className="animate-fade-up rounded-[24px] bg-gradient-to-b from-white/60 to-white/30 p-8 ring-1 ring-emerald-900/5 shadow-sm backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-2">⚠️</span>
                    <p className="text-sm text-emerald-950/60 font-medium">
                      Attendance data is currently unavailable. The university portal might be down or updating.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "marks" && (
          <div key="marks" className="animate-fade-up mt-5">
            {!cuimsToken ? (
              <Login onLoginSuccess={handleCuimsLogin} />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-sm font-semibold text-emerald-950/80 uppercase tracking-wider">
                    Your Marks
                  </h3>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("cuims_token");
                      localStorage.removeItem("cuims_data");
                      setCuimsToken(null);
                      setCuimsData(null);
                    }}
                    className="text-xs font-medium text-emerald-700/60 hover:text-emerald-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
                
                {cuimsData?.marks?.sessions?.length > 1 && (
                  <div className="flex overflow-x-auto gap-2 px-1 pb-2 no-scrollbar">
                    {cuimsData.marks.sessions.map((sess) => (
                      <button
                        key={sess.value}
                        onClick={() => setActiveSession(sess.value)}
                        className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                          activeSession === sess.value
                            ? "bg-emerald-900/10 text-emerald-950"
                            : "bg-white/40 text-emerald-950/50 hover:bg-white/60"
                        }`}
                      >
                        {sess.name}
                        {sess.isCurrent && " ●"}
                      </button>
                    ))}
                  </div>
                )}

                {activeSession && Array.isArray(cuimsData?.marks?.data?.[activeSession]) && cuimsData.marks.data[activeSession].length > 0 ? (
                  <>
                    <PerformanceChart sessionData={cuimsData.marks.data[activeSession]} />
                    {cuimsData.marks.data[activeSession].map((subj, i) => (
                      <MarksCard key={`${activeSession}-${i}`} subject={subj} />
                    ))}
                  </>
                ) : (
                  <div className="animate-fade-up rounded-[24px] bg-gradient-to-b from-white/60 to-white/30 p-8 ring-1 ring-emerald-900/5 shadow-sm backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-2">📝</span>
                    <p className="text-sm text-emerald-950/60 font-medium">No marks data available for this session.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
    </>
  );
}
