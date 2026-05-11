import { Activity } from 'lucide-react';

interface HeaderProps {
  dayNum: number;
  workoutLabel: string;
}

export function Header({ dayNum, workoutLabel }: HeaderProps) {
  return (
    <header className="px-4 pt-8 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-400" />
          <h1 className="text-lg font-bold text-white tracking-tight">FitTrack</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Day {dayNum}</p>
          <p className="text-sm font-medium text-emerald-400">{workoutLabel}</p>
        </div>
      </div>
    </header>
  );
}
