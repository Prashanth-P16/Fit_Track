import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/ui/Header';
import { TabBar, type TabId } from './components/ui/TabBar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { GymSleepTab } from './components/tabs/GymSleepTab';
import { ProgressTab } from './components/tabs/ProgressTab';
import { CoachTab } from './components/tabs/CoachTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { SetupScreen } from './components/SetupScreen';
import { NotificationPermissionScreen } from './components/ui/NotificationPermissionScreen';
import { SmartBanner, type BannerType } from './components/ui/SmartBanner';
import { useDay } from './hooks/useDay';
import { useBaseline } from './hooks/useBaseline';
import { getMealsForDay } from './utils/calculations';
import { supabase } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { dayNum, todayWorkout, isRestDay, log, updateLog } = useDay();
  const { hasBaseline, loading: baselineLoading } = useBaseline();
  
  // Notification permission management
  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  
  // Smart banner management
  const [currentBanner, setCurrentBanner] = useState<BannerType>(null);
  const [bannerData, setBannerData] = useState<Record<string, any>>({});
  const [bannerSnoozed, setBannerSnoozed] = useState<BannerType>(null);

  // Check notification permission on app load
  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      
      if (permission === 'default') {
        // Never asked — show permission screen
        const declined = localStorage.getItem('notifications_declined');
        if (!declined) {
          setShowPermissionScreen(true);
        }
      }
      
      setPermissionChecked(true);
    }
  }, []);

  // Handle URL params from notifications
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const mealId = params.get('id');
    
    if (action === 'water_yes') {
      updateLog({ water: (log?.water || 0) + 500 });
      localStorage.setItem('last_water_check', Date.now().toString());
      window.history.replaceState({}, '', '/');
    }
    
    if (action === 'water_snooze') {
      localStorage.setItem('water_snooze', (Date.now() + 30 * 60 * 1000).toString());
      window.history.replaceState({}, '', '/');
    }
    
    if (action === 'meal_check' && mealId) {
      setActiveTab('overview');
      window.history.replaceState({}, '', '/');
    }
    
    if (action === 'tab') {
      const tab = params.get('tab') as TabId;
      if (tab) {
        setActiveTab(tab);
        window.history.replaceState({}, '', '/');
      }
    }
  }, [log?.water, updateLog]);

  // Determine which banner to show (priority order)
  useEffect(() => {
    if (bannerSnoozed && currentBanner === bannerSnoozed) return;
    if (!log) return;

    const now = new Date();
    const isToday = log.date === now.toISOString().split('T')[0];
    if (!isToday) return;

    const meals = getMealsForDay(isRestDay);
    const mealStatus = log.meals || {};

    // PRIORITY 1 — Missed meal
    for (const meal of meals) {
      const status = mealStatus[meal.id];
      if (status === 'pending') {
        const [mealHour, mealMin] = meal.time.split(':').map(Number);
        const mealTimeMs = mealHour * 60 * 60 * 1000 + mealMin * 60 * 1000;
        const currentTimeMs = now.getHours() * 60 * 60 * 1000 + now.getMinutes() * 60 * 1000;
        const diff = currentTimeMs - mealTimeMs;

        if (diff > 15 * 60 * 1000) {
          setCurrentBanner('missed_meal');
          setBannerData({
            mealName: meal.label,
            mealTime: meal.time,
            mealId: meal.id,
          });
          return;
        }
      }
    }

    // PRIORITY 2 — Water reminder
    const lastWaterCheck = localStorage.getItem('last_water_check');
    const waterSnooze = localStorage.getItem('water_snooze');
    
    if (!waterSnooze || Date.now() > parseInt(waterSnooze)) {
      if (!lastWaterCheck || Date.now() - parseInt(lastWaterCheck) > 2 * 60 * 60 * 1000) {
        setCurrentBanner('water');
        setBannerData({
          waterLogged: log.water || 0,
          waterTarget: 4000,
        });
        return;
      }
    }

    // PRIORITY 3 — Sunday weigh-in
    if (now.getDay() === 0 && !log.weight) {
      setCurrentBanner('sunday_weigh');
      return;
    }

    // PRIORITY 4 — Sunday analysis
    if (now.getDay() === 0 && log.weight && !log.weekly_analysis_done) {
      setCurrentBanner('sunday_analysis');
      setBannerData({ weekNumber: Math.floor(dayNum / 7) });
      return;
    }

    // PRIORITY 5 — Monthly measurement
    const isFirstOfMonth = now.getDate() === 1;
    if (isFirstOfMonth) {
      // Check if measurements already logged this month
      supabase
        .from('body_measurements')
        .select('*')
        .eq('date', log.date)
        .limit(1)
        .then(({ data }) => {
          if (!data || data.length === 0) {
            setCurrentBanner('monthly_measure');
          }
        });
      return;
    }

    // PRIORITY 6 — Monthly analysis
    // Would check for monthly_analysis_done flag
  }, [log, isRestDay, dayNum, bannerSnoozed, currentBanner]);

  const handleBannerAction = useCallback(
    (action: string, data?: any) => {
      if (action === 'meal_done') {
        updateLog({
          meals: {
            ...log?.meals,
            [data.mealId]: 'done',
          },
        });
        setCurrentBanner(null);
      }

      if (action === 'meal_skip') {
        updateLog({
          meals: {
            ...log?.meals,
            [data.mealId]: 'skipped',
          },
        });
        setCurrentBanner(null);
      }

      if (action === 'water_yes') {
        updateLog({ water: (log?.water || 0) + 500 });
        localStorage.setItem('last_water_check', Date.now().toString());
        setCurrentBanner(null);
      }

      if (action === 'water_snooze') {
        localStorage.setItem('water_snooze', (Date.now() + 30 * 60 * 1000).toString());
        setCurrentBanner(null);
      }

      if (action === 'go_to_weight') {
        setActiveTab('overview');
        setCurrentBanner(null);
      }

      if (action === 'go_to_analysis') {
        setActiveTab('coach');
        setCurrentBanner(null);
      }

      if (action === 'go_to_measurements') {
        setActiveTab('gym');
        setCurrentBanner(null);
      }

      if (action === 'go_to_monthly_analysis') {
        setActiveTab('coach');
        setCurrentBanner(null);
      }
    },
    [log, updateLog]
  );

  const handleBannerDismiss = () => {
    setBannerSnoozed(currentBanner);
    setCurrentBanner(null);
  };

  if (baselineLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasBaseline) {
    return <SetupScreen onSetupComplete={() => window.location.reload()} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'gym':
        return <GymSleepTab />;
      case 'progress':
        return <ProgressTab />;
      case 'coach':
        return <CoachTab />;
      case 'settings':
        return <SettingsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header dayNum={dayNum} workoutLabel={todayWorkout?.label || 'Loading...'} />
      <main>{renderTab()}</main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
