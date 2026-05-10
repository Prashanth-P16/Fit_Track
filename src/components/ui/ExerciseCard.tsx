import type { Exercise } from '../../constants/workouts';

interface ExerciseCardProps {
  exercise: Exercise;
  lastWeekWeights: { weight: number; reps: number }[];
  thisWeekSets: { weight: string; reps: string }[];
  onSetChange: (setIndex: number, field: 'weight' | 'reps', value: string) => void;
}

export function ExerciseCard({
  exercise,
  lastWeekWeights,
  thisWeekSets,
  onSetChange,
}: ExerciseCardProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-3">
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="text-sm font-medium text-white">{exercise.name}</h4>
        <span className="text-xs text-slate-500">{exercise.muscle}</span>
      </div>

      {lastWeekWeights.length > 0 && (
        <div className="mb-2 px-2 py-1.5 bg-[#0a0a0f] rounded-lg">
          <p className="text-[10px] text-slate-500 mb-1">Last week</p>
          <div className="flex gap-4">
            {lastWeekWeights.map((s, i) => (
              <span key={i} className="text-xs text-slate-400">
                S{i + 1}: {s.weight}kg x {s.reps}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {thisWeekSets.map((set, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-6">S{i + 1}</span>
            <input
              type="number"
              placeholder="kg"
              value={set.weight}
              onChange={(e) => onSetChange(i, 'weight', e.target.value)}
              className="w-20 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
            />
            <span className="text-xs text-slate-500">x</span>
            <input
              type="number"
              placeholder="reps"
              value={set.reps}
              onChange={(e) => onSetChange(i, 'reps', e.target.value)}
              className="w-16 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
