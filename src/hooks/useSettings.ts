import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_TARGETS } from '../constants/targets';

export interface UserSettings {
  id: string;
  calorie_target: number;
  protein_target: number;
  water_target: number;
  sleep_target: number;
  notification_meals: boolean;
  notification_water: boolean;
  notification_measurements: boolean;
  water_reminder_hours: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
      return;
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('user_settings')
        .insert({
          calorie_target: 1824,
          protein_target: 169,
          water_target: 4000,
          sleep_target: 7.0,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error creating settings:', insertError);
      } else {
        setSettings(inserted as UserSettings);
      }
    } else {
      setSettings(data as UserSettings);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!settings) return;

    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating settings:', error);
      return;
    }
    setSettings(data);
  }, [settings]);

  const targets = settings
    ? {
        calories: settings.calorie_target,
        protein: settings.protein_target,
        water: settings.water_target,
        sleep: settings.sleep_target,
      }
    : DEFAULT_TARGETS;

  return { settings, targets, loading, updateSettings, refetch: fetchSettings };
}
