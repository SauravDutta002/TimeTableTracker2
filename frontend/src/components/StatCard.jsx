export default function StatCard({ gradient, label, value, unit, sub, right, className = "" }) {
  return (
    <div
      className={`press relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-br p-4 shadow-sm ring-1 ring-emerald-900/5 ${gradient} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-60" />
      <div className="relative flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-emerald-900/70">{label}</span>
        {right}
      </div>
      <div className="relative mt-3 flex items-end gap-1">
        <span className="truncate text-[28px] font-semibold leading-none tracking-tight text-emerald-950">{value}</span>
        {unit && <span className="shrink-0 pb-0.5 text-sm font-medium text-emerald-900/70">{unit}</span>}
      </div>
      {sub && <span className="relative mt-1 truncate text-[12px] text-emerald-900/70">{sub}</span>}
    </div>
  );
}
