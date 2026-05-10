import { Check, X, Clock } from 'lucide-react';
import type { Meal } from '../../constants/meals';

interface MealCardProps {
  meal: Meal;
  status: 'done' | 'skipped' | 'pending';
  onDone: () => void;
  onSkip: () => void;
}

export function MealCard({ meal, status, onDone, onSkip }: MealCardProps) {
  const statusColor =
    status === 'done'
      ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
      : status === 'skipped'
        ? 'text-red-400 border-red-400/30 bg-red-400/5'
        : 'text-slate-400 border-[#1e1e2e] bg-[#12121a]';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${statusColor} transition-colors`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-500">{meal.time}</span>
        </div>
        <p className="text-sm font-medium text-white mt-0.5 truncate">{meal.label}</p>
        <div className="flex gap-3 mt-1">
          <span className="text-xs text-slate-400">{meal.cal} kcal</span>
          <span className="text-xs text-slate-400">{meal.protein}g protein</span>
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        {status === 'pending' ? (
          <>
            <button
              onClick={onDone}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onSkip}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div
            className={`w-9 h-9 flex items-center justify-center rounded-lg ${
              status === 'done' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'
            }`}
          >
            {status === 'done' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </div>
        )}
      </div>
    </div>
  );
}
