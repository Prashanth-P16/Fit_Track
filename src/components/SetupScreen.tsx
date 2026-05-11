import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SetupScreenProps {
  onSetupComplete: () => void;
}

export function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState('');
  const [measurements, setMeasurements] = useState({
    waist: '',
    hips: '',
    chest: '',
    thighs: '',
    biceps: '',
    forearms: '',
    calves: '',
    shoulders: '',
    neck: '',
  });

  const measurementLabels = {
    waist: 'Waist (at navel)',
    hips: 'Hips (widest part)',
    chest: 'Chest (at nipple line)',
    thighs: 'Thighs (mid thigh)',
    biceps: 'Biceps (flexed)',
    forearms: 'Forearms (below elbow)',
    calves: 'Calves (widest)',
    shoulders: 'Shoulders (widest)',
    neck: 'Neck (mid neck)',
  };

  const handleNextStep = () => {
    if (weight.trim()) {
      setStep(2);
    }
  };

  const handleSaveBaseline = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('baseline_data')
        .insert([{
          date: today,
          weight: parseFloat(weight),
          waist: measurements.waist ? parseFloat(measurements.waist) : null,
          hips: measurements.hips ? parseFloat(measurements.hips) : null,
          chest: measurements.chest ? parseFloat(measurements.chest) : null,
          thighs: measurements.thighs ? parseFloat(measurements.thighs) : null,
          biceps: measurements.biceps ? parseFloat(measurements.biceps) : null,
          forearms: measurements.forearms ? parseFloat(measurements.forearms) : null,
          calves: measurements.calves ? parseFloat(measurements.calves) : null,
          shoulders: measurements.shoulders ? parseFloat(measurements.shoulders) : null,
          neck: measurements.neck ? parseFloat(measurements.neck) : null,
        }]);

      if (error) throw error;
      onSetupComplete();
    } catch (error) {
      console.error('Error saving baseline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipMeasurements = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('baseline_data')
        .insert([{
          date: today,
          weight: parseFloat(weight),
          waist: null,
          hips: null,
          chest: null,
          thighs: null,
          biceps: null,
          forearms: null,
          calves: null,
          shoulders: null,
          neck: null,
        }]);

      if (error) throw error;
      onSetupComplete();
    } catch (error) {
      console.error('Error saving baseline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-4xl font-bold">
            Fit<span className="text-[#00e5a0]">Track</span>
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome to FitTrack 💪</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Let's capture your starting point before we begin. This becomes your permanent baseline
              to measure all future progress.
            </p>
          </div>

          {/* Weight Input */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 block">Starting Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="82.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-[#12121a] border border-[#1e1e2e] rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-[#00e5a0]/50 focus:outline-none"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextStep}
            disabled={!weight.trim()}
            className="w-full bg-[#00e5a0] hover:bg-[#00d491] text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col px-4 pb-20">
      {/* Header */}
      <div className="pt-8 mb-6">
        <h1 className="text-2xl font-bold">Day 1 Measurements</h1>
        <p className="text-slate-400 text-sm mt-2">
          Optional but highly recommended. These are your permanent baseline — compared every month to show
          your progress.
        </p>
      </div>

      {/* Measurements Grid */}
      <div className="space-y-4 flex-1">
        {Object.entries(measurementLabels).map(([key, label]) => (
          <div key={key}>
            <label className="text-xs text-slate-400 block mb-1">{label} (cm)</label>
            <input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={measurements[key as keyof typeof measurements]}
              onChange={(e) =>
                setMeasurements({ ...measurements, [key]: e.target.value })
              }
              className="w-full bg-[#12121a] border border-[#1e1e2e] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:border-[#00e5a0]/50 focus:outline-none"
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="space-y-3 fixed bottom-0 left-0 right-0 px-4 py-4 bg-[#0a0a0f] border-t border-[#1e1e2e]">
        <button
          onClick={handleSaveBaseline}
          disabled={loading}
          className="w-full bg-[#00e5a0] hover:bg-[#00d491] text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Baseline'
          )}
        </button>
        <button
          onClick={handleSkipMeasurements}
          disabled={loading}
          className="w-full bg-[#12121a] hover:bg-[#1e1e2e] text-white font-semibold py-3 rounded-lg transition-colors border border-[#1e1e2e] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
