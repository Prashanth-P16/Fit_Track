import { useState, useEffect, useCallback } from 'react';
import { Droplets, Flame, Beef, Scale, CheckCircle2 } from 'lucide-react';
import { useDay } from '../../hooks/useDay';
import { useSettings } from '../../hooks/useSettings';
import { getMealsForDay } from '../../utils/calculations';
import { getProgressBarColor, getDinnerOption } from '../../utils/calculations';
import type { DinnerOption } from '../../constants/meals';
import { MealCard } from '../ui/MealCard';
import { DinnerDropdown } from '../ui/DinnerDropdown';
import { isSunday } from '../../utils/dateHelpers';

export function OverviewTab() {
  const { log, loading, isRestDay, updateLog } = useDay();
  const { targets } = useSettings();
  const [dinnerOption, setDinnerOption] = useState<DinnerOption | null>(null);
  const [customDinner, setCustomDinner] = useState<{ name: string; cal: number; protein: number }>({
    name: '',
    cal: 0,
    protein: 0,
  });

  const meals = getMealsForDay(isRestDay);
  const mealStatus = log?.meals || {};

  useEffect(() => {
    if (log?.dinner_type) {
      const opt = getDinnerOption(log.dinner_type);
      if (opt) setDinnerOption(opt);
    }
    if (log?.dinner_custom) {
      setCustomDinner(log.dinner_custom as typeof customDinner);
    }
  }, [log?.dinner_type, log?.dinner_custom]);

  const totalCal = meals.reduce((sum, m) => {
    if (mealStatus[m.id] !== 'done') return sum;
    if (m.id === 'dinner') {
      if (dinnerOption?.id === 'other') return sum + customDinner.cal;
      if (dinnerOption) return sum + dinnerOption.cal;
      return sum;
    }
    return sum + m.cal;
  }, 0);

  const totalProtein = meals.reduce((sum, m) => {
    if (mealStatus[m.id] !== 'done') return sum;
    if (m.id === 'dinner') {
      if (dinnerOption?.id === 'other') return sum + customDinner.protein;
      if (dinnerOption) return sum + dinnerOption.protein;
      return sum;
    }
    return sum + m.protein;
  }, 0);

  const water = log?.water || 0;

  const handleMealDone = useCallback(
    (mealId: string) => {
      updateLog({ meals: { ...mealStatus, [mealId]: 'done' } });
    },
    [mealStatus, updateLog]
  );

  const handleMealSkip = useCallback(
    (mealId: string) => {
      updateLog({ meals: { ...mealStatus, [mealId]: 'skipped' } });
    },
    [mealStatus, updateLog]
  );

  const handleDinnerSelect = useCallback(
    (opt: DinnerOption) => {
      setDinnerOption(opt);
      updateLog({
        dinner_type: opt.id,
        dinner_custom: opt.id === 'other' ? customDinner : null,
      });
    },
    [customDinner, updateLog]
  );

  const handleCustomDinnerChange = useCallback(
    (field: 'name' | 'cal' | 'protein', value: string) => {
      const updated = { ...customDinner, [field]: Number(value) || 0 };
      if (field === 'name') updated[field] = value as never;
      setCustomDinner(updated);
      updateLog({ dinner_custom: updated });
    },
    [customDinner, updateLog]
  );

  const handleWaterAdd = useCallback(
    (ml: number) => {
      updateLog({ water: water + ml });
    },
    [water, updateLog]
  );

  const handleWeightLog = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        updateLog({ weight: val });
      }
    },
    [updateLog]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-28 space-y-4">
      {/* Progress Bars */}
      <div className="space-y-3">
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-slate-400">Calories</span>
            </div>
            <span className="text-xs text-white font-medium">
              {totalCal} / {targets.calories} kcal
            </span>
          </div>
          <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressBarColor(totalCal, targets.calories)}`}
              style={{ width: `${Math.min((totalCal / targets.calories) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Beef className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Protein</span>
            </div>
            <span className="text-xs text-white font-medium">
              {totalProtein} / {targets.protein}g
            </span>
          </div>
          <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressBarColor(totalProtein, targets.protein)}`}
              style={{ width: `${Math.min((totalProtein / targets.protein) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Water</span>
            </div>
            <span className="text-xs text-white font-medium">
              {water} / {targets.water}ml
            </span>
          </div>
          <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-cyan-400"
              style={{ width: `${Math.min((water / targets.water) * 100, 100)}%` }}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleWaterAdd(250)}
              className="px-2.5 py-1 text-[10px] bg-cyan-400/10 text-cyan-400 rounded-lg hover:bg-cyan-400/20 transition-colors"
            >
              +250ml
            </button>
            <button
              onClick={() => handleWaterAdd(500)}
              className="px-2.5 py-1 text-[10px] bg-cyan-400/10 text-cyan-400 rounded-lg hover:bg-cyan-400/20 transition-colors"
            >
              +500ml
            </button>
            <button
              onClick={() => handleWaterAdd(1000)}
              className="px-2.5 py-1 text-[10px] bg-cyan-400/10 text-cyan-400 rounded-lg hover:bg-cyan-400/20 transition-colors"
            >
              +1L
            </button>
          </div>
        </div>
      </div>

      {/* Sunday Weight */}
      {isSunday() && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Sunday Weigh-in</span>
          </div>
          <input
            type="number"
            step="0.1"
            placeholder="Weight in kg"
            value={log?.weight || ''}
            onChange={handleWeightLog}
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
          />
        </div>
      )}

      {/* Daily Checklist */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <h3 className="text-xs text-slate-400 mb-3">Daily Checklist</h3>
        <div className="space-y-2">
          {[
            { label: 'All meals logged', done: Object.keys(mealStatus).length >= meals.length },
            { label: 'Gym completed', done: log?.workout?.done === true },
            { label: 'Cardio done', done: log?.workout?.cardio_done === true },
            { label: 'Water target hit', done: water >= targets.water },
            { label: 'Sleep logged', done: !!log?.sleep?.bedtime },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <CheckCircle2
                className={`w-4 h-4 ${item.done ? 'text-emerald-400' : 'text-slate-600'}`}
              />
              <span className={`text-xs ${item.done ? 'text-white' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div>
        <h3 className="text-xs text-slate-400 mb-2">Meals</h3>
        <div className="space-y-2">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              status={(mealStatus[meal.id] as 'done' | 'skipped' | 'pending') || 'pending'}
              onDone={() => handleMealDone(meal.id)}
              onSkip={() => handleMealSkip(meal.id)}
            />
          ))}
        </div>
      </div>

      {/* Dinner Dropdown */}
      <DinnerDropdown
        selected={log?.dinner_type || null}
        customDinner={customDinner}
        onSelect={handleDinnerSelect}
        onCustomChange={handleCustomDinnerChange}
      />

      {/* Remaining */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-slate-400">Remaining</p>
            <p className="text-lg font-bold text-white">{Math.max(targets.calories - totalCal, 0)} kcal</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Protein left</p>
            <p className="text-lg font-bold text-white">{Math.max(targets.protein - totalProtein, 0)}g</p>
          </div>
        </div>
      </div>
    </div>
  );
}
