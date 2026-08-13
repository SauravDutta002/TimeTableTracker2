export default function MarksCard({ subject }) {
  const { name, marks } = subject;

  // Check if it's a grade-only subject (like "- Grade" with value "A+")
  const isGradeOnly =
    marks.length === 1 &&
    marks[0].element.toLowerCase().includes('grade');

  // Calculate totals
  let totalMax = 0;
  let totalObtained = 0;
  let hasNumericMarks = false;

  marks.forEach((m) => {
    const max = parseFloat(m.total);
    const obt = parseFloat(m.obtained);
    if (!isNaN(max) && !isNaN(obt)) {
      totalMax += max;
      totalObtained += obt;
      hasNumericMarks = true;
    }
  });

  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : null;

  let colorClass = 'text-emerald-500';
  let bgClass = 'bg-emerald-500/10';
  
  if (percentage) {
    const p = parseFloat(percentage);
    if (p < 50) {
      colorClass = 'text-rose-500';
      bgClass = 'bg-rose-500/10';
    } else if (p < 75) {
      colorClass = 'text-amber-500';
      bgClass = 'bg-amber-500/10';
    }
  }

  return (
    <div className="animate-fade-up rounded-[24px] bg-gradient-to-b from-white/60 to-white/30 p-4 ring-1 ring-emerald-900/5 shadow-sm backdrop-blur-md mb-3">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-sm text-emerald-950 leading-snug">
          {name}
        </h3>
        {percentage && (
          <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${colorClass} ${bgClass}`}>
            {percentage}%
          </span>
        )}
      </div>

      {isGradeOnly ? (
        <div className="flex justify-center py-3">
          <span className="text-3xl font-bold text-emerald-900/80 drop-shadow-sm">
            {marks[0].obtained}
          </span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-emerald-900/5 ring-1 ring-emerald-900/5">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-emerald-900/5 text-emerald-950/60 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2">Component</th>
                <th className="px-3 py-2 text-right">Max</th>
                <th className="px-3 py-2 text-right">Obtained</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5 text-emerald-950 font-medium">
              {marks.map((m, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">{m.element}</td>
                  <td className="px-3 py-2 text-right">{m.total}</td>
                  <td className="px-3 py-2 text-right">{m.obtained}</td>
                </tr>
              ))}
              {hasNumericMarks && (
                <tr className="bg-emerald-900/5 font-bold">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right">{totalMax}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">{totalObtained}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
