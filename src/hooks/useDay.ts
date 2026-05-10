import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getDayNumber, getWorkoutDayNum, getToday } from '../utils/dateHelpers';
import { WORKOUTS } from '../constants/workouts';
import { useAuth } from './useAuth';

export interface DailyLog {
  id: string;
  user_id: string;
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
  const { user } = useAuth();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const today = getToday();
  const dayNum = Math.max(getDayNumber(), 1);
  const workoutDayNum = getWorkoutDayNum(dayNum);
  const isRestDay = workoutDayNum === 7;
  const todayWorkout = WORKOUTS[workoutDayNum] || WORKOUTS[7];

  const fetchLog = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('date', today)
      .eq('user_id', user.id)
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
        user_id: user.id,
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
  }, [today, dayNum, user]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const updateLog = useCallback(async (updates: Partial<DailyLog>) => {
    if (!log || !user) return;

    // Deep merge workout and sleep objects instead of replacing
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
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating log:', error);
      return;
    }
    if (data) setLog(data as DailyLog);
  }, [log, user]);

  return {
    log,
    loading,
    dayNum,
    workoutDayNum,
    isRestDay,
    todayWorkout,
    today,
    updateLog,
    refetch: fetchLog,
  };
}
