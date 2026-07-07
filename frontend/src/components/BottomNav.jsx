const TABS = [
  {
    id: "today",
    label: "Today",
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? "white" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="5" width="17" height="15" rx="3" fill={active ? "white" : "none"} fillOpacity={active ? 0.15 : 0} />
        <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "together",
    label: "Together",
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8.5" r="3" fill={active ? "white" : "none"} fillOpacity={active ? 0.15 : 0} />
        <circle cx="16" cy="9.5" r="2.6" />
        <path d="M3 19.5c0-3 2.7-5 6-5s6 2 6 5M14 14.7c2.6.3 4.5 2 4.5 4.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav({ active, onChange }) {
  const activeIndex = TABS.findIndex((t) => t.id === active);

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 flex justify-center">
      <div className="relative mx-auto mb-4 flex w-[calc(100%-32px)] max-w-md items-center justify-around rounded-[26px] border border-white/10 bg-black/70 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div
          className="absolute top-2 bottom-2 left-2 rounded-2xl bg-white/[0.08] transition-transform duration-300 ease-out"
          style={{
            width: `calc((100% - 16px) / 3)`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`press relative z-10 flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-white" : "text-white/40"
              }`}
            >
              {tab.icon(isActive)}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
