import { Flame } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  monthOnTarget: number;
}

export function StreakCounter({ currentStreak, bestStreak, monthOnTarget }: StreakCounterProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-3">Streak</h3>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-2xl font-bold text-white">{currentStreak}</span>
        </div>
        <div className="text-xs text-slate-500">
          <p>Best: {bestStreak} days</p>
          <p>This month: {monthOnTarget} on-target</p>
        </div>
      </div>
    </div>
  );
}
