import { GYM_DAY_MEALS, REST_DAY_MEALS, DINNER_OPTIONS } from '../constants/meals';
import type { Meal, DinnerOption } from '../constants/meals';

export function getMealsForDay(isRestDay: boolean): Meal[] {
  return isRestDay ? REST_DAY_MEALS : GYM_DAY_MEALS;
}

export function calculateMealTotals(
  meals: Meal[],
  mealStatus: Record<string, 'done' | 'skipped' | 'pending'>,
  dinnerOption: DinnerOption | null,
  customDinner: { cal: number; protein: number } | null
): { totalCal: number; totalProtein: number; remainingCal: number; remainingProtein: number } {
  let totalCal = 0;
  let totalProtein = 0;

  meals.forEach((meal) => {
    if (mealStatus[meal.id] === 'done') {
      if (meal.id === 'dinner') {
        if (dinnerOption?.id === 'other' && customDinner) {
          totalCal += customDinner.cal;
          totalProtein += customDinner.protein;
        } else if (dinnerOption) {
          totalCal += dinnerOption.cal;
          totalProtein += dinnerOption.protein;
        }
      } else {
        totalCal += meal.cal;
        totalProtein += meal.protein;
      }
    }
  });

  return { totalCal, totalProtein, remainingCal: 0, remainingProtein: 0 };
}

export function getProgressColor(current: number, target: number): string {
  const pct = (current / target) * 100;
  if (pct >= 100) return 'text-emerald-400';
  if (pct >= 80) return 'text-amber-400';
  return 'text-red-400';
}

export function getProgressBarColor(current: number, target: number): string {
  const pct = (current / target) * 100;
  if (pct >= 100) return 'bg-emerald-400';
  if (pct >= 80) return 'bg-amber-400';
  return 'bg-red-400';
}

export function getSleepColor(hours: number): string {
  if (hours >= 7) return 'text-emerald-400';
  if (hours >= 6) return 'text-amber-400';
  return 'text-red-400';
}

export function calculateSleepHours(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);

  let bedMinutes = bh * 60 + bm;
  let wakeMinutes = wh * 60 + wm;

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  return (wakeMinutes - bedMinutes) / 60;
}

export function getDinnerOption(id: string): DinnerOption | undefined {
  return DINNER_OPTIONS.find((o) => o.id === id);
}

export function getStreakCount(logs: { cal_hit: boolean; protein_hit: boolean; water_hit: boolean }[]): number {
  let streak = 0;
  for (const log of logs) {
    if (log.cal_hit && log.protein_hit && log.water_hit) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
