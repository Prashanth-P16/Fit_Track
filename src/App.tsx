import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Header } from './components/ui/Header';
import { TabBar, type TabId } from './components/ui/TabBar';
import { AuthScreen } from './components/ui/AuthScreen';
import { OverviewTab } from './components/tabs/OverviewTab';
import { GymSleepTab } from './components/tabs/GymSleepTab';
import { ProgressTab } from './components/tabs/ProgressTab';
import { CoachTab } from './components/tabs/CoachTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { useDay } from './hooks/useDay';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <MainApp activeTab={activeTab} onTabChange={setActiveTab} />;
}

function MainApp({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (t: TabId) => void }) {
  const { dayNum, todayWorkout } = useDay();

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
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
