export default function PersonToggle({ people, active, onChange }) {
  return (
    <div className="flex gap-1.5 rounded-2xl bg-[#EAE6DF] p-1.5 ring-1 ring-emerald-900/5 shadow-inner">
      {Object.values(people).map((p) => {
        const isActive = p.id === active;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`press flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-white text-emerald-950 shadow-sm" : "text-emerald-900/60 hover:bg-emerald-900/5"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-emerald-950 ${p.gradient}`}
            >
              {p.initials}
            </span>
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
