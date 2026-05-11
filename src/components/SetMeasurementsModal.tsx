import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SetMeasurementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SetMeasurementsModal({ isOpen, onClose, onSave }: SetMeasurementsModalProps) {
  const [loading, setLoading] = useState(false);
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

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update the baseline_data record with measurements
      const { error } = await supabase
        .from('baseline_data')
        .update({
          waist: measurements.waist ? parseFloat(measurements.waist) : null,
          hips: measurements.hips ? parseFloat(measurements.hips) : null,
          chest: measurements.chest ? parseFloat(measurements.chest) : null,
          thighs: measurements.thighs ? parseFloat(measurements.thighs) : null,
          biceps: measurements.biceps ? parseFloat(measurements.biceps) : null,
          forearms: measurements.forearms ? parseFloat(measurements.forearms) : null,
          calves: measurements.calves ? parseFloat(measurements.calves) : null,
          shoulders: measurements.shoulders ? parseFloat(measurements.shoulders) : null,
          neck: measurements.neck ? parseFloat(measurements.neck) : null,
        })
        .limit(1);

      if (error) throw error;
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#12121a] border-b border-[#1e1e2e] flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-white">Set Measurements</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-400">Enter your body measurements in centimeters.</p>
          
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
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:border-[#00e5a0]/50 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1e1e2e] p-4 space-y-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#00e5a0] hover:bg-[#00d491] text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Measurements'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-[#12121a] hover:bg-[#1e1e2e] text-white font-semibold py-3 rounded-lg transition-colors border border-[#1e1e2e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
