import { useState, useEffect } from 'react';
import { Save, Bell, Droplets, Moon, Flame, Beef } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import type { UserSettings } from '../../hooks/useSettings';

export function SettingsTab() {
  const { settings, loading, updateSettings } = useSettings();
  const [form, setForm] = useState({
    calorie_target: 1824,
    protein_target: 169,
    water_target: 4000,
    sleep_target: 7.0,
    notification_meals: true,
    notification_water: true,
    notification_measurements: true,
    water_reminder_hours: 2,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        calorie_target: settings.calorie_target,
        protein_target: settings.protein_target,
        water_target: settings.water_target,
        sleep_target: settings.sleep_target,
        notification_meals: settings.notification_meals,
        notification_water: settings.notification_water,
        notification_measurements: settings.notification_measurements,
        water_reminder_hours: settings.water_reminder_hours,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(form as Partial<UserSettings>);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-28 space-y-4">
      {/* Daily Targets */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <h3 className="text-xs text-slate-400 mb-3">Daily Targets</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block">Calories (kcal)</label>
              <input
                type="number"
                value={form.calorie_target}
                onChange={(e) => setForm({ ...form, calorie_target: Number(e.target.value) })}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Beef className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block">Protein (g)</label>
              <input
                type="number"
                value={form.protein_target}
                onChange={(e) => setForm({ ...form, protein_target: Number(e.target.value) })}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block">Water (ml)</label>
              <input
                type="number"
                value={form.water_target}
                onChange={(e) => setForm({ ...form, water_target: Number(e.target.value) })}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block">Sleep (hours)</label>
              <input
                type="number"
                step="0.5"
                value={form.sleep_target}
                onChange={(e) => setForm({ ...form, sleep_target: Number(e.target.value) })}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs text-slate-400">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'notification_meals' as const, label: 'Meal reminders' },
            { key: 'notification_water' as const, label: 'Water reminders' },
            { key: 'notification_measurements' as const, label: 'Monthly measurement reminder' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-white">{label}</span>
              <button
                onClick={() => setForm({ ...form, [key]: !form[key] })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  form[key] ? 'bg-emerald-400' : 'bg-[#1e1e2e]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    form[key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}

          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Water reminder interval (hours)</label>
            <input
              type="number"
              value={form.water_reminder_hours}
              onChange={(e) => setForm({ ...form, water_reminder_hours: Number(e.target.value) })}
              className="w-20 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-400 text-[#0a0a0f] text-sm font-medium rounded-xl hover:bg-emerald-300 transition-colors"
      >
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
