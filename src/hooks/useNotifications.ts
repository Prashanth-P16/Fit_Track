import { useState, useCallback, useEffect, useRef } from 'react';
import { GYM_DAY_MEALS, REST_DAY_MEALS } from '../constants/meals';
import { supabase } from '../lib/supabase';
import { getToday } from '../utils/dateHelpers';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported] = useState(() => 'Notification' in window);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (supported) {
      setPermission(Notification.permission);
    }
  }, [supported]);

  const clearAllScheduled = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [supported]);

  const notify = useCallback(
    (title: string, body: string, tag?: string) => {
      if (permission !== 'granted') return;
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        tag,
        requireInteraction: true,
      });
    },
    [permission]
  );

  const updateMealStatus = useCallback(async (mealId: string, status: 'done' | 'skipped') => {
    const today = getToday();
    const { data: log } = await supabase
      .from('daily_logs')
      .select('id, meals')
      .eq('date', today)
      .maybeSingle();

    if (log) {
      const meals = { ...(log.meals as Record<string, string>), [mealId]: status };
      await supabase
        .from('daily_logs')
        .update({ meals, updated_at: new Date().toISOString() })
        .eq('id', log.id);
    }
  }, []);

  const scheduleMealReminders = useCallback(
    (isRestDay: boolean) => {
      if (permission !== 'granted') return;
      const meals = isRestDay ? REST_DAY_MEALS : GYM_DAY_MEALS;

      for (const meal of meals) {
        const [h, m] = meal.time.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(h, m - 15, 0, 0);

        if (target <= now) continue;

        const delay = target.getTime() - now.getTime();
        const t = setTimeout(() => {
          notify('FitTrack', `${meal.label} in 15 mins — ready?`, `meal-${meal.id}`);

          // Schedule follow-up 30 mins after meal time
          const followUpDelay = 30 * 60 * 1000;
          const ft = setTimeout(() => {
            const n = new Notification(`Did you eat ${meal.label}?`, {
              body: 'Tap to update your meal status',
              icon: '/icons/icon-192.png',
              tag: `meal-followup-${meal.id}`,
              requireInteraction: true,
            });
            n.onclick = () => {
              updateMealStatus(meal.id, 'done');
              n.close();
            };
          }, followUpDelay);
          timeoutsRef.current.push(ft);
        }, delay);
        timeoutsRef.current.push(t);
      }
    },
    [permission, notify, updateMealStatus]
  );

  const scheduleWaterReminders = useCallback(
    (intervalHours: number = 2) => {
      if (permission !== 'granted') return;

      const now = new Date();
      const startHour = 9;
      const endHour = 22;

      for (let hour = startHour; hour <= endHour; hour += intervalHours) {
        const target = new Date();
        target.setHours(hour, 0, 0, 0);
        if (target <= now) continue;

        const delay = target.getTime() - now.getTime();
        const t = setTimeout(() => {
          notify('FitTrack', 'Did you drink 500ml since last reminder?', 'water');
        }, delay);
        timeoutsRef.current.push(t);
      }
    },
    [permission, notify]
  );

  const scheduleAll = useCallback(
    (isRestDay: boolean) => {
      clearAllScheduled();
      scheduleMealReminders(isRestDay);
      scheduleWaterReminders();
    },
    [clearAllScheduled, scheduleMealReminders, scheduleWaterReminders]
  );

  // Schedule midnight re-schedule
  useEffect(() => {
    if (permission !== 'granted') return;

    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const delay = midnight.getTime() - now.getTime();

    const t = setTimeout(() => {
      const tomorrow = new Date();
      const dayOfWeek = tomorrow.getDay();
      const isRest = dayOfWeek === 0;
      scheduleAll(isRest);
    }, delay);
    timeoutsRef.current.push(t);

    return () => clearTimeout(t);
  }, [permission, scheduleAll]);

  return {
    supported,
    permission,
    requestPermission,
    notify,
    scheduleMealReminders,
    scheduleWaterReminders,
    scheduleAll,
    clearAllScheduled,
  };
}
