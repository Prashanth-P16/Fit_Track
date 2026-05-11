import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type BannerType = 'missed_meal' | 'water' | 'sunday_weigh' | 'sunday_analysis' | 'monthly_measure' | 'monthly_analysis' | null;

interface SmartBannerProps {
  onDismiss: () => void;
  onAction: (action: string, data?: any) => void;
  bannerType: BannerType;
  data?: Record<string, any>;
}

export function SmartBanner({ onDismiss, onAction, bannerType, data }: SmartBannerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (bannerType === 'water' && data?.snoozeTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, data.snoozeTime - Date.now());
        if (remaining === 0) {
          clearInterval(interval);
        }
        setTimeLeft(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [bannerType, data?.snoozeTime]);

  if (!bannerType) return null;

  const handleDismiss = () => {
    onDismiss();
  };

  // PRIORITY 1 — Missed meal banner
  if (bannerType === 'missed_meal') {
    return (
      <div className="sticky top-16 bg-[#1a1a0d] border-b-2 border-orange-500/30 px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg">🍽</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{data?.mealName} — did you eat?</p>
            <p className="text-xs text-slate-400">Scheduled: {data?.mealTime}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onAction('meal_done', { mealId: data?.mealId })}
            className="px-2.5 py-1 text-xs bg-emerald-400/20 text-emerald-400 rounded hover:bg-emerald-400/30 transition-colors"
          >
            ✅ Done
          </button>
          <button
            onClick={() => onAction('meal_skip', { mealId: data?.mealId })}
            className="px-2.5 py-1 text-xs bg-red-400/20 text-red-400 rounded hover:bg-red-400/30 transition-colors"
          >
            ❌ Skipped
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // PRIORITY 2 — Water reminder banner
  if (bannerType === 'water') {
    return (
      <div className="sticky top-16 bg-[#0d1a2e] border-b-2 border-cyan-400/30 px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg">💧</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Water check</p>
            <p className="text-xs text-slate-400">Did you drink 500ml in last 2 hours?</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Today: {data?.waterLogged}ml of {data?.waterTarget}ml
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onAction('water_yes')}
            className="px-2.5 py-1 text-xs bg-cyan-400/20 text-cyan-400 rounded hover:bg-cyan-400/30 transition-colors whitespace-nowrap"
          >
            ✅ Yes +500ml
          </button>
          <button
            onClick={() => onAction('water_snooze')}
            className="px-2.5 py-1 text-xs bg-slate-600/20 text-slate-400 rounded hover:bg-slate-600/30 transition-colors"
          >
            ⏭ 30 mins
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // PRIORITY 3 — Sunday weigh-in banner
  if (bannerType === 'sunday_weigh') {
    return (
      <div className="sticky top-16 bg-[#1a0d1a] border-b-2 border-emerald-400/30 px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg">⚖️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Sunday weigh-in</p>
            <p className="text-xs text-slate-400">Log your weight for weekly check-in</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onAction('go_to_weight')}
            className="px-3 py-1 text-xs bg-emerald-400/20 text-emerald-400 rounded hover:bg-emerald-400/30 transition-colors whitespace-nowrap"
          >
            Go to Weight Log
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // PRIORITY 4 — Sunday analysis banner
  if (bannerType === 'sunday_analysis') {
    return (
      <div className="sticky top-16 bg-[#0d1a14] border-b-2 border-blue-400/30 px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg">📊</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Week {data?.weekNumber} check-in ready</p>
            <p className="text-xs text-slate-400">Weight logged — run your analysis</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onAction('go_to_analysis')}
            className="px-3 py-1 text-xs bg-blue-400/20 text-blue-400 rounded hover:bg-blue-400/30 transition-colors whitespace-nowrap"
          >
            Run Analysis
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // PRIORITY 5 — Monthly measurement banner
  if (bannerType === 'monthly_measure') {
    return (
      <div className="sticky top-16 bg-[#1a140d] border-b-2 border-amber-400/30 px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg">📏</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Monthly measurements due today</p>
            <p className="text-xs text-slate-400">Takes 5 minutes</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onAction('go_to_measurements')}
            className="px-3 py-1 text-xs bg-amber-400/20 text-amber-400 rounded hover:bg-amber-400/30 transition-colors whitespace-nowrap"
          >
            Go to Measurements
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // PRIORITY 6 — Monthly analysis banner
  if (bannerType === 'monthly_analysis') {
    return (
      <div className="sticky top-16 bg-[#0d1a0d] border-b-2 border-purple-400/30 px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg">📊</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Month {data?.monthNumber} deep dive ready</p>
            <p className="text-xs text-slate-400">Measurements logged — analyze trends</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onAction('go_to_monthly_analysis')}
            className="px-3 py-1 text-xs bg-purple-400/20 text-purple-400 rounded hover:bg-purple-400/30 transition-colors whitespace-nowrap"
          >
            Run Analysis
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
