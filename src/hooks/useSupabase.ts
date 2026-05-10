import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getDaysAgo } from '../utils/dateHelpers';
import { useAuth } from './useAuth';

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
  const { user } = useAuth();
  const [weekLogs, setWeekLogs] = useState<WeekLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeekLogs = useCallback(async () => {
    if (!user) return;
    const sevenDaysAgo = getDaysAgo(7);
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', sevenDaysAgo)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching week logs:', error);
      return;
    }
    setWeekLogs((data as WeekLog[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWeekLogs();
  }, [fetchWeekLogs]);

  const fetchLogsRange = useCallback(async (startDate: string, endDate: string) => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching logs range:', error);
      return [];
    }
    return (data as WeekLog[]) || [];
  }, [user]);

  const fetchAllLogs = useCallback(async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching all logs:', error);
      return [];
    }
    return (data as WeekLog[]) || [];
  }, [user]);

  return { weekLogs, loading, fetchWeekLogs, fetchLogsRange, fetchAllLogs };
}
