export default function PersonToggle({ people, active, onChange }) {
  return (
    <div className="flex gap-1.5 rounded-2xl bg-white/[0.06] p-1.5">
      {Object.values(people).map((p) => {
        const isActive = p.id === active;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`press flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-white text-black" : "text-white/50"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white ${p.gradient}`}
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
