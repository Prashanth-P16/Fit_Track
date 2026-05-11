import React, { useState } from 'react';

interface NotificationPermissionScreenProps {
  onEnable: () => void;
  onDismiss: () => void;
}

export function NotificationPermissionScreen({ onEnable, onDismiss }: NotificationPermissionScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        localStorage.setItem('notifications_enabled', 'true');
        localStorage.removeItem('notifications_declined');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
      onEnable();
    }
  };

  const handleNotNow = () => {
    localStorage.setItem('notifications_declined', 'true');
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center z-50 px-4">
      {/* Large Notification Icon */}
      <div className="w-20 h-20 bg-[#00e5a0]/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
        <span className="text-5xl">🔔</span>
      </div>

      {/* Content */}
      <div className="text-center max-w-sm space-y-4">
        <h1 className="text-3xl font-bold text-white">Stay on Track</h1>

        <p className="text-slate-400 text-sm">
          FitTrack sends reminders for:
        </p>

        <div className="space-y-2 text-left bg-[#12121a] border border-[#1e1e2e] rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-lg">🍽</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-white">Meal times</p>
              <p className="text-[10px] text-slate-500">6 reminders daily</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-lg">💧</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-white">Water reminders</p>
              <p className="text-[10px] text-slate-500">Every 2 hours</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-lg">⚖️</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-white">Sunday weigh-in</p>
              <p className="text-[10px] text-slate-500">Weekly check-in</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-lg">📊</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-white">Weekly analysis</p>
              <p className="text-[10px] text-slate-500">Progress summary</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-lg">📏</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-white">Monthly measurements</p>
              <p className="text-[10px] text-slate-500">1st of the month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3 mt-8">
        <button
          onClick={handleEnable}
          disabled={isLoading}
          className="w-full bg-[#00e5a0] hover:bg-[#00d491] text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Enabling...
            </>
          ) : (
            'Enable Notifications'
          )}
        </button>

        <button
          onClick={handleNotNow}
          disabled={isLoading}
          className="w-full bg-transparent hover:bg-[#12121a] text-slate-400 hover:text-slate-300 font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          Not now
        </button>
      </div>

      <p className="text-[10px] text-slate-500 mt-6 text-center">
        You can change this in Settings anytime
      </p>
    </div>
  );
}
