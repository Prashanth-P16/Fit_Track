import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getDaysAgo } from '../utils/dateHelpers';

export interface WeekLog {
  date: string;
  day_num: number;
  meals: Record<string, string>;
  water: number;
  workout: Record<string, unknown>;
  sleep: Record<string, unknown>;
  weight: number | null;
  dinner_type: string | null;
  ai_score: number | null;
}

export function useSupabase() {
  const [weekLogs, setWeekLogs] = useState<WeekLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeekLogs = useCallback(async () => {
    const sevenDaysAgo = getDaysAgo(7);
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('date', sevenDaysAgo)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching week logs:', error);
      return;
    }
    setWeekLogs((data as WeekLog[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWeekLogs();
  }, [fetchWeekLogs]);

  const fetchLogsRange = useCallback(async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching logs range:', error);
      return [];
    }
    return (data as WeekLog[]) || [];
  }, []);

  const fetchAllLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching all logs:', error);
      return [];
    }
    return (data as WeekLog[]) || [];
  }, []);

  return { weekLogs, loading, fetchWeekLogs, fetchLogsRange, fetchAllLogs };
}
