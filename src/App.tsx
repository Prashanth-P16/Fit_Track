import { useState, useEffect } from 'react';
import { Header } from './components/ui/Header';
import { TabBar, type TabId } from './components/ui/TabBar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { GymSleepTab } from './components/tabs/GymSleepTab';
import { ProgressTab } from './components/tabs/ProgressTab';
import { CoachTab } from './components/tabs/CoachTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { useDay } from './hooks/useDay';
import { useNotifications } from './hooks/useNotifications';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { dayNum, todayWorkout, isRestDay } = useDay();
  const { permission, requestPermission, scheduleAll, supported } = useNotifications();

  useEffect(() => {
    if (!supported) return;
    const init = async () => {
      let granted = permission === 'granted';
      if (!granted) {
        granted = await requestPermission();
      }
      if (granted) {
        scheduleAll(isRestDay);
      }
    };
    init();
  }, []);

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
