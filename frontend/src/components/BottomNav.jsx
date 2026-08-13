import {
  HiHome,
  HiOutlineHome,
  HiCalendarDays,
  HiOutlineCalendarDays,
  HiUserGroup,
  HiOutlineUserGroup,
  HiClipboardDocumentCheck,
  HiOutlineClipboardDocumentCheck,
  HiChartBar,
  HiOutlineChartBar,
} from "react-icons/hi2";

const TABS = [
  { id: "today", label: "Today", Icon: HiOutlineHome, IconActive: HiHome },
  { id: "schedule", label: "Schedule", Icon: HiOutlineCalendarDays, IconActive: HiCalendarDays },
  { id: "together", label: "Together", Icon: HiOutlineUserGroup, IconActive: HiUserGroup },
  { id: "attendance", label: "Attendance", Icon: HiOutlineClipboardDocumentCheck, IconActive: HiClipboardDocumentCheck },
  { id: "marks", label: "Marks", Icon: HiOutlineChartBar, IconActive: HiChartBar },
];

export default function BottomNav({ active, onChange }) {
  const activeIndex = TABS.findIndex((t) => t.id === active);

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 flex justify-center">
      <div className="relative mx-auto mb-4 flex w-[calc(100%-32px)] max-w-md items-center justify-around rounded-[26px] border border-white/60 bg-white/70 p-2 shadow-lg shadow-[#2C3628]/10 backdrop-blur-xl">
        <div
          className="absolute top-2 bottom-2 left-2 rounded-2xl bg-[#EAE6DF] transition-transform duration-300 ease-out"
          style={{
            width: `calc((100% - 16px) / 5)`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const Icon = isActive ? tab.IconActive : tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`press relative z-10 flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-emerald-950" : "text-emerald-950/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
