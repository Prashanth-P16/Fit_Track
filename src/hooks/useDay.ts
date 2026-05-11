import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getDayNumber, getWorkoutDayNum, getToday } from '../utils/dateHelpers';
import { WORKOUTS } from '../constants/workouts';

export interface DailyLog {
  id: string;
  date: string;
  day_num: number;
  meals: Record<string, 'done' | 'skipped' | 'pending'>;
  water: number;
  workout: Record<string, unknown>;
  workout_swapped: boolean;
  swap_reason: string | null;
  sleep: Record<string, unknown>;
  weight: number | null;
  dinner_type: string | null;
  dinner_custom: { name: string; cal: number; protein: number } | null;
  notes: string | null;
  ai_analysis: string | null;
  ai_score: number | null;
}

export function useDay() {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const today = getToday();
  const dayNum = Math.max(getDayNumber(), 1);
  const workoutDayNum = getWorkoutDayNum(dayNum);
  const isRestDay = workoutDayNum === 7;

  // Resolve the actual workout to display, considering swaps
  const resolveSwappedWorkoutDay = (logData: DailyLog | null): number => {
    if (logData?.workout_swapped && logData?.swap_reason) {
      const matches = logData.swap_reason.match(/Day (\d+)/g);
      if (matches && matches.length >= 2) {
        const fromDay = parseInt(matches[0].replace('Day ', ''));
        const toDay = parseInt(matches[1].replace('Day ', ''));
        // If today is the "from" day, show the "to" day's workout
        if (fromDay === workoutDayNum) return toDay;
        // If today is the "to" day, show the "from" day's workout
        if (toDay === workoutDayNum) return fromDay;
      }
    }
    return workoutDayNum;
  };

  const effectiveWorkoutDay = resolveSwappedWorkoutDay(log);
  const todayWorkout = WORKOUTS[effectiveWorkoutDay] || WORKOUTS[7];

  const fetchLog = useCallback(async () => {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching daily log:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setLog(data as DailyLog);
    } else {
      const newLog = {
        date: today,
        day_num: dayNum,
        meals: {},
        water: 0,
        workout: {},
        workout_swapped: false,
        sleep: {},
      };
      const { data: inserted, error: insertError } = await supabase
        .from('daily_logs')
        .insert(newLog)
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error creating daily log:', insertError);
      } else {
        setLog(inserted as DailyLog);
      }
    }
    setLoading(false);
  }, [today, dayNum]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const updateLog = useCallback(async (updates: Partial<DailyLog>) => {
    if (!log) return;

    const cleanUpdates: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };

    if (updates.workout) {
      cleanUpdates.workout = {
        ...(log.workout as Record<string, unknown>),
        ...updates.workout,
      };
    }

    if (updates.sleep) {
      cleanUpdates.sleep = {
        ...(log.sleep as Record<string, unknown>),
        ...updates.sleep,
      };
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .update(cleanUpdates)
      .eq('id', log.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating log:', error);
      return;
    }
    if (data) setLog(data as DailyLog);
  }, [log]);

  return {
    log,
    loading,
    dayNum,
    workoutDayNum,
    effectiveWorkoutDay,
    isRestDay,
    todayWorkout,
    today,
    updateLog,
    refetch: fetchLog,
  };
}
