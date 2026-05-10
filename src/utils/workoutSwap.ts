import { WORKOUTS } from '../constants/workouts';
import { getWorkoutDayNum } from './dateHelpers';

export interface SwapResult {
  todayWorkout: number;
  swappedWorkout: number;
  isSwap: boolean;
}

export function getAvailableSwaps(currentDayNum: number): number[] {
  const currentWorkout = getWorkoutDayNum(currentDayNum);
  return Object.keys(WORKOUTS)
    .map(Number)
    .filter((d) => d !== currentWorkout);
}

export function performSwap(
  todayDayNum: number,
  targetWorkoutDay: number
): { todayGets: number; targetGets: number; targetDayNum: number } | null {
  const todayWorkout = getWorkoutDayNum(todayDayNum);
  const targetWorkout = getWorkoutDayNum(targetWorkoutDay);

  if (todayWorkout === targetWorkout) return null;

  const daysInCycle = 7;
  const currentCycleStart = Math.floor((todayDayNum - 1) / daysInCycle) * daysInCycle + 1;
  const targetDayInCycle = currentCycleStart + targetWorkoutDay - 1;

  return {
    todayGets: targetWorkout,
    targetGets: todayWorkout,
    targetDayNum: targetDayInCycle,
  };
}

export function checkMuscleConflict(workoutDay1: number, workoutDay2: number): boolean {
  const w1 = WORKOUTS[workoutDay1];
  const w2 = WORKOUTS[workoutDay2];
  if (!w1 || !w2) return false;

  const muscles1 = w1.exercises.map((e) => e.muscle.split('—')[0].trim().toLowerCase());
  const muscles2 = w2.exercises.map((e) => e.muscle.split('—')[0].trim().toLowerCase());

  return muscles1.some((m) => muscles2.includes(m));
}
