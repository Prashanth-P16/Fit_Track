interface GymHeatmapProps {
  data: { date: string; status: 'gym' | 'cardio' | 'rest' | 'skipped' }[];
}

const STATUS_COLORS: Record<string, string> = {
  gym: 'bg-emerald-500',
  cardio: 'bg-emerald-300',
  rest: 'bg-slate-700',
  skipped: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  gym: 'Gym done',
  cardio: 'Cardio only',
  rest: 'Rest day',
  skipped: 'Skipped',
};

export function GymHeatmap({ data }: GymHeatmapProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-3">Gym Consistency</h3>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div key={d} className="text-[10px] text-slate-500 text-center">{d}</div>
        ))}
        {data.map((entry, i) => (
          <div
            key={i}
            className={`w-full aspect-square rounded-md ${STATUS_COLORS[entry.status] || 'bg-slate-800'}`}
            title={`${entry.date}: ${STATUS_LABELS[entry.status]}`}
          />
        ))}
      </div>
      <div className="flex gap-3 mt-3">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-sm ${STATUS_COLORS[key]}`} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
