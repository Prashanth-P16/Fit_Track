import { useState, useCallback, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported] = useState(() => 'Notification' in window);

  useEffect(() => {
    if (supported) {
      setPermission(Notification.permission);
    }
  }, [supported]);

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

  const scheduleMealReminder = useCallback(
    (mealName: string, mealTime: string) => {
      if (permission !== 'granted') return;
      const [h, m] = mealTime.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m - 15, 0, 0);

      if (target <= now) return;

      const delay = target.getTime() - now.getTime();
      return setTimeout(() => {
        notify('FitTrack', `${mealName} in 15 mins — ready?`, `meal-${mealName}`);
      }, delay);
    },
    [permission, notify]
  );

  const scheduleWaterReminder = useCallback(
    (intervalHours: number = 2) => {
      if (permission !== 'granted') return;

      const now = new Date();
      const startHour = 9;
      const endHour = 22;

      const timeouts: ReturnType<typeof setTimeout>[] = [];

      for (let hour = startHour; hour <= endHour; hour += intervalHours) {
        const target = new Date();
        target.setHours(hour, 0, 0, 0);
        if (target <= now) continue;

        const delay = target.getTime() - now.getTime();
        timeouts.push(
          setTimeout(() => {
            notify('FitTrack', 'Did you drink 500ml since last reminder?', 'water');
          }, delay)
        );
      }
      return timeouts;
    },
    [permission, notify]
  );

  return {
    supported,
    permission,
    requestPermission,
    notify,
    scheduleMealReminder,
    scheduleWaterReminder,
  };
}
